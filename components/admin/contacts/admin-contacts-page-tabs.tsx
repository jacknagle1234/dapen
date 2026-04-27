"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";
import type * as React from "react";
import { AdminCrmContactsTable } from "@/components/admin/contacts/admin-crm-contacts-table";
import { AdminContactsForm } from "@/components/admin/organizations/admin-contacts-form";
import {
	UnderlinedTabs,
	UnderlinedTabsContent,
	UnderlinedTabsList,
	UnderlinedTabsTrigger,
} from "@/components/ui/custom/underlined-tabs";

const tabValues = ["contacts", "add-contacts"] as const;
type TabValue = (typeof tabValues)[number];

export function AdminContactsPageTabs(): React.JSX.Element {
	const [tab, setTab] = useQueryState(
		"tab",
		parseAsStringLiteral(tabValues).withDefault("contacts"),
	);

	return (
		<UnderlinedTabs
			className="w-full"
			value={tab}
			onValueChange={(value) => void setTab(value as TabValue)}
		>
			<UnderlinedTabsList className="mb-6 sm:-ml-4">
				<UnderlinedTabsTrigger value="contacts">Contacts</UnderlinedTabsTrigger>
				<UnderlinedTabsTrigger value="add-contacts">
					Add Contacts
				</UnderlinedTabsTrigger>
			</UnderlinedTabsList>
			<UnderlinedTabsContent value="contacts">
				<AdminCrmContactsTable />
			</UnderlinedTabsContent>
			<UnderlinedTabsContent value="add-contacts">
				<AdminContactsForm />
			</UnderlinedTabsContent>
		</UnderlinedTabs>
	);
}
