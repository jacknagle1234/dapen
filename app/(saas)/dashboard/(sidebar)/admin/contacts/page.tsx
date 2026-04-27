import type { Metadata } from "next";
import type * as React from "react";
import { AdminContactsPageTabs } from "@/components/admin/contacts/admin-contacts-page-tabs";
import {
	Page,
	PageBody,
	PageBreadcrumb,
	PageContent,
	PageHeader,
	PagePrimaryBar,
} from "@/components/ui/custom/page";

export const metadata: Metadata = {
	title: "Contacts",
};

export default function AdminContactsPage(): React.JSX.Element {
	return (
		<Page>
			<PageHeader>
				<PagePrimaryBar>
					<PageBreadcrumb
						segments={[
							{ label: "Home", href: "/dashboard" },
							{ label: "Admin", href: "/dashboard/admin" },
							{ label: "Contacts" },
						]}
					/>
				</PagePrimaryBar>
			</PageHeader>
			<PageBody>
				<PageContent title="Contacts">
					<AdminContactsPageTabs />
				</PageContent>
			</PageBody>
		</Page>
	);
}
