import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ContactSection } from "@/components/marketing/sections/contact-section";
import { FaqSection } from "@/components/marketing/sections/faq-section";
import { appConfig } from "@/config/app.config";
import { marketingFaqContent } from "@/lib/marketing/faq-content";

export const metadata: Metadata = {
	title: "Contact",
	description: "Get in touch with us. We'd love to hear from you.",
};

export default function ContactPage() {
	// Redirect to home if contact page is disabled
	if (!appConfig.contact.enabled) {
		redirect("/");
	}

	return (
		<>
			<ContactSection />
			<FaqSection content={marketingFaqContent} />
		</>
	);
}
