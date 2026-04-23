"use client";

import { InfiniteSlider } from "@/components/marketing/primitives/infinite-slider";
import { ProgressiveBlur } from "@/components/marketing/primitives/progressive-blur";

const builderLogoEntries = [
	["wordpress", "WordPress logo"],
	["shopify", "Shopify logo"],
	["wix", "Wix logo"],
	["webflow", "Webflow logo"],
	["elementor", "Elementor logo"],
	["squarespace", "Squarespace logo"],
	["godaddy", "GoDaddy logo"],
	["base44", "Base44 logo"],
] as const;

const builderLogos = builderLogoEntries.map(([id, alt]) => ({
	id,
	src: `/marketing/logos/${id}.svg`,
	srcDark: `/marketing/logos/${id}-dark.svg`,
	alt,
}));

/** Uniform cap height; width follows each SVG’s aspect ratio */
const logoImgLightClassName =
	"mx-auto block h-10 w-auto max-w-none object-contain dark:hidden";
const logoImgDarkClassName =
	"mx-auto hidden h-10 w-auto max-w-none object-contain dark:block";

export function LogoCloudSection() {
	return (
		<section className="overflow-hidden border-border/50 border-t">
			<div className="group relative mx-auto max-w-screen-2xl px-4 sm:px-6 md:px-12">
				<div className="relative w-full py-6">
					<InfiniteSlider speedOnHover={20} speed={40} gap={96}>
						{builderLogos.map((logo) => (
							<div key={logo.id} className="flex items-center">
								<img
									className={logoImgLightClassName}
									src={logo.src}
									alt={logo.alt}
									width={160}
									height={40}
								/>
								<img
									className={logoImgDarkClassName}
									src={logo.srcDark}
									alt={logo.alt}
									width={160}
									height={40}
								/>
							</div>
						))}
					</InfiniteSlider>

					<ProgressiveBlur
						className="pointer-events-none absolute inset-y-0 left-0 h-full w-20"
						direction="left"
						blurIntensity={1}
					/>
					<ProgressiveBlur
						className="pointer-events-none absolute inset-y-0 right-0 h-full w-20"
						direction="right"
						blurIntensity={1}
					/>
				</div>
			</div>
		</section>
	);
}
