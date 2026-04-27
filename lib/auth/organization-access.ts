import { createAccessControl } from "better-auth/plugins";

/** Matches Better Auth default organization statements; used with custom roles (no org `admin`). */
const organizationStatements = {
	organization: ["update", "delete"],
	member: ["create", "update", "delete"],
	invitation: ["create", "cancel"],
	team: ["create", "update", "delete"],
	ac: ["create", "read", "update", "delete"],
};

export const organizationAc = createAccessControl(organizationStatements);

const elevatedStatements = {
	organization: ["update", "delete"],
	member: ["create", "update", "delete"],
	invitation: ["create", "cancel"],
	team: ["create", "update", "delete"],
	ac: ["create", "read", "update", "delete"],
};

const ownerRole = organizationAc.newRole(elevatedStatements);
const accountManagerRole = organizationAc.newRole(elevatedStatements);
const memberRole = organizationAc.newRole({
	organization: [],
	member: [],
	invitation: [],
	team: [],
	ac: ["read"],
});

/**
 * Better Auth merges `defaultRoles` with `opts.roles`; keys from defaults (including
 * `admin`) cannot be removed by spread. We overwrite `admin` with the same statements as
 * Account Manager so legacy `admin` member rows remain elevated until migrated, without
 * using the framework's default (weaker) admin role.
 */
export const organizationPluginRoles = {
	owner: ownerRole,
	account_manager: accountManagerRole,
	member: memberRole,
	admin: accountManagerRole,
};
