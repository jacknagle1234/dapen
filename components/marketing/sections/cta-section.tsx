"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { MARKETING_MAIN_MAX_WIDTH_CLASS } from "@/lib/marketing/marketing-content-width";
import { cn } from "@/lib/utils";

interface CtaContent {
	headline: string;
	description: string;
	primaryCta: {
		text: string;
		href: string;
	};
	secondaryCta: {
		text: string;
		href: string;
	};
}

interface CtaSectionProps {
	centered?: boolean;
	className?: string;
	headingClassName?: string;
	content: CtaContent;
}

export function CtaSection({
	centered = false,
	className,
	headingClassName,
	content,
}: CtaSectionProps) {
	const { headline, description, primaryCta, secondaryCta } = content;

	return (
		<section id="cta" className={cn("py-16", className)}>
			<div
				className={cn(
					"flex flex-col gap-10",
					MARKETING_MAIN_MAX_WIDTH_CLASS,
					centered && "items-center text-center",
				)}
			>
				{/* Content */}
				<div className="flex flex-col gap-6">
					<div
						className={cn(
							"flex max-w-4xl flex-col gap-2",
							centered && "items-center",
						)}
					>
						<h2
							className={cn(
								"text-pretty text-marketing-fg",
								headingClassName ??
									"font-display text-[2rem] leading-10 tracking-tight sm:text-5xl sm:leading-14",
							)}
						>
							{headline}
						</h2>
					</div>
					<div className="max-w-3xl text-base leading-7 text-marketing-fg-muted text-pretty">
						<p>{description}</p>
					</div>
				</div>

				{/* Buttons */}
				<div
					className={cn(
						"flex flex-wrap items-center gap-4",
						centered && "justify-center",
					)}
				>
					<Link
						href={primaryCta.href}
						className={cn(
							"inline-flex shrink-0 items-center justify-center gap-1 rounded-full px-4 py-2 text-sm font-medium",
							"bg-marketing-accent text-marketing-accent-fg hover:bg-marketing-accent-hover",
						)}
					>
						{primaryCta.text}
					</Link>
					<Link
						href={secondaryCta.href}
						className={cn(
							"group inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
							"text-marketing-fg hover:bg-marketing-card-hover",
						)}
					>
						{secondaryCta.text}
						<ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
					</Link>
				</div>
			</div>
		</section>
	);
}
