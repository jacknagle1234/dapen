import {
	OrganizationJsonLd,
	WebSiteJsonLd,
} from "@/components/marketing/marketing-json-ld";
import { CtaSection } from "@/components/marketing/sections/cta-section";
import { FaqSection } from "@/components/marketing/sections/faq-section";
import { FeaturesSection } from "@/components/marketing/sections/features-section";
import { HeroSection } from "@/components/marketing/sections/hero-section";
import { LatestArticlesSection } from "@/components/marketing/sections/latest-articles-section";
import { LogoCloudSection } from "@/components/marketing/sections/logo-cloud-section";
import { StatsSection } from "@/components/marketing/sections/stats-section";
import { TestimonialsSection } from "@/components/marketing/sections/testimonials-section";
import { getAllPosts } from "@/lib/marketing/blog/posts";
import { marketingFaqContent } from "@/lib/marketing/faq-content";

export async function PartnersMarketingPage() {
	const posts = await getAllPosts();

	const ctaContent = {
		headline: "Ready to get started?",
		description:
			"Create your free account and get access to resources that help improve your website's accessibility.",
		primaryCta: {
			text: "Purchase Protection",
			href: "/auth/sign-up",
		},
		secondaryCta: {
			text: "Become an Agency Partner",
			href: "/partners",
		},
	};

	return (
		<>
			<OrganizationJsonLd />
			<WebSiteJsonLd />
			<HeroSection />
			<LogoCloudSection />
			<FeaturesSection />
			<StatsSection />
			<TestimonialsSection />
			<FaqSection content={marketingFaqContent} />
			<LatestArticlesSection posts={posts} />
			<CtaSection content={ctaContent} />
		</>
	);
}
