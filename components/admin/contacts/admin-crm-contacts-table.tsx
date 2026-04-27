"use client";

import NiceModal from "@ebay/nice-modal-react";
import type {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { ExternalLinkIcon, MoreHorizontalIcon } from "lucide-react";
import {
	parseAsArrayOf,
	parseAsInteger,
	parseAsJson,
	parseAsString,
	parseAsStringLiteral,
	useQueryState,
} from "nuqs";
import * as React from "react";
import { toast } from "sonner";
import { InviteOwnerModal } from "@/components/admin/contacts/invite-owner-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DataTable,
	type FilterConfig,
	SortableColumnHeader,
} from "@/components/ui/custom/data-table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { appConfig } from "@/config/app.config";
import { cn } from "@/lib/utils";
import {
	ContactSortField,
	type DirectMailStatus,
} from "@/schemas/admin-organization-schemas";
import { trpc } from "@/trpc/client";

const DEFAULT_SORTING: SortingState = [{ id: "createdAt", desc: true }];

const claimLiteral = parseAsStringLiteral(["claimed", "unclaimed"] as const);
const mailLiteral = parseAsStringLiteral([
	"not_sent",
	"queued",
	"sent",
	"returned",
] as const);

export type CrmContactRow = {
	id: string;
	name: string;
	createdAt: Date;
	hasOrgOwner: boolean;
	websiteUrl: string;
	mailingAddress: string;
	crmClaimStatus: "claimed" | "unclaimed";
	directMailStatus: DirectMailStatus;
};

const DIRECT_MAIL_LABELS: Record<DirectMailStatus, string> = {
	not_sent: "Not sent",
	queued: "Queued",
	sent: "Sent",
	returned: "Returned",
};

function truncate(s: string, max: number): string {
	if (s.length <= max) {
		return s;
	}
	return `${s.slice(0, max - 1)}…`;
}

export function AdminCrmContactsTable(): React.JSX.Element {
	const [searchQuery, setSearchQuery] = useQueryState(
		"crmQuery",
		parseAsString.withDefault("").withOptions({ shallow: true }),
	);

	const [pageIndex, setPageIndex] = useQueryState(
		"crmPageIndex",
		parseAsInteger.withDefault(0).withOptions({ shallow: true }),
	);

	const [pageSize, setPageSize] = useQueryState(
		"crmPageSize",
		parseAsInteger
			.withDefault(appConfig.pagination.defaultLimit)
			.withOptions({ shallow: true }),
	);

	const [claimFilter, setClaimFilter] = useQueryState(
		"crmClaim",
		parseAsArrayOf(claimLiteral).withDefault([]).withOptions({ shallow: true }),
	);

	const [mailFilter, setMailFilter] = useQueryState(
		"crmMail",
		parseAsArrayOf(mailLiteral).withDefault([]).withOptions({ shallow: true }),
	);

	const [sorting, setSorting] = useQueryState<SortingState>(
		"crmSort",
		parseAsJson<SortingState>((value) => {
			if (!Array.isArray(value)) {
				return DEFAULT_SORTING;
			}
			return value.filter(
				(item) =>
					item &&
					typeof item === "object" &&
					"id" in item &&
					typeof item.desc === "boolean",
			) as SortingState;
		})
			.withDefault(DEFAULT_SORTING)
			.withOptions({ shallow: true }),
	);

	const utils = trpc.useUtils();

	const sortParams = React.useMemo(() => {
		const fallbackSort = { id: "createdAt", desc: true } as const;
		const currentSort = sorting?.[0] ?? DEFAULT_SORTING[0] ?? fallbackSort;
		const sortBy = ContactSortField.options.includes(
			currentSort.id as (typeof ContactSortField.options)[number],
		)
			? (currentSort.id as (typeof ContactSortField.options)[number])
			: "createdAt";
		const sortOrder = currentSort.desc ? ("desc" as const) : ("asc" as const);
		return { sortBy, sortOrder };
	}, [sorting]);

	const queryInput = React.useMemo(
		() => ({
			limit: pageSize || appConfig.pagination.defaultLimit,
			offset:
				(pageIndex || 0) * (pageSize || appConfig.pagination.defaultLimit),
			query: searchQuery || "",
			sortBy: sortParams.sortBy,
			sortOrder: sortParams.sortOrder,
			filters: {
				crmClaimStatus:
					claimFilter && claimFilter.length > 0 ? claimFilter : undefined,
				directMailStatus:
					mailFilter && mailFilter.length > 0 ? mailFilter : undefined,
			},
		}),
		[pageSize, pageIndex, searchQuery, sortParams, claimFilter, mailFilter],
	);

	const { data, isPending } = trpc.admin.organization.listMyContacts.useQuery(
		queryInput,
		{ placeholderData: (prev) => prev },
	);

	const updateCrm = trpc.admin.organization.updateContactCrm.useMutation({
		onSuccess: () => {
			void utils.admin.organization.listMyContacts.invalidate();
		},
		onError: (e) => {
			toast.error(e.message || "Update failed");
		},
	});

	const [pendingOrgId, setPendingOrgId] = React.useState<string | null>(null);

	const columnFilters = React.useMemo(() => {
		const filters: { id: string; value: string[] }[] = [];
		if (claimFilter?.length) {
			filters.push({ id: "crmClaimStatus", value: claimFilter });
		}
		if (mailFilter?.length) {
			filters.push({ id: "directMailStatus", value: mailFilter });
		}
		return filters;
	}, [claimFilter, mailFilter]);

	const handleFiltersChange = (filters: ColumnFiltersState): void => {
		const getVal = (id: string): string[] => {
			const f = filters.find((x) => x.id === id);
			return Array.isArray(f?.value) ? (f.value as string[]) : [];
		};
		void setClaimFilter(
			getVal("crmClaimStatus") as ("claimed" | "unclaimed")[],
		);
		void setMailFilter(getVal("directMailStatus") as DirectMailStatus[]);
		if (pageIndex !== 0) {
			void setPageIndex(0);
		}
	};

	const handleSortingChange = (newSorting: SortingState): void => {
		void setSorting(newSorting.length > 0 ? newSorting : DEFAULT_SORTING);
		if (pageIndex !== 0) {
			void setPageIndex(0);
		}
	};

	const handleSearchQueryChange = (value: string): void => {
		if (value !== searchQuery) {
			void setSearchQuery(value);
			if (pageIndex !== 0) {
				void setPageIndex(0);
			}
		}
	};

	const crmFilters: FilterConfig[] = [
		{
			key: "crmClaimStatus",
			title: "Claim",
			options: [
				{ value: "unclaimed", label: "Unclaimed" },
				{ value: "claimed", label: "Claimed" },
			],
		},
		{
			key: "directMailStatus",
			title: "Direct mail",
			options: [
				{ value: "not_sent", label: "Not sent" },
				{ value: "queued", label: "Queued" },
				{ value: "sent", label: "Sent" },
				{ value: "returned", label: "Returned" },
			],
		},
	];

	const columns: ColumnDef<CrmContactRow>[] = [
		{
			accessorKey: "name",
			header: ({ column }) => (
				<SortableColumnHeader column={column} title="Business" />
			),
			cell: ({ row }) => {
				const { name, websiteUrl } = row.original;
				return (
					<div className="flex max-w-[200px] items-center gap-2 py-2">
						<span className="truncate font-medium text-foreground">{name}</span>
						{websiteUrl ? (
							<a
								href={websiteUrl}
								target="_blank"
								rel="noreferrer"
								className="shrink-0 text-muted-foreground hover:text-foreground"
								title="Open website"
							>
								<ExternalLinkIcon className="size-3.5" />
							</a>
						) : null}
					</div>
				);
			},
		},
		{
			accessorKey: "websiteUrl",
			enableSorting: false,
			header: () => (
				<div className="font-medium text-foreground text-xs">Website</div>
			),
			cell: ({ row }) => {
				const url = row.original.websiteUrl;
				if (!url) {
					return <span className="text-muted-foreground text-xs">—</span>;
				}
				return (
					<a
						href={url}
						target="_blank"
						rel="noreferrer"
						className="block max-w-[140px] truncate text-primary text-xs underline-offset-2 hover:underline"
					>
						{truncate(url.replace(/^https?:\/\//, ""), 32)}
					</a>
				);
			},
		},
		{
			accessorKey: "mailingAddress",
			enableSorting: false,
			header: () => (
				<div className="font-medium text-foreground text-xs">Mail-to</div>
			),
			cell: ({ row }) => {
				const addr = row.original.mailingAddress;
				if (!addr) {
					return <span className="text-muted-foreground text-xs">—</span>;
				}
				const short = truncate(addr, 48);
				return (
					<Tooltip>
						<TooltipTrigger asChild>
							<span className="block max-w-[200px] cursor-default truncate text-foreground/80 text-xs">
								{short}
							</span>
						</TooltipTrigger>
						<TooltipContent className="max-w-sm whitespace-pre-wrap">
							{addr}
						</TooltipContent>
					</Tooltip>
				);
			},
		},
		{
			accessorKey: "crmClaimStatus",
			enableSorting: false,
			header: () => (
				<div className="font-medium text-foreground text-xs">Claim</div>
			),
			cell: ({ row }) => {
				const { crmClaimStatus } = row.original;
				const claimed = crmClaimStatus === "claimed";
				return (
					<Badge
						className={cn(
							claimed
								? "border-green-600/30 bg-green-100 text-green-800 dark:border-green-500/40 dark:bg-green-950 dark:text-green-200"
								: "border-red-600/30 bg-red-100 text-red-800 dark:border-red-500/40 dark:bg-red-950 dark:text-red-200",
						)}
					>
						{claimed ? "Claimed" : "Unclaimed"}
					</Badge>
				);
			},
			filterFn: (row, _id, value: string[]) =>
				value.length === 0 ||
				value.includes(row.original.crmClaimStatus as string),
		},
		{
			accessorKey: "hasOrgOwner",
			enableSorting: false,
			header: () => (
				<div className="font-medium text-foreground text-xs">Org owner</div>
			),
			cell: ({ row }) => {
				const has = row.original.hasOrgOwner;
				return (
					<Badge
						variant="outline"
						className={cn(
							has
								? "border-emerald-600/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
								: "border-amber-600/50 bg-amber-50 text-amber-950 dark:bg-amber-950 dark:text-amber-100",
						)}
					>
						{has ? "Yes" : "No"}
					</Badge>
				);
			},
		},
		{
			accessorKey: "directMailStatus",
			enableSorting: false,
			header: () => (
				<div className="font-medium text-foreground text-xs">Direct mail</div>
			),
			cell: ({ row }) => {
				const { id, directMailStatus } = row.original;
				const busy = updateCrm.isPending && pendingOrgId === id;
				return (
					<Select
						value={directMailStatus}
						disabled={busy}
						onValueChange={(v) => {
							setPendingOrgId(id);
							updateCrm.mutate(
								{
									organizationId: id,
									directMailStatus: v as DirectMailStatus,
								},
								{ onSettled: () => setPendingOrgId(null) },
							);
						}}
					>
						<SelectTrigger className="h-8 w-[130px] text-xs">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{(Object.keys(DIRECT_MAIL_LABELS) as DirectMailStatus[]).map(
								(key) => (
									<SelectItem key={key} value={key} className="text-xs">
										{DIRECT_MAIL_LABELS[key]}
									</SelectItem>
								),
							)}
						</SelectContent>
					</Select>
				);
			},
			filterFn: (row, _id, value: string[]) =>
				value.length === 0 ||
				value.includes(row.original.directMailStatus as string),
		},
		{
			accessorKey: "createdAt",
			header: ({ column }) => (
				<SortableColumnHeader column={column} title="Created" />
			),
			cell: ({ row }) => (
				<div className="text-foreground/80 text-xs">
					{format(row.original.createdAt, "dd MMM, yyyy")}
				</div>
			),
		},
		{
			id: "actions",
			enableSorting: false,
			cell: ({ row }) => {
				const { id, name } = row.original;
				return (
					<div className="flex justify-end">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
									size="icon"
									variant="ghost"
								>
									<MoreHorizontalIcon className="shrink-0" />
									<span className="sr-only">Open menu</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem
									onSelect={(e) => {
										e.preventDefault();
										NiceModal.show(InviteOwnerModal, {
											organizationId: id,
											organizationName: name,
										});
									}}
								>
									Invite owner
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				);
			},
		},
	];

	const rows: CrmContactRow[] = (data?.contacts ?? []) as CrmContactRow[];

	return (
		<DataTable
			columnFilters={columnFilters}
			columns={columns}
			data={rows}
			defaultSorting={DEFAULT_SORTING}
			emptyMessage="No contacts yet. Add one from the Add Contacts tab."
			enableFilters
			enablePagination
			enableSearch
			filters={crmFilters}
			loading={isPending}
			onFiltersChange={handleFiltersChange}
			onPageIndexChange={(i) => void setPageIndex(i)}
			onPageSizeChange={(s) => void setPageSize(s)}
			onSearchQueryChange={handleSearchQueryChange}
			onSortingChange={(s) => void handleSortingChange(s)}
			pageIndex={pageIndex || 0}
			pageSize={pageSize || appConfig.pagination.defaultLimit}
			getRowId={(row) => row.id}
			searchPlaceholder="Search by business name…"
			searchQuery={searchQuery || ""}
			sorting={sorting}
			totalCount={data?.total ?? 0}
		/>
	);
}
