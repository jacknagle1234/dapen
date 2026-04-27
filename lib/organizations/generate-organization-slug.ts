import slugify from "@sindresorhus/slugify";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";

export async function generateOrganizationSlug(name: string): Promise<string> {
	const baseSlug = slugify(name, {
		lowercase: true,
	});

	let slug = baseSlug;
	let hasAvailableSlug = false;

	for (let i = 0; i < 3; i++) {
		slug = `${baseSlug}-${nanoid(5)}`;

		const existing = await db.query.organizationTable.findFirst({
			where: (org, { eq: eqFn }) => eqFn(org.slug, slug),
		});

		if (!existing) {
			hasAvailableSlug = true;
			break;
		}
	}

	if (!hasAvailableSlug) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "No available slug found",
		});
	}

	return slug;
}
