import type { Metadata } from "next";
import { HomeMarketingPage } from "@/components/marketing/home-marketing-page";

const homeTitle = "Digital Accessibility Protection | DAPEN.org Official Site";

export const metadata: Metadata = {
	title: {
		absolute: homeTitle,
	},
	openGraph: {
		title: homeTitle,
	},
	twitter: {
		title: homeTitle,
	},
};

export default function HomePage() {
	return <HomeMarketingPage />;
}
