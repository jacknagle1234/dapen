"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { logger } from "@/lib/logger";
import { isMarketingPathname } from "@/lib/marketing/is-marketing-path";
import { removeDapenToolbarFromDom } from "@/lib/marketing/remove-dapen-toolbar-dom";

/**
 * When leaving the marketing site via client navigation, the toolbar script injects
 * DOM outside React; remove it so SaaS/docs routes do not show a stale widget.
 */
export function DapenToolbarNavigationCleanup() {
	const pathname = usePathname();
	const wasMarketingRef = useRef<boolean | null>(null);

	useEffect(() => {
		const onMarketing = isMarketingPathname(pathname);

		if (wasMarketingRef.current === true && !onMarketing) {
			try {
				removeDapenToolbarFromDom();
			} catch (error) {
				logger.error({ error }, "DAPEN toolbar DOM cleanup failed");
			}
		}

		wasMarketingRef.current = onMarketing;
	}, [pathname]);

	return null;
}
