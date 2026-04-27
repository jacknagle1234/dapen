import {
	HomeSectionEyebrow,
	HomeSectionShell,
	homeHeadingClass,
	homeLeadClass,
} from "@/components/marketing/home/home-section-shell";
import { cn } from "@/lib/utils";

const cards = [
	{
		title: "What usually triggers a complaint",
		body: "Patterns that turn informal feedback into something your legal team has to read.",
	},
	{
		title: "Why overlays are not a shield",
		body: "They change presentation—not accountability—when a claim gets serious.",
	},
	{
		title: "What liability actually tracks",
		body: "Ownership, operations, and how you respond—not only what is on the page.",
	},
	{
		title: "How escalation tends to move",
		body: "Short windows between first contact, demands, and filings if nobody owns the thread.",
	},
] as const;

export function HomeEducationSection() {
	return (
		<HomeSectionShell variant="default">
			<HomeSectionEyebrow>Education</HomeSectionEyebrow>
			<h2 className={homeHeadingClass()}>Understand the risk in plain terms</h2>
			<p className={homeLeadClass()}>
				Short reads your stakeholders can skim before you need them in a room
				together.
			</p>
			<ul className="mt-12 grid gap-4 sm:grid-cols-2">
				{cards.map((card) => (
					<li
						key={card.title}
						className={cn(
							"rounded-2xl border border-marketing-border/80 bg-marketing-bg-elevated p-6 shadow-sm",
						)}
					>
						<h3 className="font-sans text-sm font-semibold leading-snug text-marketing-fg">
							{card.title}
						</h3>
						<p className="mt-2 text-sm leading-relaxed text-marketing-fg-muted">
							{card.body}
						</p>
					</li>
				))}
			</ul>
		</HomeSectionShell>
	);
}
