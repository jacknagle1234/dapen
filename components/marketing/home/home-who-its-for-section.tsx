import { Building2, Code2, UsersRound } from "lucide-react";
import {
	HomeSectionEyebrow,
	HomeSectionShell,
	homeHeadingClass,
	homeLeadClass,
} from "@/components/marketing/home/home-section-shell";
import { cn } from "@/lib/utils";

const audiences = [
	{
		title: "Businesses",
		body: "Less guesswork when a claim hits—clear steps and coordinated help.",
		icon: Building2,
	},
	{
		title: "Agencies",
		body: "A packaged protection story you can sell and deliver with confidence.",
		icon: UsersRound,
	},
	{
		title: "Developers & ops",
		body: "Fewer “drop everything” fires—playbooks instead of one-off heroics.",
		icon: Code2,
	},
] as const;

export function HomeWhoItsForSection() {
	return (
		<HomeSectionShell variant="default">
			<HomeSectionEyebrow>Who it is for</HomeSectionEyebrow>
			<h2 className={homeHeadingClass()}>
				Built for teams who ship on the web
			</h2>
			<p className={homeLeadClass()}>
				Whether you own the P&L, the client relationship, or the codebase.
			</p>
			<ul className="mt-12 grid gap-5 md:grid-cols-3">
				{audiences.map(({ title, body, icon: Icon }) => (
					<li
						key={title}
						className={cn(
							"rounded-2xl border border-marketing-border/80 bg-marketing-bg-elevated p-6 shadow-sm",
						)}
					>
						<Icon
							className="size-5 text-marketing-accent"
							strokeWidth={1.75}
							aria-hidden
						/>
						<h3 className="mt-4 font-sans text-base font-semibold text-marketing-fg">
							{title}
						</h3>
						<p className="mt-2 text-sm leading-relaxed text-marketing-fg-muted">
							{body}
						</p>
					</li>
				))}
			</ul>
		</HomeSectionShell>
	);
}
