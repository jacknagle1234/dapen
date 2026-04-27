import type { Metadata } from "next";
import { PartnersMarketingPage } from "@/components/marketing/partners-marketing-page";

const partnersTitle =
	"Agency Partners | Digital Accessibility Protection | DAPEN.org";

export const metadata: Metadata = {
	title: {
		absolute: partnersTitle,
	},
	openGraph: {
		title: partnersTitle,
	},
	twitter: {
		title: partnersTitle,
	},
};

export default async function PartnersPage() {
	return <PartnersMarketingPage />;
}
