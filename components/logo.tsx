import Image from "next/image";
import type * as React from "react";
import { appConfig } from "@/config/app.config";
import { cn } from "@/lib/utils";

export type LogoProps = {
	className?: string;
};

export function Logo({ className }: LogoProps): React.JSX.Element {
	return (
		<Image
			src="/logo.png"
			alt={appConfig.appName}
			width={1262}
			height={219}
			className={cn("h-8 w-auto md:h-10", className)}
			priority
		/>
	);
}
