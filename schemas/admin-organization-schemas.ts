import { z } from "zod/v4";
import { appConfig } from "@/config/app.config";

// Sortable fields for organizations
export const OrganizationSortField = z.enum([
	"name",
	"membersCount",
	"createdAt",
]);
export type OrganizationSortField = z.infer<typeof OrganizationSortField>;

// Query organizations (admin)
export const listOrganizationsAdminSchema = z.object({
	query: z.coerce.string().max(200).optional(),
	limit: z.coerce
		.number()
		.min(1)
		.max(appConfig.pagination.maxLimit)
		.default(appConfig.pagination.defaultLimit),
	offset: z.coerce.number().min(0).default(0),
	sortBy: OrganizationSortField.default("name"),
	sortOrder: z.enum(["asc", "desc"]).default("asc"),
	filters: z
		.object({
			membersCount: z.array(z.enum(["0", "1-5", "6-10", "11+"])).optional(),
			createdAt: z
				.array(z.enum(["today", "this-week", "this-month", "older"]))
				.optional(),
			subscriptionStatus: z
				.array(
					z.enum([
						"active",
						"trialing",
						"canceled",
						"past_due",
						"paused",
						"incomplete",
						"incomplete_expired",
						"unpaid",
					]),
				)
				.optional(),
			subscriptionInterval: z.array(z.enum(["month", "year"])).optional(),
			balanceRange: z
				.array(z.enum(["zero", "low", "medium", "high"]))
				.optional(),
		})
		.optional(),
});

// Delete organization (admin)
export const deleteOrganizationAdminSchema = z.object({
	id: z.string().uuid(),
});

// Export organizations (admin)
export const exportOrganizationsAdminSchema = z.object({
	organizationIds: z.array(z.string().uuid()).min(1).max(1000), // Max 1000 orgs per export
});

// Adjust credits (admin)
export const adjustCreditsAdminSchema = z.object({
	organizationId: z.string().uuid(),
	amount: z.number().refine((n) => n !== 0, "Amount cannot be zero"),
	description: z.string().min(1).max(500),
});

// Cancel subscription (admin)
export const cancelSubscriptionAdminSchema = z.object({
	subscriptionId: z.string(),
	immediate: z.boolean().default(false),
});

const websiteUrlForContactSchema = z
	.string()
	.trim()
	.min(1, "Website URL is required")
	.transform((value) => {
		if (/^https?:\/\//i.test(value)) {
			return value;
		}
		return `https://${value}`;
	})
	.pipe(z.string().url("Enter a valid website URL"));

// Create organization from admin Contacts tab (business + contact fields)
export const createOrganizationFromContactAdminSchema = z.object({
	businessName: z.string().min(1).max(100).trim(),
	websiteUrl: websiteUrlForContactSchema,
	mailingAddress: z.string().trim().min(1).max(2000),
});

/** Raw CSV text; first row must be headers. Max size / row limits enforced server-side. */
export const importContactsFromCsvAdminSchema = z.object({
	csvText: z.string().min(1).max(500_000),
});

export const CrmClaimStatus = z.enum(["unclaimed", "claimed"]);
export type CrmClaimStatus = z.infer<typeof CrmClaimStatus>;

export const DirectMailStatus = z.enum([
	"not_sent",
	"queued",
	"sent",
	"returned",
]);
export type DirectMailStatus = z.infer<typeof DirectMailStatus>;

export const ContactSortField = z.enum(["name", "createdAt"]);
export type ContactSortField = z.infer<typeof ContactSortField>;

export const listMyContactsAdminSchema = z.object({
	query: z.coerce.string().max(200).optional(),
	limit: z.coerce
		.number()
		.min(1)
		.max(appConfig.pagination.maxLimit)
		.default(appConfig.pagination.defaultLimit),
	offset: z.coerce.number().min(0).default(0),
	sortBy: ContactSortField.default("createdAt"),
	sortOrder: z.enum(["asc", "desc"]).default("desc"),
	filters: z
		.object({
			crmClaimStatus: z.array(CrmClaimStatus).optional(),
			directMailStatus: z.array(DirectMailStatus).optional(),
		})
		.optional(),
});

export const updateContactCrmAdminSchema = z.object({
	organizationId: z.string().uuid(),
	directMailStatus: DirectMailStatus,
});

/** Invite an org owner from the admin CRM (Better Auth client blocks non-`owner` inviters). */
export const inviteContactOwnerAdminSchema = z.object({
	organizationId: z.string().uuid(),
	email: z.string().email(),
});

// Type exports
export type GetOrganizationsAdminInput = z.infer<
	typeof listOrganizationsAdminSchema
>;
export type DeleteOrganizationAdminInput = z.infer<
	typeof deleteOrganizationAdminSchema
>;
export type ExportOrganizationsAdminInput = z.infer<
	typeof exportOrganizationsAdminSchema
>;
export type AdjustCreditsAdminInput = z.infer<typeof adjustCreditsAdminSchema>;
export type CancelSubscriptionAdminInput = z.infer<
	typeof cancelSubscriptionAdminSchema
>;
export type CreateOrganizationFromContactAdminInput = z.infer<
	typeof createOrganizationFromContactAdminSchema
>;
export type ImportContactsFromCsvAdminInput = z.infer<
	typeof importContactsFromCsvAdminSchema
>;
export type ListMyContactsAdminInput = z.infer<
	typeof listMyContactsAdminSchema
>;
export type UpdateContactCrmAdminInput = z.infer<
	typeof updateContactCrmAdminSchema
>;
export type InviteContactOwnerAdminInput = z.infer<
	typeof inviteContactOwnerAdminSchema
>;
