import { APIError, getSessionFromCtx } from "better-auth/api";
import { and, eq } from "drizzle-orm";
import {
	isCustomerOwnerOnlyActor,
	isOrgRoleAccountManagerOrLegacyAdmin,
} from "@/lib/auth/organization-member-role-utils";
import { db } from "@/lib/db";
import { UserRole } from "@/lib/db/schema/enums";

function normalizedNewMemberRole(role: unknown): string {
	if (Array.isArray(role)) {
		return role.map(String).join(",");
	}
	return typeof role === "string" ? role : "";
}

/**
 * Org owners (without Account Manager) must not remove or demote Account Managers.
 * Platform `user.role === admin` bypasses. Enforced in global `hooks.before` because
 * Better Auth `organizationHooks.beforeRemoveMember` does not receive the acting user.
 */
export async function enforceOwnerCannotMutateAccountManager(ctx: {
	path: string;
	body: unknown;
}): Promise<void> {
	if (
		ctx.path !== "/organization/remove-member" &&
		ctx.path !== "/organization/update-member-role"
	) {
		return;
	}

	const body = ctx.body;
	if (!body || typeof body !== "object") {
		return;
	}

	const session = await getSessionFromCtx(ctx as never);
	if (!session?.user?.id) {
		return;
	}

	const sessionUser = session.user as { id: string; role?: string | null };
	if (sessionUser.role === UserRole.admin) {
		return;
	}

	const sessionRecord = session.session as
		| { activeOrganizationId?: string | null }
		| undefined;
	const organizationId =
		"organizationId" in body &&
		typeof (body as { organizationId?: string }).organizationId === "string"
			? (body as { organizationId: string }).organizationId
			: (sessionRecord?.activeOrganizationId ?? undefined);

	if (!organizationId) {
		return;
	}

	const actorRow = await db.query.memberTable.findFirst({
		where: (m, { and: andFn, eq: eqFn }) =>
			andFn(
				eqFn(m.userId, sessionUser.id),
				eqFn(m.organizationId, organizationId),
			),
	});

	if (!actorRow?.role || !isCustomerOwnerOnlyActor(actorRow.role as string)) {
		return;
	}

	if (ctx.path === "/organization/remove-member") {
		const memberIdOrEmail = (body as { memberIdOrEmail?: string })
			.memberIdOrEmail;
		if (!memberIdOrEmail) {
			return;
		}

		let targetRow: typeof actorRow | null = null;
		if (memberIdOrEmail.includes("@")) {
			const invitedUser = await db.query.userTable.findFirst({
				where: (u, { eq: eqFn }) => eqFn(u.email, memberIdOrEmail),
			});
			if (!invitedUser) {
				return;
			}
			targetRow =
				(await db.query.memberTable.findFirst({
					where: (m, { and: andFn, eq: eqFn }) =>
						andFn(
							eqFn(m.organizationId, organizationId),
							eqFn(m.userId, invitedUser.id),
						),
				})) ?? null;
		} else {
			targetRow =
				(await db.query.memberTable.findFirst({
					where: (m, { and: andFn, eq: eqFn }) =>
						andFn(
							eqFn(m.id, memberIdOrEmail),
							eqFn(m.organizationId, organizationId),
						),
				})) ?? null;
		}

		if (
			targetRow?.role &&
			isOrgRoleAccountManagerOrLegacyAdmin(targetRow.role as string)
		) {
			throw new APIError("FORBIDDEN", {
				message:
					"Organization owners cannot remove an Account Manager from the organization.",
			});
		}
		return;
	}

	// update-member-role
	const memberId = (body as { memberId?: string }).memberId;
	if (!memberId) {
		return;
	}

	const targetRow = await db.query.memberTable.findFirst({
		where: (m, { and: andFn, eq: eqFn }) =>
			andFn(eqFn(m.id, memberId), eqFn(m.organizationId, organizationId)),
	});

	if (
		!targetRow?.role ||
		!isOrgRoleAccountManagerOrLegacyAdmin(targetRow.role as string)
	) {
		return;
	}

	const newRole = normalizedNewMemberRole((body as { role?: unknown }).role);
	if (!newRole) {
		return;
	}

	if (!isOrgRoleAccountManagerOrLegacyAdmin(newRole)) {
		throw new APIError("FORBIDDEN", {
			message:
				"Organization owners cannot change an Account Manager to a different role.",
		});
	}
}
