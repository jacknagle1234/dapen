import { HomeCredibilitySection } from "@/components/marketing/home/home-credibility-section";
import { HomeDifferentiationSection } from "@/components/marketing/home/home-differentiation-section";
import { HomeHowDapWorksSection } from "@/components/marketing/home/home-how-dap-works-section";
import { HomeProblemSection } from "@/components/marketing/home/home-problem-section";
import { homeHeadingClass } from "@/components/marketing/home/home-section-shell";
import { HomeTwoPathwaysSection } from "@/components/marketing/home/home-two-pathways-section";
import { HomeWhatDapenSection } from "@/components/marketing/home/home-what-dapen-section";
import {
	OrganizationJsonLd,
	WebSiteJsonLd,
} from "@/components/marketing/marketing-json-ld";
import { CtaSection } from "@/components/marketing/sections/cta-section";
import { HeroSection } from "@/components/marketing/sections/hero-section";
import { LogoCloudSection } from "@/components/marketing/sections/logo-cloud-section";
import { cn } from "@/lib/utils";

const homeFinalCta = {
	headline: "Ready to join our network?",
	description:
		"Get a structured way to handle accessibility risk—whether you are protecting your own properties or packaging it for clients.",
	primaryCta: {
		text: "Get protected",
		href: "/auth/sign-up",
	},
	secondaryCta: {
		text: "Become a partner",
		href: "/partners",
	},
};

export function HomeMarketingPage() {
	return (
		<>
			<OrganizationJsonLd />
			<WebSiteJsonLd />
			<HeroSection />
			<div className="font-sans antialiased">
				<LogoCloudSection />
				<HomeProblemSection />
				<HomeWhatDapenSection />
				<HomeDifferentiationSection />
				<HomeHowDapWorksSection />
				<HomeTwoPathwaysSection />
				<HomeCredibilitySection />
				<CtaSection
					className="border-marketing-border/60 border-t bg-marketing-bg-subtle/30 py-16 md:py-20"
					headingClassName={cn(
						homeHeadingClass(),
						"max-w-2xl md:text-[2.125rem]",
					)}
					content={homeFinalCta}
				/>
			</div>
		</>
	);
}
