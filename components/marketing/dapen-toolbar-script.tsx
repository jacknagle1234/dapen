import { toolbarConfig } from "@/config/toolbar.config";

/** Marketing site only — not loaded on SaaS, docs, or API routes. */
export function DapenToolbarScript() {
	return <script async src={toolbarConfig.scriptSrc} />;
}
