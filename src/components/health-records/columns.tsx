"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

export type HealthRecordRow = {
	id: string;
	type: string;
	sourceName: string;
	sourceVersion: string;
	device?: string;
	unit: string;
	value: number;
	creationDate: string;
	startDate: string;
	endDate: string;
};

export const columns: ColumnDef<HealthRecordRow>[] = [
	{
		accessorKey: "type",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Type
					<ArrowUpDown className="ml-2 w-4 h-4" />
				</Button>
			);
		},
	},
	{
		accessorKey: "sourceName",
		header: "Source",
	},
	{
		accessorKey: "value",
		header: () => <div className="text-right">Value</div>,
		cell: ({ row }) => {
			const value = Number.parseFloat(row.getValue("value"));
			const unit = row.original.unit;

			return (
				<div className="font-medium text-right">
					{value} {unit}
				</div>
			);
		},
	},
	{
		accessorKey: "startDate",
		header: "Date",
		cell: ({ row }) => {
			return new Date(row.getValue("startDate")).toLocaleDateString();
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const record = row.original;

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="p-0 w-8 h-8">
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="w-4 h-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuItem
							onClick={() => navigator.clipboard.writeText(record.id)}
						>
							Copy record ID
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem>View details</DropdownMenuItem>
						<DropdownMenuItem>View metadata</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];
