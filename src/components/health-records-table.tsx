import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { pg } from "@/workers/pglite.worker-instance";

import { Code } from "@phosphor-icons/react";
import { type HealthRecordRow, columns } from "./health-records/columns";
import { DataTable } from "./health-records/data-table";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";

const DEFAULT_QUERY = `SELECT 
  id, type, source_name as "sourceName", source_version as "sourceVersion",
  device, unit, value, creation_date as "creationDate",
  start_date as "startDate", end_date as "endDate"
FROM records 
ORDER BY start_date DESC
LIMIT :pageSize
OFFSET :page`;

const processQuery = (query: string, page: number, pageSize: number) => {
	return query
		.replace(/:pageSize/g, pageSize.toString())
		.replace(/:page/g, (page * pageSize).toString());
};

export function HealthRecordsTable() {
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	const [activeTab, setActiveTab] = useState<"builder" | "custom">("builder");
	const [customQuery, setCustomQuery] = useState(DEFAULT_QUERY);

	const totalCountQuery = useQuery({
		queryKey: ["stats", "records-count"],
		queryFn: async () => {
			const result = await pg.query<{ count: number }>(
				"SELECT COUNT(*) as count FROM records",
			);
			return result.rows[0].count;
		},
	});

	const recordsQuery = useQuery({
		queryKey: ["stats", "records", activeTab, customQuery, page, pageSize],
		queryFn: async () => {
			const processedQuery = processQuery(
				activeTab === "builder" ? DEFAULT_QUERY : customQuery,
				page,
				pageSize,
			);

			const result = await pg.query<HealthRecordRow>(processedQuery);
			return result.rows;
		},
	});

	const handleRunQuery = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const query = formData.get("query") as string;
		setCustomQuery(query);
	};

	if (recordsQuery.isError) {
		return (
			<Alert variant="destructive">
				<AlertDescription>
					Error executing query: {(recordsQuery.error as Error).message}
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="container space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>SQL Query</CardTitle>
				</CardHeader>
				<CardContent>
					<Tabs
						value={activeTab}
						onValueChange={(v) => setActiveTab(v as "builder" | "custom")}
					>
						<TabsList className="grid grid-cols-2 w-full">
							<TabsTrigger value="builder">Default Query</TabsTrigger>
							<TabsTrigger value="custom">
								<Code className="mr-2" /> Custom SQL
							</TabsTrigger>
						</TabsList>

						<TabsContent value="builder">
							<div className="space-y-4">
								<Textarea
									value={customQuery}
									readOnly
									className="font-mono text-sm min-h-[100px]"
								/>
							</div>
						</TabsContent>

						<TabsContent value="custom">
							<div className="pt-2 space-y-4">
								<Alert variant="default">
									<AlertDescription className="space-y-2">
										<div>Your query must return these columns:</div>
										<code className="block ml-2">
											id, type, sourceName, sourceVersion, device, unit, value,
											creationDate, startDate, endDate
										</code>
										<div className="mt-2">Available pagination variables:</div>
										<code className="block ml-2">
											:pageSize - Number of records per page
											<br /> :page - Current page offset (automatically
											calculated as page * pageSize)
										</code>
									</AlertDescription>
								</Alert>
								<form onSubmit={handleRunQuery} className="space-y-4">
									<Textarea
										name="query"
										defaultValue={customQuery}
										className="font-mono text-sm min-h-[200px]"
									/>
									<div className="flex gap-2">
										<Button type="submit">Run Query</Button>
										<Button
											onClick={() => {
												setCustomQuery(DEFAULT_QUERY);
												setPage(0);
											}}
											variant="secondary"
											type="button"
										>
											Reset Query
										</Button>
									</div>
								</form>
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			<DataTable
				columns={columns}
				data={recordsQuery.data ?? []}
				pagination={{
					pageIndex: page,
					pageSize,
					totalCount: totalCountQuery.data ?? 0,
					pageCount: Math.ceil((totalCountQuery.data ?? 0) / pageSize),
					onPageChange: (newPage) => {
						setPage(newPage);
					},
					onPageSizeChange: (newPageSize) => {
						setPageSize(newPageSize);
						setPage(0);
					},
				}}
			/>
		</div>
	);
}
