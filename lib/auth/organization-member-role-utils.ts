/** Pure string helpers for org member roles — safe for Client Components (no `db` / `pg`). */

const OWNER = "owner";
const ACCOUNT_MANAGER = "account_manager";
const LEGACY_ORG_ADMIN = "admin";

export function splitOrgMemberRoles(role: string): string[] {
	return role
		.split(",")
		.map((r) => r.trim())
		.filter(Boolean);
}

/** True when the actor is an org owner who does not also have the Account Manager role. */
export function isCustomerOwnerOnlyActor(actorMemberRole: string): boolean {
	const roles = splitOrgMemberRoles(actorMemberRole);
	return roles.includes(OWNER) && !roles.includes(ACCOUNT_MANAGER);
}

/** Account Manager row or legacy org `admin` (pre-migration). */
export function isOrgRoleAccountManagerOrLegacyAdmin(rowRole: string): boolean {
	const roles = splitOrgMemberRoles(rowRole);
	return roles.includes(ACCOUNT_MANAGER) || roles.includes(LEGACY_ORG_ADMIN);
}
