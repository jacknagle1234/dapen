import { ArrowRightIcon, CheckIcon } from "lucide-react";
import Link from "next/link";
import {
	HomeSectionEyebrow,
	HomeSectionShell,
	homeHeadingClass,
	homeLeadClass,
} from "@/components/marketing/home/home-section-shell";
import { cn } from "@/lib/utils";

const pathways = [
	{
		title: "Business owners",
		subtitle: "Buy protection for your business",
		bullets: [
			"Fast response to accessibility complaints and legal claims",
			"Technical fixes and coordinated resolution support",
			"Ongoing risk reduction and accessibility improvement tools",
		] as const,
		cta: { text: "Get protection", href: "/auth/sign-up" },
		emphasis: true,
	},
	{
		title: "Agencies",
		subtitle: "Sell protection to clients",
		bullets: [
			"50% recurring revenue per client",
			"Upgrade from widgets to a higher-value offering",
			"Increased client retention through managed protection",
		] as const,
		cta: { text: "Become a partner", href: "/partners" },
		emphasis: false,
	},
] as const;

export function HomeTwoPathwaysSection() {
	return (
		<HomeSectionShell variant="elevated">
			<HomeSectionEyebrow>Join DAPEN</HomeSectionEyebrow>
			<h2 className={homeHeadingClass()}>
				Buy protection—or partner to sell it.
			</h2>
			<p className={homeLeadClass()}>
				Joining DAPEN is the best solution for website accessibility, giving
				teams the tools to improve accessibility and providing protection
				exactly when it is needed most.
			</p>
			<div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-8">
				{pathways.map((p) => (
					<div
						key={p.title}
						className={cn(
							"flex flex-col rounded-2xl border p-8 shadow-sm",
							p.emphasis
								? "border-marketing-accent/30 bg-marketing-bg"
								: "border-marketing-border/80 bg-marketing-bg-elevated",
						)}
					>
						<p className="font-sans text-xs font-semibold tracking-wide text-marketing-fg-subtle uppercase">
							{p.title}
						</p>
						<h3 className="mt-2 font-sans text-xl font-semibold tracking-tight text-marketing-fg">
							{p.subtitle}
						</h3>
						<ul className="mt-6 flex-1 space-y-3">
							{p.bullets.map((line) => (
								<li
									key={line}
									className="flex gap-3 text-sm leading-relaxed text-marketing-fg-muted"
								>
									<CheckIcon
										className="mt-0.5 size-4 shrink-0 text-marketing-accent"
										strokeWidth={2.5}
										aria-hidden
									/>
									<span>{line}</span>
								</li>
							))}
						</ul>
						<Link
							href={p.cta.href}
							className={cn(
								"mt-8 inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
								p.emphasis
									? "bg-marketing-accent text-marketing-accent-fg hover:bg-marketing-accent-hover"
									: "border border-marketing-border bg-marketing-bg-elevated text-marketing-fg hover:bg-marketing-card-hover",
							)}
						>
							{p.cta.text}
							<ArrowRightIcon className="size-4" />
						</Link>
					</div>
				))}
			</div>
		</HomeSectionShell>
	);
}
