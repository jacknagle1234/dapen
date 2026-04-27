import { XIcon } from "lucide-react";
import Image from "next/image";
import {
	HomeSectionEyebrow,
	HomeSectionShell,
	homeHeadingClass,
	homeLeadClass,
} from "@/components/marketing/home/home-section-shell";

const bullets = [
	"Doesn’t prevent legal complaints",
	"No defense when claims arise",
	"Overlays don’t remove liability",
	"No protection when targeted",
] as const;

export function HomeProblemSection() {
	return (
		<HomeSectionShell variant="muted">
			<div className="grid items-start gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
				<div>
					<HomeSectionEyebrow>The gap</HomeSectionEyebrow>
					<h2 className={homeHeadingClass()}>
						Accessibility widgets do not protect you
					</h2>
					<p className={homeLeadClass()}>
						1 in 4 websites sued for inaccessibility in 2025 had a widget
						installed.
					</p>
					<ul className="mt-10 max-w-xl space-y-4">
						{bullets.map((line) => (
							<li
								key={line}
								className="flex gap-3 text-sm leading-relaxed text-marketing-fg sm:text-base"
							>
								<XIcon
									className="mt-0.5 size-4 shrink-0 text-marketing-fg-subtle"
									strokeWidth={2}
									aria-hidden
								/>
								<span>{line}</span>
							</li>
						))}
					</ul>
					<p className="mt-10 max-w-xl border-marketing-border border-l-2 border-l-marketing-accent pl-5 text-base font-medium text-marketing-fg">
						Widgets add features. DAPEN provides protection.
					</p>
				</div>
				<div className="w-full lg:justify-self-end lg:max-w-sm">
					<div className="overflow-hidden rounded-2xl border border-marketing-border/70 bg-gradient-to-b from-marketing-bg-elevated to-marketing-bg p-2 shadow-lg lg:rotate-1">
						<Image
							src="/marketing/images/widget-corrupt.png"
							alt="Accessibility widget warning on a webpage"
							width={1200}
							height={900}
							className="h-auto w-full rounded-xl border border-black/5 object-contain"
							priority={false}
						/>
					</div>
				</div>
			</div>
		</HomeSectionShell>
	);
}
