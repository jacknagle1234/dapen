import { count, eq } from "drizzle-orm";
import { db, memberTable, organizationTable } from "@/lib/db";
import { MemberRole } from "@/lib/db/schema/enums";
import { logger } from "@/lib/logger";

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

/**
 * When a member with org owner role joins a contact-import organization (and the org
 * already has more than one member), mark CRM claim as claimed (direct-mail workflow).
 * Skips the sole founding member: `createOrganization` assigns `owner` before the app
 * may downgrade CRM staff to `account_manager`. Never throws.
 */
export async function claimContactImportIfOwner(params: {
	organizationId: string;
	memberRole?: string | null;
	invitationRole?: string | null;
}): Promise<void> {
	const role = params.memberRole ?? params.invitationRole;
	if (role !== MemberRole.owner) {
		return;
	}

	try {
		const org = await db.query.organizationTable.findFirst({
			where: (t, { eq: eqFn }) => eqFn(t.id, params.organizationId),
		});

		if (!org) {
			return;
		}

		const meta = parseOrganizationMetadata(org.metadata);
		const isContactImport =
			meta.createdFromAdminContacts === true ||
			meta.createdFromAdminContacts === "true";

		if (!isContactImport) {
			return;
		}

		// `createOrganization` briefly adds the CRM user as `owner` before the app
		// downgrades them to `account_manager`. `afterAddMember` runs in that window and
		// would incorrectly claim. Only auto-claim when an owner is present alongside
		// at least one other member (real owner join / invite accept), not sole creator.
		const memberCountRow = await db
			.select({ memberCount: count() })
			.from(memberTable)
			.where(eq(memberTable.organizationId, params.organizationId));

		const memberCount = memberCountRow[0]?.memberCount ?? 0;
		if (memberCount <= 1) {
			return;
		}

		if (meta.crmClaimStatus === "claimed") {
			return;
		}

		const next: Record<string, unknown> = {
			...meta,
			crmClaimStatus: "claimed",
		};

		if (Object.keys(next).length > 20) {
			logger.warn(
				{ organizationId: params.organizationId },
				"Skipping contact claim: metadata would exceed key limit",
			);
			return;
		}

		await db
			.update(organizationTable)
			.set({
				metadata: JSON.stringify(next),
				updatedAt: new Date(),
			})
			.where(eq(organizationTable.id, params.organizationId));
	} catch (error) {
		logger.error(
			{
				organizationId: params.organizationId,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			"Failed to auto-claim contact import on owner join",
		);
	}
}
