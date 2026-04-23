/**
 * Removes DAPEN Toolbar DOM and styles injected outside React (SPA navigation).
 * Mirrors cleanup patterns from the AccessibleWebWidget bundle.
 */
export function removeDapenToolbarFromDom(): void {
	if (typeof document === "undefined") {
		return;
	}

	const toolbarScriptHost = "toolbar.dapen.org";

	const rootSelectors = [
		".acc-widget",
		".acc-menu",
		".acc-container",
		".acc-rg-container",
		".acc-report-panel",
		".acc-annotation-layer",
		"#acc-skip-link",
	];

	for (const rootSelector of rootSelectors) {
		document.querySelectorAll(rootSelector).forEach((el) => {
			el.remove();
		});
	}

	document
		.querySelectorAll<HTMLStyleElement>('style[id^="acc-"]')
		.forEach((el) => {
			el.remove();
		});

	const staticStyle = document.getElementById("acc-static-styles");
	if (staticStyle) {
		staticStyle.remove();
	}

	for (const cls of [...document.documentElement.classList]) {
		if (cls.startsWith("acc-")) {
			document.documentElement.classList.remove(cls);
		}
	}

	if (document.body) {
		for (const cls of [...document.body.classList]) {
			if (cls.startsWith("acc-")) {
				document.body.classList.remove(cls);
			}
		}
	}

	document.querySelectorAll("[data-acc-baseSize]").forEach((el) => {
		if (el instanceof HTMLElement) {
			el.style.fontSize = "";
			el.removeAttribute("data-acc-baseSize");
		}
	});

	const accWindow = window as Window & {
		__accweb__scrollGuide?: (e: MouseEvent) => void;
		AccessibleWebWidget?: unknown;
		AccessibleWebWidgetOptions?: unknown;
	};

	if (accWindow.__accweb__scrollGuide) {
		document.removeEventListener("mousemove", accWindow.__accweb__scrollGuide);
		delete accWindow.__accweb__scrollGuide;
	}

	document.querySelectorAll("script[src]").forEach((el) => {
		const src = el.getAttribute("src") ?? "";
		if (src.includes(toolbarScriptHost)) {
			el.remove();
		}
	});

	delete accWindow.AccessibleWebWidget;
	delete accWindow.AccessibleWebWidgetOptions;
}
