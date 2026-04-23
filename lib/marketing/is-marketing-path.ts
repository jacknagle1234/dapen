/**
 * Routes that use `app/(marketing)/layout.tsx` (public marketing site only).
 */
export function isMarketingPathname(pathname: string): boolean {
	if (pathname === "/") {
		return true;
	}

	const marketingPrefixes = [
		"/about",
		"/blog",
		"/careers",
		"/changelog",
		"/contact",
		"/legal",
	] as const;

	return marketingPrefixes.some(
		(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
	);
}
