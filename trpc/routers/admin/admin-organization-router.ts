import { TRPCError } from "@trpc/server";
import {
	and,
	asc,
	count,
	desc,
	eq,
	getTableColumns,
	gt,
	gte,
	ilike,
	inArray,
	lte,
	or,
	sql,
} from "drizzle-orm";
import { headers } from "next/headers";
import Papa from "papaparse";
import type { z } from "zod/v4";
import { appConfig } from "@/config/app.config";
import { auth } from "@/lib/auth";
import { adjustCredits as adjustCreditsLib } from "@/lib/billing/credits";
import { getOrganizationPlanLimits } from "@/lib/billing/guards";
import { syncOrganizationSeats } from "@/lib/billing/seat-sync";
import {
	cancelSubscriptionAtPeriodEnd,
	cancelSubscriptionImmediately,
} from "@/lib/billing/subscriptions";
import {
	syncOrganizationOrders,
	syncOrganizationSubscriptions,
} from "@/lib/billing/sync";
import {
	creditBalanceTable,
	db,
	invitationTable,
	memberTable,
	organizationTable,
	subscriptionTable,
} from "@/lib/db";
import { InvitationStatus, MemberRole } from "@/lib/db/schema/enums";
import { sendOrganizationInvitationEmail } from "@/lib/email";
import { LoggerFactory } from "@/lib/logger/factory";
import { generateOrganizationSlug } from "@/lib/organizations/generate-organization-slug";
import { getBaseUrl } from "@/lib/utils";
import {
	adjustCreditsAdminSchema,
	cancelSubscriptionAdminSchema,
	createOrganizationFromContactAdminSchema,
	deleteOrganizationAdminSchema,
	exportOrganizationsAdminSchema,
	importContactsFromCsvAdminSchema,
	inviteContactOwnerAdminSchema,
	listMyContactsAdminSchema,
	listOrganizationsAdminSchema,
	updateContactCrmAdminSchema,
} from "@/schemas/admin-organization-schemas";
import { createTRPCRouter, protectedAdminProcedure } from "@/trpc/init";

const logger = LoggerFactory.getLogger("admin-organization");

function parseOrganizationMetadata(
	raw: string | null,
): Record<string, unknown> {
	if (!raw) {
		return {};
	}
	try {
		const parsed: unknown = JSON.parse(raw);
		return typeof parsed === "object" &&
			parsed !== null &&
			!Array.isArray(parsed)
			? (parsed as Record<string, unknown>)
			: {};
	} catch {
		return {};
	}
}

type CreateContactOrgInput = z.infer<
	typeof createOrganizationFromContactAdminSchema
>;

type CreatedContactOrganization = NonNullable<
	Awaited<ReturnType<typeof auth.api.createOrganization>>
>;

async function createOrganizationFromContactForAdmin(
	adminUserId: string,
	input: CreateContactOrgInput,
): Promise<
	| { ok: true; organization: CreatedContactOrganization }
	| { ok: false; error: string }
> {
	const organization = await auth.api.createOrganization({
		headers: await headers(),
		body: {
			name: input.businessName,
			slug: await generateOrganizationSlug(input.businessName),
			metadata: {
				websiteUrl: input.websiteUrl,
				mailingAddress: input.mailingAddress,
				createdFromAdminContacts: true,
				createdByAdminUserId: adminUserId,
				crmClaimStatus: "unclaimed",
				directMailStatus: "not_sent",
			},
		},
	});

	if (!organization) {
		return { ok: false, error: "Failed to create organization" };
	}

	try {
		await db
			.insert(creditBalanceTable)
			.values({ organizationId: organization.id })
			.onConflictDoNothing();
	} catch (error) {
		logger.warn(
			{ organizationId: organization.id, error },
			"Failed to initialize credit balance for new organization",
		);
	}

	await db
		.update(memberTable)
		.set({ role: MemberRole.account_manager })
		.where(
			and(
				eq(memberTable.organizationId, organization.id),
				eq(memberTable.userId, adminUserId),
			),
		);

	return { ok: true, organization };
}

export const adminOrganizationRouter = createTRPCRouter({
	list: protectedAdminProcedure
		.input(listOrganizationsAdminSchema)
		.query(async ({ input }) => {
			// Subquery to get the most relevant subscription for each organization
			// DISTINCT ON (organizationId) ensures we only join one subscription per org
			const relevantSubscriptions = db
				.selectDistinctOn([subscriptionTable.organizationId], {
					organizationId: subscriptionTable.organizationId,
					id: subscriptionTable.id,
					status: subscriptionTable.status,
					stripePriceId: subscriptionTable.stripePriceId,
					interval: subscriptionTable.interval,
					trialEnd: subscriptionTable.trialEnd,
					cancelAtPeriodEnd: subscriptionTable.cancelAtPeriodEnd,
				})
				.from(subscriptionTable)
				.orderBy(
					subscriptionTable.organizationId,
					desc(subscriptionTable.createdAt),
				)
				.as("relevant_subscriptions");

			// Subquery for member counts - efficient grouping
			const membersCountSubquery = db
				.select({
					organizationId: memberTable.organizationId,
					count: count().as("count"),
				})
				.from(memberTable)
				.groupBy(memberTable.organizationId)
				.as("members_counts");

			const conditions = [];

			if (input.query) {
				conditions.push(ilike(organizationTable.name, `%${input.query}%`));
			}

			if (
				input.filters?.membersCount &&
				input.filters.membersCount.length > 0
			) {
				const memberCountConditions = input.filters.membersCount
					.map((range) => {
						switch (range) {
							case "0":
								return or(
									sql`${membersCountSubquery.count} = 0`,
									sql`${membersCountSubquery.count} IS NULL`,
								);
							case "1-5":
								return and(
									gte(membersCountSubquery.count, 1),
									lte(membersCountSubquery.count, 5),
								);
							case "6-10":
								return and(
									gte(membersCountSubquery.count, 6),
									lte(membersCountSubquery.count, 10),
								);
							case "11+":
								return gt(membersCountSubquery.count, 10);
							default:
								return null;
						}
					})
					.filter((v): v is NonNullable<typeof v> => v !== null);

				if (memberCountConditions.length > 0) {
					conditions.push(or(...memberCountConditions));
				}
			}

			if (
				input.filters?.subscriptionStatus &&
				input.filters.subscriptionStatus.length > 0
			) {
				conditions.push(
					inArray(
						relevantSubscriptions.status,
						input.filters.subscriptionStatus,
					),
				);
			}

			if (
				input.filters?.subscriptionInterval &&
				input.filters.subscriptionInterval.length > 0
			) {
				conditions.push(
					inArray(
						relevantSubscriptions.interval,
						input.filters.subscriptionInterval,
					),
				);
			}

			if (
				input.filters?.balanceRange &&
				input.filters.balanceRange.length > 0
			) {
				const balanceConditions = input.filters.balanceRange
					.map((range) => {
						switch (range) {
							case "zero":
								return eq(creditBalanceTable.balance, 0);
							case "low":
								return and(
									gte(creditBalanceTable.balance, 1),
									lte(creditBalanceTable.balance, 1000),
								);
							case "medium":
								return and(
									gte(creditBalanceTable.balance, 1001),
									lte(creditBalanceTable.balance, 50000),
								);
							case "high":
								return gte(creditBalanceTable.balance, 50001);
							default:
								return null;
						}
					})
					.filter((v): v is NonNullable<typeof v> => v !== null);

				if (balanceConditions.length > 0) {
					conditions.push(or(...balanceConditions));
				}
			}

			if (input.filters?.createdAt && input.filters.createdAt.length > 0) {
				const dateConditions = input.filters.createdAt
					.map((range) => {
						const now = new Date();
						switch (range) {
							case "today": {
								const todayStart = new Date(
									now.getFullYear(),
									now.getMonth(),
									now.getDate(),
								);
								const todayEnd = new Date(
									now.getFullYear(),
									now.getMonth(),
									now.getDate() + 1,
								);
								return and(
									gte(organizationTable.createdAt, todayStart),
									lte(organizationTable.createdAt, todayEnd),
								);
							}
							case "this-week": {
								const weekStart = new Date(
									now.getFullYear(),
									now.getMonth(),
									now.getDate() - now.getDay(),
								);
								return gte(organizationTable.createdAt, weekStart);
							}
							case "this-month": {
								const monthStart = new Date(
									now.getFullYear(),
									now.getMonth(),
									1,
								);
								return gte(organizationTable.createdAt, monthStart);
							}
							case "older": {
								const monthAgo = new Date(
									now.getFullYear(),
									now.getMonth() - 1,
									now.getDate(),
								);
								return lte(organizationTable.createdAt, monthAgo);
							}
							default:
								return null;
						}
					})
					.filter((v): v is NonNullable<typeof v> => v !== null);

				if (dateConditions.length > 0) {
					conditions.push(or(...dateConditions));
				}
			}

			const whereCondition =
				conditions.length > 0 ? and(...conditions) : undefined;

			// Build sort order
			const sortDirection = input.sortOrder === "desc" ? desc : asc;

			const orderByClause =
				input.sortBy === "membersCount"
					? sortDirection(sql`COALESCE(${membersCountSubquery.count}, 0)`)
					: input.sortBy === "createdAt"
						? sortDirection(organizationTable.createdAt)
						: sortDirection(organizationTable.name);

			const organizations = await db
				.select({
					...getTableColumns(organizationTable),
					membersCount: sql<number>`COALESCE(${membersCountSubquery.count}, 0)`,
					pendingInvites: db
						.$count(
							invitationTable,
							and(
								eq(invitationTable.organizationId, organizationTable.id),
								eq(invitationTable.status, "pending"),
							),
						)
						.as("pendingInvites"),
					subscriptionStatus: relevantSubscriptions.status,
					subscriptionPlan: relevantSubscriptions.stripePriceId,
					subscriptionId: relevantSubscriptions.id,
					trialEnd: relevantSubscriptions.trialEnd,
					cancelAtPeriodEnd: relevantSubscriptions.cancelAtPeriodEnd,
					credits: creditBalanceTable.balance,
				})
				.from(organizationTable)
				.leftJoin(
					relevantSubscriptions,
					eq(relevantSubscriptions.organizationId, organizationTable.id),
				)
				.leftJoin(
					creditBalanceTable,
					eq(creditBalanceTable.organizationId, organizationTable.id),
				)
				.leftJoin(
					membersCountSubquery,
					eq(membersCountSubquery.organizationId, organizationTable.id),
				)
				.where(whereCondition)
				.limit(input.limit)
				.offset(input.offset)
				.orderBy(orderByClause);

			const total = await db
				.select({ count: count() })
				.from(organizationTable)
				.where(whereCondition);

			return { organizations, total: total[0]?.count || 0 };
		}),
	createFromContact: protectedAdminProcedure
		.input(createOrganizationFromContactAdminSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await createOrganizationFromContactForAdmin(
				ctx.user.id,
				input,
			);
			if (!result.ok) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: result.error,
				});
			}
			return result.organization;
		}),
	importContactsFromCsv: protectedAdminProcedure
		.input(importContactsFromCsvAdminSchema)
		.mutation(async ({ ctx, input }) => {
			const MAX_ROWS = 500;

			const parsed = Papa.parse<Record<string, unknown>>(input.csvText, {
				header: true,
				skipEmptyLines: "greedy",
				transformHeader: (h) =>
					h
						.trim()
						.toLowerCase()
						.replace(/\s+/g, "_")
						.replace(/[^a-z0-9_]/g, ""),
			});

			if (parsed.errors.length > 0) {
				const first = parsed.errors[0];
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: first?.message ?? "Invalid CSV",
				});
			}

			const rows = parsed.data.filter(
				(r) => r && typeof r === "object" && !Array.isArray(r),
			) as Record<string, unknown>[];

			if (rows.length === 0) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message:
						"No data rows found. Include a header row and at least one row.",
				});
			}

			if (rows.length > MAX_ROWS) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: `Too many rows (max ${MAX_ROWS}).`,
				});
			}

			function cell(row: Record<string, unknown>, ...keys: string[]): string {
				for (const key of keys) {
					const v = row[key];
					if (typeof v === "string" && v.trim() !== "") {
						return v.trim();
					}
					if (typeof v === "number" && !Number.isNaN(v)) {
						return String(v);
					}
				}
				return "";
			}

			const createdNames: string[] = [];
			const failures: {
				rowNumber: number;
				message: string;
				businessName?: string;
			}[] = [];

			for (let i = 0; i < rows.length; i++) {
				const rowNumber = i + 2;
				const row = rows[i]!;

				const businessName = cell(
					row,
					"business_name",
					"company",
					"name",
					"organization",
					"org",
				);
				const websiteUrl = cell(row, "website_url", "website", "url", "site");
				const mailingAddress = cell(
					row,
					"mailing_address",
					"address",
					"mailing",
					"street",
				);

				if (!businessName && !websiteUrl && !mailingAddress) {
					continue;
				}

				const validated = createOrganizationFromContactAdminSchema.safeParse({
					businessName,
					websiteUrl,
					mailingAddress,
				});

				if (!validated.success) {
					const issue = validated.error.issues[0];
					failures.push({
						rowNumber,
						message: issue?.message ?? "Validation failed",
						businessName: businessName || undefined,
					});
					continue;
				}

				const result = await createOrganizationFromContactForAdmin(
					ctx.user.id,
					validated.data,
				);

				if (!result.ok) {
					failures.push({
						rowNumber,
						message: result.error,
						businessName: validated.data.businessName,
					});
					continue;
				}

				createdNames.push(result.organization.name);
			}

			if (createdNames.length === 0 && failures.length === 0) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message:
						"No importable rows. Use a header row and fill business name, website URL, and mailing address for each contact.",
				});
			}

			return {
				createdCount: createdNames.length,
				createdNames,
				failures,
			};
		}),
	/**
	 * Invite an organization owner for a CRM contact-import org. Uses server-side DB +
	 * email because Better Auth's `/organization/invite-member` rejects inviting `owner`
	 * unless the inviter's `member.role` is exactly the configured `creatorRole` (`owner`),
	 * which excludes `account_manager` CRM staff.
	 */
	inviteContactOwner: protectedAdminProcedure
		.input(inviteContactOwnerAdminSchema)
		.mutation(async ({ ctx, input }) => {
			const email = input.email.toLowerCase();

			const org = await db.query.organizationTable.findFirst({
				where: (t, { eq: eqFn }) => eqFn(t.id, input.organizationId),
			});

			if (!org) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Organization not found",
				});
			}

			const meta = parseOrganizationMetadata(org.metadata);
			const isContactImport =
				meta.createdFromAdminContacts === true ||
				meta.createdFromAdminContacts === "true";

			if (!isContactImport) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message:
						"Owner invites from the CRM are only allowed for contact-import organizations.",
				});
			}

			const existingUser = await db.query.userTable.findFirst({
				where: (u, { eq: eqFn }) => eqFn(u.email, email),
			});

			if (existingUser) {
				const existingMember = await db.query.memberTable.findFirst({
					where: (m, { and: andFn, eq: eqFn }) =>
						andFn(
							eqFn(m.organizationId, input.organizationId),
							eqFn(m.userId, existingUser.id),
						),
				});

				if (existingMember) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "User is already a member of this organization.",
					});
				}
			}

			const pendingInvite = await db.query.invitationTable.findFirst({
				where: (inv, { and: andFn, eq: eqFn }) =>
					andFn(
						eqFn(inv.organizationId, input.organizationId),
						eqFn(inv.email, email),
						eqFn(inv.status, InvitationStatus.pending),
					),
			});

			if (pendingInvite) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "User is already invited to this organization.",
				});
			}

			const [currentMembers, pendingInvitations, planLimits] =
				await Promise.all([
					db
						.select({ id: memberTable.id })
						.from(memberTable)
						.where(eq(memberTable.organizationId, input.organizationId)),
					db
						.select({ id: invitationTable.id })
						.from(invitationTable)
						.where(
							and(
								eq(invitationTable.organizationId, input.organizationId),
								eq(invitationTable.status, InvitationStatus.pending),
							),
						),
					getOrganizationPlanLimits(input.organizationId),
				]);

			const totalPotentialMembers =
				currentMembers.length + pendingInvitations.length;

			if (
				planLimits.maxMembers !== -1 &&
				totalPotentialMembers >= planLimits.maxMembers
			) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: `You have reached the maximum number of team members (${planLimits.maxMembers}) for this organization's plan.`,
				});
			}

			const expiresAt = new Date(Date.now() + 48 * 3600 * 1000);

			const [invitation] = await db
				.insert(invitationTable)
				.values({
					organizationId: input.organizationId,
					email,
					role: MemberRole.owner,
					status: InvitationStatus.pending,
					expiresAt,
					inviterId: ctx.user.id,
				})
				.returning({ id: invitationTable.id });

			if (!invitation?.id) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create invitation",
				});
			}

			try {
				await syncOrganizationSeats(input.organizationId);
			} catch (error) {
				logger.warn(
					{ organizationId: input.organizationId, error },
					"Failed to sync seats after admin CRM owner invite",
				);
			}

			const url = new URL(
				existingUser ? "/auth/sign-in" : "/auth/sign-up",
				getBaseUrl(),
			);
			url.searchParams.set("invitationId", invitation.id);
			url.searchParams.set("email", email);

			await sendOrganizationInvitationEmail({
				recipient: email,
				appName: appConfig.appName,
				organizationName: org.name,
				invitedByEmail: ctx.user.email ?? "",
				invitedByName: ctx.user.name ?? "",
				inviteLink: url.toString(),
			});

			return { invitationId: invitation.id };
		}),
	listMyContacts: protectedAdminProcedure
		.input(listMyContactsAdminSchema)
		.query(async ({ ctx, input }) => {
			const conditions = [
				sql`(coalesce(${organizationTable.metadata}, '{}'))::jsonb->>'createdFromAdminContacts' = 'true'`,
				sql`(coalesce(${organizationTable.metadata}, '{}'))::jsonb->>'createdByAdminUserId' = ${ctx.user.id}`,
			];

			if (input.query?.trim()) {
				conditions.push(
					ilike(organizationTable.name, `%${input.query.trim()}%`),
				);
			}

			if (
				input.filters?.crmClaimStatus &&
				input.filters.crmClaimStatus.length > 0
			) {
				conditions.push(
					or(
						...input.filters.crmClaimStatus.map(
							(s) =>
								sql`(coalesce(${organizationTable.metadata}, '{}'))::jsonb->>'crmClaimStatus' = ${s}`,
						),
					)!,
				);
			}

			if (
				input.filters?.directMailStatus &&
				input.filters.directMailStatus.length > 0
			) {
				conditions.push(
					or(
						...input.filters.directMailStatus.map(
							(s) =>
								sql`(coalesce(${organizationTable.metadata}, '{}'))::jsonb->>'directMailStatus' = ${s}`,
						),
					)!,
				);
			}

			const whereCondition = and(...conditions);

			const sortDirection = input.sortOrder === "desc" ? desc : asc;
			const orderByClause =
				input.sortBy === "createdAt"
					? sortDirection(organizationTable.createdAt)
					: sortDirection(organizationTable.name);

			const orgRows = await db
				.select(getTableColumns(organizationTable))
				.from(organizationTable)
				.where(whereCondition)
				.limit(input.limit)
				.offset(input.offset)
				.orderBy(orderByClause);

			const total = await db
				.select({ count: count() })
				.from(organizationTable)
				.where(whereCondition);

			const orgIds = orgRows.map((r) => r.id);
			const ownerOrgIds =
				orgIds.length > 0
					? await db
							.selectDistinct({ organizationId: memberTable.organizationId })
							.from(memberTable)
							.where(
								and(
									inArray(memberTable.organizationId, orgIds),
									eq(memberTable.role, MemberRole.owner),
								),
							)
					: [];

			const ownerSet = new Set(ownerOrgIds.map((r) => r.organizationId));

			const contacts = orgRows.map((row) => {
				const meta = parseOrganizationMetadata(row.metadata);
				const claimRaw = meta.crmClaimStatus;
				const mailRaw = meta.directMailStatus;
				return {
					id: row.id,
					name: row.name,
					createdAt: row.createdAt,
					hasOrgOwner: ownerSet.has(row.id),
					websiteUrl:
						typeof meta.websiteUrl === "string" ? meta.websiteUrl : "",
					mailingAddress:
						typeof meta.mailingAddress === "string" ? meta.mailingAddress : "",
					crmClaimStatus:
						claimRaw === "claimed" || claimRaw === "unclaimed"
							? claimRaw
							: "unclaimed",
					directMailStatus:
						mailRaw === "not_sent" ||
						mailRaw === "queued" ||
						mailRaw === "sent" ||
						mailRaw === "returned"
							? mailRaw
							: "not_sent",
				};
			});

			return { contacts, total: total[0]?.count ?? 0 };
		}),
	updateContactCrm: protectedAdminProcedure
		.input(updateContactCrmAdminSchema)
		.mutation(async ({ ctx, input }) => {
			const org = await db.query.organizationTable.findFirst({
				where: (t, { eq: eqFn }) => eqFn(t.id, input.organizationId),
			});

			if (!org) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Organization not found",
				});
			}

			const meta = parseOrganizationMetadata(org.metadata);

			const isContactImport =
				meta.createdFromAdminContacts === true ||
				meta.createdFromAdminContacts === "true";

			if (meta.createdByAdminUserId !== ctx.user.id || !isContactImport) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You cannot update this contact",
				});
			}

			const next: Record<string, unknown> = {
				...meta,
				directMailStatus: input.directMailStatus,
			};

			if (Object.keys(next).length > 20) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Organization metadata exceeds maximum keys",
				});
			}

			await db
				.update(organizationTable)
				.set({
					metadata: JSON.stringify(next),
					updatedAt: new Date(),
				})
				.where(eq(organizationTable.id, input.organizationId));

			return { success: true as const };
		}),
	delete: protectedAdminProcedure
		.input(deleteOrganizationAdminSchema)
		.mutation(async ({ input }) => {
			await db
				.delete(organizationTable)
				.where(eq(organizationTable.id, input.id));
		}),
	exportSelectedToCsv: protectedAdminProcedure
		.input(exportOrganizationsAdminSchema)
		.mutation(async ({ input }) => {
			// Subquery to get the most relevant subscription for each organization
			const relevantSubscriptions = db
				.selectDistinctOn([subscriptionTable.organizationId], {
					organizationId: subscriptionTable.organizationId,
					status: subscriptionTable.status,
					stripePriceId: subscriptionTable.stripePriceId,
				})
				.from(subscriptionTable)
				.orderBy(
					subscriptionTable.organizationId,
					desc(subscriptionTable.createdAt),
				)
				.as("relevant_subscriptions");

			// Subquery for member counts
			const membersCountSubquery = db
				.select({
					organizationId: memberTable.organizationId,
					count: count().as("count"),
				})
				.from(memberTable)
				.groupBy(memberTable.organizationId)
				.as("members_counts");

			const organizations = await db
				.select({
					id: organizationTable.id,
					name: organizationTable.name,
					membersCount: sql<number>`COALESCE(${membersCountSubquery.count}, 0)`,
					pendingInvites: db
						.$count(
							invitationTable,
							and(
								eq(invitationTable.organizationId, organizationTable.id),
								eq(invitationTable.status, "pending"),
							),
						)
						.as("pendingInvites"),
					subscriptionStatus: relevantSubscriptions.status,
					subscriptionPlan: relevantSubscriptions.stripePriceId,
					credits: creditBalanceTable.balance,
					createdAt: organizationTable.createdAt,
					updatedAt: organizationTable.updatedAt,
				})
				.from(organizationTable)
				.leftJoin(
					relevantSubscriptions,
					eq(relevantSubscriptions.organizationId, organizationTable.id),
				)
				.leftJoin(
					creditBalanceTable,
					eq(creditBalanceTable.organizationId, organizationTable.id),
				)
				.leftJoin(
					membersCountSubquery,
					eq(membersCountSubquery.organizationId, organizationTable.id),
				)
				.where(inArray(organizationTable.id, input.organizationIds));

			const Papa = await import("papaparse");
			const csv = Papa.unparse(organizations);
			return csv;
		}),
	exportSelectedToExcel: protectedAdminProcedure
		.input(exportOrganizationsAdminSchema)
		.mutation(async ({ input }) => {
			// Subquery to get the most relevant subscription for each organization
			const relevantSubscriptions = db
				.selectDistinctOn([subscriptionTable.organizationId], {
					organizationId: subscriptionTable.organizationId,
					status: subscriptionTable.status,
					stripePriceId: subscriptionTable.stripePriceId,
				})
				.from(subscriptionTable)
				.orderBy(
					subscriptionTable.organizationId,
					desc(subscriptionTable.createdAt),
				)
				.as("relevant_subscriptions");

			// Subquery for member counts
			const membersCountSubquery = db
				.select({
					organizationId: memberTable.organizationId,
					count: count().as("count"),
				})
				.from(memberTable)
				.groupBy(memberTable.organizationId)
				.as("members_counts");

			const organizations = await db
				.select({
					id: organizationTable.id,
					name: organizationTable.name,
					membersCount: sql<number>`COALESCE(${membersCountSubquery.count}, 0)`,
					pendingInvites: db
						.$count(
							invitationTable,
							and(
								eq(invitationTable.organizationId, organizationTable.id),
								eq(invitationTable.status, "pending"),
							),
						)
						.as("pendingInvites"),
					subscriptionStatus: relevantSubscriptions.status,
					subscriptionPlan: relevantSubscriptions.stripePriceId,
					credits: creditBalanceTable.balance,
					createdAt: organizationTable.createdAt,
					updatedAt: organizationTable.updatedAt,
				})
				.from(organizationTable)
				.leftJoin(
					relevantSubscriptions,
					eq(relevantSubscriptions.organizationId, organizationTable.id),
				)
				.leftJoin(
					creditBalanceTable,
					eq(creditBalanceTable.organizationId, organizationTable.id),
				)
				.leftJoin(
					membersCountSubquery,
					eq(membersCountSubquery.organizationId, organizationTable.id),
				)
				.where(inArray(organizationTable.id, input.organizationIds));

			const ExcelJS = await import("exceljs");
			const workbook = new ExcelJS.Workbook();
			const worksheet = workbook.addWorksheet("Organizations");

			if (organizations.length > 0) {
				const columns = [
					{ header: "ID", key: "id", width: 40 },
					{ header: "Name", key: "name", width: 30 },
					{ header: "Members", key: "membersCount", width: 15 },
					{ header: "Pending Invites", key: "pendingInvites", width: 15 },
					{ header: "Plan", key: "subscriptionPlan", width: 20 },
					{ header: "Status", key: "subscriptionStatus", width: 15 },
					{ header: "Credits", key: "credits", width: 15 },
					{ header: "Created At", key: "createdAt", width: 25 },
					{ header: "Updated At", key: "updatedAt", width: 25 },
				];
				worksheet.columns = columns;
				for (const org of organizations) {
					worksheet.addRow(org);
				}
			}

			const buffer = await workbook.xlsx.writeBuffer();
			const base64 = Buffer.from(buffer).toString("base64");
			return base64;
		}),
	/**
	 * Sync selected organizations' subscriptions from Stripe
	 * Fetches fresh data from Stripe based on customer ID and updates local database
	 */
	syncFromStripe: protectedAdminProcedure
		.input(exportOrganizationsAdminSchema)
		.mutation(async ({ input, ctx }) => {
			logger.info(
				{
					organizationIds: input.organizationIds,
					adminId: ctx.user.id,
				},
				"Admin triggered manual sync from Stripe",
			);

			const [subscriptionResult, orderResult] = await Promise.all([
				syncOrganizationSubscriptions(input.organizationIds),
				syncOrganizationOrders(input.organizationIds),
			]);

			// Granular logging of results
			const subFailures = subscriptionResult.results.filter((r) => !r.success);
			const orderFailures = orderResult.results.filter((r) => !r.success);

			if (subFailures.length > 0 || orderFailures.length > 0) {
				logger.warn(
					{
						subFailures: subFailures.map((r) => ({
							id: r.organizationId,
							error: r.error,
						})),
						orderFailures: orderFailures.map((r) => ({
							id: r.organizationId,
							error: r.error,
						})),
					},
					"Some organizations failed to sync from Stripe",
				);
			}

			if (subscriptionResult.successful > 0 || orderResult.successful > 0) {
				logger.info(
					{
						subscriptionsSynced: subscriptionResult.successful,
						ordersSynced: orderResult.successful,
					},
					"Stripe sync completed successfully for some/all organizations",
				);
			}

			return {
				subscriptions: subscriptionResult,
				orders: orderResult,
			};
		}),

	/**
	 * Adjust organization credits (admin action)
	 */
	adjustCredits: protectedAdminProcedure
		.input(adjustCreditsAdminSchema)
		.mutation(async ({ ctx, input }) => {
			// Verify organization exists
			const org = await db.query.organizationTable.findFirst({
				where: (t, { eq }) => eq(t.id, input.organizationId),
			});

			if (!org) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Organization not found",
				});
			}

			const transaction = await adjustCreditsLib({
				organizationId: input.organizationId,
				amount: input.amount,
				description: input.description,
				createdBy: ctx.user.id,
				metadata: {
					adjustedByAdmin: ctx.user.id,
					adjustedByEmail: ctx.user.email,
				},
			});

			return {
				success: true,
				newBalance: transaction.balanceAfter,
				transactionId: transaction.id,
			};
		}),

	/**
	 * Cancel an organization's subscription (admin action)
	 */
	cancelSubscription: protectedAdminProcedure
		.input(cancelSubscriptionAdminSchema)
		.mutation(async ({ input, ctx }) => {
			const { subscriptionId, immediate } = input;

			logger.info(
				{ subscriptionId, immediate, adminId: ctx.user.id },
				"Admin canceling subscription",
			);

			if (immediate) {
				await cancelSubscriptionImmediately(subscriptionId);
			} else {
				await cancelSubscriptionAtPeriodEnd(subscriptionId);
			}

			// The webhook will handle updating the local database

			return {
				success: true,
				immediate,
			};
		}),
});
