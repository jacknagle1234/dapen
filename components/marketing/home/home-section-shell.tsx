import type { ReactNode } from "react";
import { MARKETING_MAIN_MAX_WIDTH_CLASS } from "@/lib/marketing/marketing-content-width";
import { cn } from "@/lib/utils";

const shellVariants = {
	default: "bg-marketing-bg border-marketing-border/60 border-t",
	muted: "bg-marketing-bg-subtle/40 border-marketing-border/50 border-t",
	elevated: "bg-marketing-bg-elevated border-marketing-border/60 border-t",
} as const;

export type HomeSectionVariant = keyof typeof shellVariants;

export function HomeSectionShell({
	children,
	className,
	id,
	variant = "default",
}: {
	children: ReactNode;
	className?: string;
	id?: string;
	variant?: HomeSectionVariant;
}) {
	return (
		<section
			id={id}
			className={cn(shellVariants[variant], "py-16 md:py-20", className)}
		>
			<div className={MARKETING_MAIN_MAX_WIDTH_CLASS}>{children}</div>
		</section>
	);
}

export function HomeSectionEyebrow({ children }: { children: ReactNode }) {
	return (
		<p className="mb-3 font-sans text-xs font-semibold tracking-[0.2em] text-marketing-accent uppercase">
			{children}
		</p>
	);
}

export function homeHeadingClass() {
	return cn(
		"text-balance font-sans text-2xl font-semibold tracking-tight text-marketing-fg",
		"sm:text-3xl sm:leading-snug md:text-[2rem] md:leading-tight",
	);
}

export function homeLeadClass() {
	return "mt-4 max-w-2xl text-base leading-relaxed text-marketing-fg-muted sm:text-lg";
}
