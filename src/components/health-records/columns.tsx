"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { ArrowsDownUp } from "@phosphor-icons/react";

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
					<ArrowsDownUp className="ml-2 w-4 h-4" />
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
];
