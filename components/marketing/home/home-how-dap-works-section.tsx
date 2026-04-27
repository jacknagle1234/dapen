import {
	HomeSectionEyebrow,
	HomeSectionShell,
	homeHeadingClass,
} from "@/components/marketing/home/home-section-shell";
import { cn } from "@/lib/utils";

const steps = [
	{
		step: 1,
		title: "Join DAPEN",
		lines: ["Widgets, guides, and tools included from day one."],
	},
	{
		step: 2,
		title: "Improve Accessibility",
		lines: ["Member tools to improve accessibility over time."],
	},
	{
		step: 3,
		title: "If You’re Targeted, We Step In",
		lines: [
			"Developers and attorneys included at no extra cost when trouble hits.",
		],
	},
] as const;

export function HomeHowDapWorksSection() {
	return (
		<HomeSectionShell
			id="how-digital-accessibility-protection-works"
			variant="muted"
		>
			<HomeSectionEyebrow>DAPEN Membership</HomeSectionEyebrow>
			<h2 className={homeHeadingClass()}>
				How Digital Accessibility Protection Works
			</h2>

			<div className="mt-10 max-w-5xl">
				<div
					className={cn(
						"rounded-3xl border border-marketing-border/70",
						"bg-marketing-bg-elevated shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
						"dark:shadow-none dark:ring-1 dark:ring-white/5",
					)}
				>
					<ol className="grid list-none divide-y divide-marketing-border/60 p-0 md:grid-cols-3 md:divide-x md:divide-y-0">
						{steps.map((item) => (
							<li key={item.step}>
								<div className="flex flex-col gap-4 p-6 sm:p-8">
									<span
										className={cn(
											"flex size-9 shrink-0 items-center justify-center rounded-full",
											"bg-marketing-accent text-sm font-semibold tabular-nums text-marketing-accent-fg",
										)}
										aria-hidden
									>
										{item.step}
									</span>
									<div>
										<h3 className="font-sans text-base font-semibold tracking-tight text-marketing-fg">
											{item.title}
										</h3>
										<div className="mt-2.5 space-y-2">
											{item.lines.map((line, lineIndex) => (
												<p
													key={`${item.step}-${lineIndex}`}
													className="text-sm leading-relaxed text-marketing-fg-muted"
												>
													{line}
												</p>
											))}
										</div>
									</div>
								</div>
							</li>
						))}
					</ol>
				</div>

				<p className="mt-10 font-semibold text-base leading-snug text-marketing-fg sm:text-lg">
					Proprietary response strategies help reduce escalation and can save
					tens of thousands in legal and technical costs.
				</p>
			</div>
		</HomeSectionShell>
	);
}
