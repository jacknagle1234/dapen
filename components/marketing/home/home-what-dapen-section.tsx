import { Scale, Wrench, Zap } from "lucide-react";
import {
	HomeSectionEyebrow,
	HomeSectionShell,
	homeHeadingClass,
	homeLeadClass,
} from "@/components/marketing/home/home-section-shell";
import { cn } from "@/lib/utils";

const defenses = [
	{
		title: "Speed",
		description:
			"We respond within 24 hours. Your account manager figures out what happened and what to do next.",
		icon: Zap,
	},
	{
		title: "Technical Response",
		description:
			"Accessibility experts and developers address the problems named in the complaint.",
		icon: Wrench,
	},
	{
		title: "Legal Defense Strategy",
		description:
			"You get a structured plan and legal support focused on resolving the situation before it escalates.",
		icon: Scale,
	},
] as const;

export function HomeWhatDapenSection() {
	return (
		<HomeSectionShell id="what-is-dap" variant="default">
			<HomeSectionEyebrow>Digital Accessibility Protection</HomeSectionEyebrow>
			<h2 className={homeHeadingClass()}>
				What is Digital Accessibility Protection?
			</h2>
			<p className={homeLeadClass()}>
				Digital Accessibility Protection (DAP) is how DAPEN responds when
				someone raises an accessibility complaint, sends a demand letter, or
				files a suit.
			</p>
			<ul className="mt-10 grid gap-5 sm:grid-cols-3">
				{defenses.map((item) => {
					const Icon = item.icon;
					return (
						<li
							key={item.title}
							className={cn(
								"rounded-2xl border border-marketing-border/80 bg-marketing-bg-elevated p-6 shadow-sm",
							)}
						>
							<div className="flex size-10 items-center justify-center rounded-xl bg-marketing-accent/10 text-marketing-accent">
								<Icon className="size-5" strokeWidth={1.75} aria-hidden />
							</div>
							<h3 className="mt-4 font-sans text-base font-semibold text-marketing-fg">
								{item.title}
							</h3>
							<p className="mt-2 text-sm leading-relaxed text-marketing-fg-muted">
								{item.description}
							</p>
						</li>
					);
				})}
			</ul>
			<div className="mt-12 max-w-2xl border-marketing-border border-l-2 border-l-marketing-accent pl-5">
				<p className="text-base font-medium text-marketing-fg">
					One protection system. Three lines of defense.
				</p>
				<p className="mt-2 text-sm leading-relaxed text-marketing-fg-muted sm:text-base">
					Respond quickly. Fix what matters. Help stop escalation.
				</p>
			</div>
		</HomeSectionShell>
	);
}
