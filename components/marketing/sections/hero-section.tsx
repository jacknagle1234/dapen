"use client";

import { ArrowRightIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { MARKETING_MAIN_MAX_WIDTH_CLASS } from "@/lib/marketing/marketing-content-width";
import { cn } from "@/lib/utils";

export function HeroSection() {
	return (
		<section id="hero" className="py-16 scroll-mt-14">
			<div
				className={cn("flex flex-col gap-16", MARKETING_MAIN_MAX_WIDTH_CLASS)}
			>
				<div className="flex flex-col items-start gap-6">
					<Link
						href="/auth/sign-up"
						className={cn(
							"relative inline-flex max-w-full items-center gap-3 overflow-hidden rounded-md px-3.5 py-2 text-sm",
							"bg-marketing-card",
							"hover:bg-marketing-card-hover",
							"dark:ring-inset dark:ring-1 dark:ring-white/5",
							"sm:flex-row sm:items-center sm:gap-3 sm:rounded-full sm:px-3 sm:py-0.5",
						)}
					>
						<span className="truncate text-pretty sm:truncate">
							#1 Accessibility Solution for Small Businesses
						</span>
						<span className="hidden h-3 w-px bg-marketing-card-hover sm:block" />
						<span className="inline-flex shrink-0 items-center gap-1 font-semibold">
							Learn more
							<ChevronRightIcon className="size-3" />
						</span>
					</Link>

					<h1
						className={cn(
							"max-w-5xl self-start text-balance font-display font-semibold tracking-display-tight",
							"text-marketing-fg",
							"text-3xl leading-tight sm:text-4xl sm:leading-tight",
							"lg:max-w-6xl lg:text-[3.75rem] lg:leading-[1.09]",
							"xl:max-w-7xl xl:text-[4.05rem] xl:leading-[1.09]",
						)}
					>
						Digital Accessibility Protection for the Modern Web
					</h1>

					<div className="flex max-w-3xl flex-col gap-4 text-lg leading-8 text-marketing-fg-muted">
						<p>
							More than 250,000 businesses are targeted annually for
							inaccessible websites. DAPEN keeps your business protected.
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-4">
						<Link
							href="/auth/sign-up"
							className={cn(
								"inline-flex shrink-0 items-center justify-center gap-1 rounded-full px-4 py-2 text-sm font-medium",
								"bg-marketing-accent text-marketing-accent-fg hover:bg-marketing-accent-hover",
							)}
						>
							Purchase Protection
						</Link>
						<Link
							href="/partners"
							className={cn(
								"group inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
								"text-marketing-fg hover:bg-marketing-card-hover",
							)}
						>
							Become an Agency Partner
							<ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
