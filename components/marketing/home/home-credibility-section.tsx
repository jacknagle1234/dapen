import { Accessibility, Gavel, Network, Workflow } from "lucide-react";
import {
	HomeSectionEyebrow,
	HomeSectionShell,
	homeHeadingClass,
	homeLeadClass,
} from "@/components/marketing/home/home-section-shell";

const integrations = [
	{
		label: "Accessibility specialists",
		icon: Accessibility,
	},
	{
		label: "Response workflows",
		icon: Workflow,
	},
	{
		label: "Legal escalation partners",
		icon: Gavel,
	},
	{
		label: "Agency partner network",
		icon: Network,
	},
] as const;

export function HomeCredibilitySection() {
	return (
		<HomeSectionShell variant="muted">
			<HomeSectionEyebrow>Our Network</HomeSectionEyebrow>
			<h2 className={homeHeadingClass()}>
				Digital Accessibility Protection & Education Network
			</h2>
			<p className={homeLeadClass()}>
				Joining DAPEN gives you access to a network of accessibility specialists
				who protect your business when it is targeted by complaints, demand
				letters, or legal action.
			</p>
			<ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{integrations.map(({ label, icon: Icon }) => (
					<li
						key={label}
						className="flex items-center gap-3 rounded-xl border border-marketing-border/70 bg-marketing-bg-elevated px-4 py-4 shadow-sm"
					>
						<span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-marketing-accent/10 text-marketing-accent">
							<Icon className="size-4" strokeWidth={1.75} aria-hidden />
						</span>
						<span className="text-sm font-medium leading-snug text-marketing-fg">
							{label}
						</span>
					</li>
				))}
			</ul>
		</HomeSectionShell>
	);
}
