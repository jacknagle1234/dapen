import {
	HomeSectionEyebrow,
	HomeSectionShell,
	homeHeadingClass,
	homeLeadClass,
} from "@/components/marketing/home/home-section-shell";
import { cn } from "@/lib/utils";

const steps = [
	{
		title: "Something arrives",
		body: "Complaint, demand letter, or filing—your signal to move deliberately, not panic.",
	},
	{
		title: "DAPEN activates",
		body: "We start the response workflow within 24 hours so nothing sits unanswered.",
	},
	{
		title: "Experts align",
		body: "Accessibility specialists and legal partners work from the same set of facts.",
	},
	{
		title: "You execute the plan",
		body: "Technical fixes plus a structured reply, tuned to your situation.",
	},
	{
		title: "You stay covered",
		body: "Ongoing support so the next issue does not feel like day one again.",
	},
] as const;

export function HomeHowItWorksSection() {
	return (
		<HomeSectionShell id="how-it-works" variant="muted">
			<HomeSectionEyebrow>How it works</HomeSectionEyebrow>
			<h2 className={homeHeadingClass()}>From first notice to a clear plan</h2>
			<p className={homeLeadClass()}>
				Five straightforward steps—easy to share with leadership or legal.
			</p>

			<ol className="mt-12 max-w-3xl space-y-8">
				{steps.map((step, i) => (
					<li key={step.title} className="flex gap-5">
						<div
							className={cn(
								"flex size-10 shrink-0 items-center justify-center rounded-full",
								"bg-marketing-accent text-sm font-bold text-marketing-accent-fg",
							)}
							aria-hidden
						>
							{i + 1}
						</div>
						<div className="min-w-0 pt-0.5">
							<h3 className="font-sans text-base font-semibold text-marketing-fg">
								{step.title}
							</h3>
							<p className="mt-1.5 text-sm leading-relaxed text-marketing-fg-muted sm:text-base">
								{step.body}
							</p>
						</div>
					</li>
				))}
			</ol>
		</HomeSectionShell>
	);
}
