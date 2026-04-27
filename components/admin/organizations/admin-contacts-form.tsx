"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useZodForm } from "@/hooks/use-zod-form";
import { logger } from "@/lib/logger";
import { createOrganizationFromContactAdminSchema } from "@/schemas/admin-organization-schemas";
import { trpc } from "@/trpc/client";

const CSV_EXAMPLE = `business_name,website_url,mailing_address
Acme Inc.,https://acme.example.com,"123 Main St, Springfield, IL 62701"
Widget Co.,widget.io,"456 Oak Ave, Portland, OR 97201"`;

export function AdminContactsForm(): React.JSX.Element {
	const utils = trpc.useUtils();
	const [csvText, setCsvText] = React.useState("");
	const [csvFileKey, setCsvFileKey] = React.useState(0);

	const form = useZodForm({
		schema: createOrganizationFromContactAdminSchema,
		defaultValues: {
			businessName: "",
			websiteUrl: "",
			mailingAddress: "",
		},
	});

	const importCsvMutation =
		trpc.admin.organization.importContactsFromCsv.useMutation({
			onSuccess: (result) => {
				const failPreview = result.failures
					.slice(0, 5)
					.map(
						(f) =>
							`Row ${f.rowNumber}${f.businessName ? ` (${f.businessName})` : ""}: ${f.message}`,
					)
					.join("\n");
				const more =
					result.failures.length > 5
						? `\n… and ${result.failures.length - 5} more`
						: "";

				if (result.createdCount === 0 && result.failures.length > 0) {
					toast.error("No organizations were created.", {
						description: (failPreview + more).trim() || undefined,
						duration: 14_000,
					});
				} else if (result.failures.length > 0) {
					toast.warning(
						`Imported ${result.createdCount} contact(s); ${result.failures.length} row(s) failed.`,
						{
							description: (failPreview + more).trim() || undefined,
							duration: 12_000,
						},
					);
				} else {
					toast.success(
						`Imported ${result.createdCount} contact organization(s).`,
					);
				}

				setCsvText("");
				setCsvFileKey((k) => k + 1);
				void utils.admin.organization.list.invalidate();
				void utils.admin.organization.listMyContacts.invalidate();
				void utils.organization.list.invalidate();
			},
			onError: (error) => {
				logger.error(error);
				toast.error(error.message || "Could not import CSV.");
			},
		});

	const createMutation = trpc.admin.organization.createFromContact.useMutation({
		onSuccess: (org) => {
			toast.success(`Organization "${org.name}" created.`);
			form.reset({
				businessName: "",
				websiteUrl: "",
				mailingAddress: "",
			});
			void utils.admin.organization.list.invalidate();
			void utils.admin.organization.listMyContacts.invalidate();
			void utils.organization.list.invalidate();
		},
		onError: (error) => {
			logger.error(error);
			toast.error(error.message || "Could not create organization.");
		},
	});

	const onSubmit = form.handleSubmit((values) => {
		createMutation.mutate(values);
	});

	const onCsvFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) {
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			const text = typeof reader.result === "string" ? reader.result : "";
			setCsvText(text);
		};
		reader.readAsText(file);
	};

	const onCsvImport = () => {
		if (!csvText.trim()) {
			toast.error("Choose a CSV file first.");
			return;
		}
		importCsvMutation.mutate({ csvText });
	};

	return (
		<div className="flex max-w-xl flex-col gap-8">
			<Card>
				<CardHeader>
					<CardTitle>Add contact</CardTitle>
					<CardDescription>
						Creates an organization using the business name. You are added as an
						Account Manager (not owner).
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={onSubmit} className="space-y-4">
							<FormField
								control={form.control}
								name="businessName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Business name</FormLabel>
										<FormControl>
											<Input
												placeholder="Acme Inc."
												autoComplete="organization"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="websiteUrl"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Website URL</FormLabel>
										<FormControl>
											<Input
												placeholder="https://example.com"
												inputMode="url"
												autoComplete="url"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="mailingAddress"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Mailing address</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Street, city, state, ZIP"
												rows={4}
												className="resize-y"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" disabled={createMutation.isPending}>
								{createMutation.isPending ? "Creating…" : "Create organization"}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Import from CSV</CardTitle>
					<CardDescription>
						First row must be headers. Required columns (flexible names):{" "}
						<strong>business name</strong>, <strong>website URL</strong>,{" "}
						<strong>mailing address</strong>. Up to 500 rows per file.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="contacts-csv-file">CSV file</Label>
						<Input
							key={csvFileKey}
							id="contacts-csv-file"
							type="file"
							accept=".csv,text/csv"
							onChange={onCsvFileChange}
							className="cursor-pointer"
						/>
						{csvText ? (
							<p className="text-muted-foreground text-sm">
								Loaded {csvText.length.toLocaleString()} characters — ready to
								import.
							</p>
						) : null}
					</div>
					<div className="space-y-2">
						<p className="font-medium text-sm">Example</p>
						<pre className="bg-muted max-h-40 overflow-auto rounded-md border p-3 font-mono text-xs">
							{CSV_EXAMPLE}
						</pre>
					</div>
					<Button
						type="button"
						variant="secondary"
						disabled={importCsvMutation.isPending || !csvText.trim()}
						onClick={onCsvImport}
					>
						{importCsvMutation.isPending ? "Importing…" : "Import CSV"}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
