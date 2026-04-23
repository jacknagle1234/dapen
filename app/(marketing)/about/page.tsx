import type { Metadata } from "next";
import { AboutSection } from "@/components/marketing/sections/about-section";
import { appConfig } from "@/config/app.config";

export const metadata: Metadata = {
	title: "About",
	description: `Learn about DAPEN.org — our mission to educate business owners and improve website accessibility.`,
};

export default function AboutPage() {
	return <AboutSection />;
}
