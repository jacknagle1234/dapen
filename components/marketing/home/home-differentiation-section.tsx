import { CheckIcon, MinusIcon } from "lucide-react";
import {
	HomeSectionEyebrow,
	HomeSectionShell,
	homeHeadingClass,
	homeLeadClass,
} from "@/components/marketing/home/home-section-shell";

const rows = [
	{
		typical: "Adds front-end accessibility features",
		dapen: "Includes tools plus full protection and response",
	},
	{
		typical: "Focused on visual or UI improvements",
		dapen: "Focused on prevention, remediation, and legal/technical response",
	},
	{
		typical: "No action when a complaint or legal demand occurs",
		dapen: "Activates Digital Accessibility Protection (DAP) when risk arises",
	},
	{
		typical: "Operates as a standalone tool",
		dapen: "Coordinates developers and legal strategy in real time",
	},
] as const;

export function HomeDifferentiationSection() {
	return (
		<HomeSectionShell variant="default">
			<HomeSectionEyebrow>Compare</HomeSectionEyebrow>
			<h2 className={homeHeadingClass()}>Widgets vs Protection</h2>
			<p className={homeLeadClass()}>
				Widgets add features. DAPEN provides protection.
			</p>

			<div className="mt-12 overflow-hidden rounded-2xl border border-marketing-border/80 bg-marketing-bg-elevated shadow-sm">
				<div className="grid grid-cols-1 gap-0 md:grid-cols-2">
					<div className="border-marketing-border/60 border-b bg-marketing-bg-subtle/50 px-6 py-4 md:border-r md:border-b-0">
						<p className="font-sans text-xs font-semibold tracking-wide text-marketing-fg-subtle uppercase">
							Accessibility Widget
						</p>
					</div>
					<div className="border-marketing-border/60 border-b bg-marketing-accent/5 px-6 py-4 md:border-b-0">
						<p className="font-sans text-xs font-semibold tracking-wide text-marketing-accent uppercase">
							DAPEN Membership
						</p>
					</div>
				</div>
				<ul className="divide-marketing-border/60 divide-y">
					{rows.map((row) => (
						<li
							key={`${row.typical}__${row.dapen}`}
							className="grid grid-cols-1 md:grid-cols-2 md:divide-x md:divide-marketing-border/60"
						>
							<div className="flex gap-3 px-6 py-5">
								<MinusIcon
									className="mt-0.5 size-4 shrink-0 text-marketing-fg-subtle"
									aria-hidden
								/>
								<span className="text-sm leading-relaxed text-marketing-fg-muted">
									{row.typical}
								</span>
							</div>
							<div className="flex gap-3 bg-marketing-bg/50 px-6 py-5 md:bg-marketing-accent/[0.04]">
								<CheckIcon
									className="mt-0.5 size-4 shrink-0 text-marketing-accent"
									strokeWidth={2.5}
									aria-hidden
								/>
								<span className="text-sm font-medium leading-relaxed text-marketing-fg">
									{row.dapen}
								</span>
							</div>
						</li>
					))}
				</ul>
			</div>

			<div className="mt-12 max-w-2xl border-marketing-border border-l-2 border-l-marketing-accent pl-5">
				<p className="text-base font-semibold text-marketing-fg">
					The key difference
				</p>
				<p className="mt-3 text-base leading-relaxed text-marketing-fg">
					Widgets improve your website.
				</p>
				<p className="mt-2 text-base leading-relaxed text-marketing-fg">
					DAPEN protects your business when it&apos;s challenged.
				</p>
			</div>
		</HomeSectionShell>
	);
}
