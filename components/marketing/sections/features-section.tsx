"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { GradientCard } from "@/components/marketing/primitives/gradient-card";
import { cn } from "@/lib/utils";

interface Feature {
	title: string;
	description: string;
	link: string;
	linkText: string;
	color: "green" | "blue" | "purple" | "brown";
	placement: "bottom" | "bottom-right" | "bottom-left";
	image: {
		light: string;
		dark: string;
		width: number;
		height: number;
	};
}

function FeatureCard({ feature }: { feature: Feature }) {
	const { image } = feature;
	const sameImageForBothThemes = image.light === image.dark;

	return (
		<div className="overflow-hidden rounded-lg bg-marketing-card p-2">
			{/* Screenshot — fixed 16:9 frame (1200×675) so both cards match */}
			<div
				className={cn(
					"relative aspect-video w-full overflow-hidden rounded-sm",
					"dark:after:absolute dark:after:inset-0 dark:after:rounded-sm",
					"dark:after:outline dark:after:outline-1 dark:after:-outline-offset-1 dark:after:outline-white/10 dark:after:content-['']",
				)}
			>
				<GradientCard
					color={feature.color}
					placement={feature.placement}
					rounded="sm"
					className="absolute inset-0 h-full w-full [&>div.relative]:flex [&>div.relative]:h-full [&>div.relative]:min-h-0 [&>div.relative]:flex-col [&>div.relative>div]:min-h-0 [&>div.relative>div]:flex-1"
				>
					{sameImageForBothThemes ? (
						<img
							src={image.light}
							alt={feature.title}
							width={image.width}
							height={image.height}
							className="w-full h-auto"
						/>
					) : (
						<>
							<img
								src={image.light}
								alt={feature.title}
								width={image.width}
								height={image.height}
								className="dark:hidden w-full h-auto"
							/>
							<img
								src={image.dark}
								alt={feature.title}
								width={image.width}
								height={image.height}
								className="hidden dark:block w-full h-auto"
							/>
						</>
					)}
				</GradientCard>
			</div>

			{/* Content */}
			<div className="flex flex-col gap-4 p-6 sm:p-10 lg:p-6">
				<div>
					<h3 className="text-base font-medium leading-8 text-marketing-fg">
						{feature.title}
					</h3>
					<div className="mt-2 flex flex-col gap-4 text-sm leading-7 text-marketing-fg-muted">
						<p>{feature.description}</p>
					</div>
				</div>
				<Link
					href={feature.link}
					className="group inline-flex items-center gap-2 text-sm font-medium text-marketing-fg"
				>
					{feature.linkText}
					<ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
				</Link>
			</div>
		</div>
	);
}

export function FeaturesSection() {
	const features: Feature[] = [
		{
			title: "Your free DAPEN account",
			description:
				"Get access to easy-to-use tools, practical guides, and resources that help you improve your website accessibility step by step.",
			link: "/auth/sign-up",
			linkText: "Purchase Protection",
			color: "blue",
			placement: "bottom",
			image: {
				light: "/marketing/images/dapen-white.webp",
				dark: "/marketing/images/dapen-white.webp",
				width: 1200,
				height: 675,
			},
		},
		{
			title: "Free DAPEN Toolbar",
			description:
				"Add the free accessibility toolbar to your website in minutes and start improving the experience for your visitors right away.",
			link: "/blog/what-is-a-dapen-toolbar",
			linkText: "Learn More",
			color: "purple",
			placement: "bottom",
			image: {
				light: "/marketing/images/dapen-toolbar.webp",
				dark: "/marketing/images/dapen-toolbar.webp",
				width: 1200,
				height: 675,
			},
		},
	];

	return (
		<section id="features" className="py-16 scroll-mt-14">
			<div className="mx-auto flex max-w-2xl flex-col gap-10 px-6 md:max-w-3xl lg:max-w-7xl lg:gap-16 lg:px-10">
				{/* Header — wider toward center; left edge unchanged (self-start) */}
				<div className="flex w-full max-w-2xl flex-col gap-6 self-start lg:max-w-4xl xl:max-w-5xl">
					<div className="flex flex-col gap-2">
						<div className="text-sm font-semibold leading-7 text-marketing-fg-muted">
							Free account
						</div>
						<h2
							className={cn(
								"text-pretty font-display text-[2rem] leading-10 tracking-tight",
								"text-marketing-fg",
								"sm:text-5xl sm:leading-14",
							)}
						>
							Free tools to improve website accessibility
						</h2>
					</div>
					<div className="text-base leading-7 text-marketing-fg-muted text-pretty">
						<p>
							Create a free account and get access to resources designed to help
							businesses improve website accessibility.
						</p>
					</div>
				</div>

				{/* Features Grid */}
				<div>
					<div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
						{features.map((feature) => (
							<FeatureCard key={feature.title} feature={feature} />
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
