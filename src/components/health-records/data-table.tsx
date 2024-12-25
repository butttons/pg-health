"use client";

import {
	type ColumnDef,
	type ColumnFiltersState,
	type SortingState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	pagination?: {
		pageIndex: number;
		pageSize: number;
		pageCount: number;
		totalCount: number;
		onPageChange: (page: number) => void;
		onPageSizeChange: (pageSize: number) => void;
	};
}

export function DataTable<TData, TValue>({
	columns,
	data,
	pagination,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		onSortingChange: setSorting,
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			sorting,
			columnFilters,
		},
	});

	return (
		<div>
			<div className="flex items-center py-4">
				<Input
					placeholder="Filter by type..."
					value={(table.getColumn("type")?.getFilterValue() as string) ?? ""}
					onChange={(event) =>
						table.getColumn("type")?.setFilterValue(event.target.value)
					}
					className="max-w-sm"
				/>
			</div>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex justify-between items-center py-4">
				<div className="flex items-center space-x-2">
					<p className="text-sm text-muted-foreground">
						Page {(pagination?.pageIndex ?? 0) + 1} of {pagination?.pageCount} |
						Total {pagination?.totalCount.toLocaleString()}
					</p>
					<select
						value={pagination?.pageSize}
						onChange={(e) =>
							pagination?.onPageSizeChange(Number(e.target.value))
						}
						className="p-1 rounded border"
					>
						{[10, 20, 30, 40, 50].map((pageSize) => (
							<option key={pageSize} value={pageSize}>
								Show {pageSize}
							</option>
						))}
					</select>
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => pagination?.onPageChange(pagination.pageIndex - 1)}
						disabled={pagination?.pageIndex === 0}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => pagination?.onPageChange(pagination.pageIndex + 1)}
						disabled={
							pagination?.pageIndex === (pagination?.pageCount ?? 0) - 1
						}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}
