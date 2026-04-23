/** CDN URL for the DAPEN Toolbar install bundle (marketing site + install snippet in dashboard). */
export const toolbarConfig = {
	scriptSrc: "https://toolbar.dapen.org/dist/install.js",
} as const;

export type ToolbarConfig = typeof toolbarConfig;

export function getToolbarInstallSnippet(): string {
	return `<script src="${toolbarConfig.scriptSrc}"></script>`;
}
