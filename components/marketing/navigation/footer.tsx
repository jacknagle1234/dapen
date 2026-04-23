"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { appConfig } from "@/config/app.config";

// Build footer links based on config (matching original footer)
const footerLinks = [
	{
		group: "Product",
		items: [
			{ title: "Features", href: "/#features" },
			{ title: "FAQ", href: "/#faq" },
		],
	},
	{
		group: "Resources",
		items: [
			{
				title: "Toolbar",
				href: "/blog/what-is-a-dapen-toolbar",
			},
			{ title: "Blog", href: "/blog" },
		],
	},
	{
		group: "Company",
		items: [
			{ title: "About", href: "/about" },
			...(appConfig.contact.enabled
				? [{ title: "Contact", href: "/contact" }]
				: []),
		],
	},
	{
		group: "Legal",
		items: [
			{ title: "Privacy Policy", href: "/legal/privacy" },
			{ title: "Terms of Service", href: "/legal/terms" },
		],
	},
];

function AppInfo() {
	return (
		<div className="flex max-w-sm flex-col items-start gap-2">
			<Logo className="h-5 w-auto md:h-6" />
			<div className="flex flex-col gap-4 text-marketing-fg-muted">
				<p>
					Our mission is to provide free education to help businesses improve
					website accessibility.
				</p>
			</div>
		</div>
	);
}

export function Footer() {
	return (
		<footer className="pt-24" id="footer">
			<div className="bg-marketing-card/50 border-t border-marketing-border py-16">
				<div className="mx-auto flex max-w-7xl flex-col gap-16 px-6 lg:px-10">
					{/* Top Section */}
					<div className="grid grid-cols-1 gap-x-12 gap-y-16 text-sm lg:grid-cols-2">
						{/* App Info */}
						<AppInfo />

						{/* Links Grid */}
						<nav className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
							{footerLinks.map((group) => (
								<div key={group.group} className="flex flex-col gap-4">
									<h3 className="font-semibold tracking-wider text-marketing-fg uppercase text-xs">
										{group.group}
									</h3>
									<ul className="flex flex-col gap-3">
										{group.items.map((item) => (
											<li key={item.title}>
												<Link
													href={item.href}
													className="text-marketing-fg-muted hover:text-marketing-fg transition-colors duration-200"
												>
													{item.title}
												</Link>
											</li>
										))}
									</ul>
								</div>
							))}
						</nav>
					</div>

					{/* Bottom Section */}
					<div className="border-t border-marketing-border pt-8 text-sm">
						<div className="text-marketing-fg-muted text-center sm:text-left">
							© {new Date().getFullYear()} DAPEN.org. All rights reserved.
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
