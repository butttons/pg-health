"use client";

import { Code, PlusCircle, Spinner, Trash, X } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

import { pg } from "@/workers/pglite.worker-instance";

import { HealthDataRenderer } from "@/components/charts/health-data-renderer";
import { TypeCombobox } from "@/components/health-records/type-combobox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerRange } from "@/components/ui/date-picker-range";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

function buildHealthDataQuery(
	type: string,
	aggregationMethod:
		| "SUM"
		| "AVG"
		| "MIN"
		| "MAX"
		| "COUNT"
		| "STDDEV"
		| "MEDIAN"
		| "MODE"
		| "VARIANCE",
	dateUnit: "day" | "month" | "quarter" | "year",
	dateRange?: DateRange,
): string {
	let dateExpression: string;
	let dateFilter = "";

	if (dateRange?.from) {
		dateFilter += ` AND creation_date >= '${dateRange.from.toISOString()}'`;
	}
	if (dateRange?.to) {
		dateFilter += ` AND creation_date <= '${dateRange.to.toISOString()}'`;
	}

	if (dateUnit === "day") {
		dateExpression = "DATE(creation_date)";
	} else if (dateUnit === "month") {
		dateExpression = "DATE_TRUNC('month', creation_date)";
	} else if (dateUnit === "quarter") {
		dateExpression = "DATE_TRUNC('quarter', creation_date)";
	} else if (dateUnit === "year") {
		dateExpression = "DATE_TRUNC('year', creation_date)";
	} else {
		throw new Error("Unsupported date unit");
	}

	const query = `
    SELECT
      ${dateExpression} as date,
      MIN(creation_date) as timestamp,
      ${aggregationMethod}(value) as value,
      MIN(unit) as unit
    FROM records
    WHERE type = '${type}'${dateFilter}
    GROUP BY ${dateExpression}
    ORDER BY date;
  `;

	return query.trim();
}

type DataSeries = {
	id: string;
	type: string;
	aggregationMethod:
		| "SUM"
		| "AVG"
		| "MIN"
		| "MAX"
		| "COUNT"
		| "STDDEV"
		| "MEDIAN"
		| "MODE"
		| "VARIANCE";
};

type ChartData = {
	date: string;
	timestamp: string;
	value: number;
	unit: string;
};

const aggregationMethods = [
	{ value: "SUM", label: "Sum" },
	{ value: "AVG", label: "Average" },
	{ value: "MIN", label: "Minimum" },
	{ value: "MAX", label: "Maximum" },
	{ value: "COUNT", label: "Count" },
	{ value: "STDDEV", label: "Standard Deviation" },
	{ value: "MEDIAN", label: "Median" },
	{ value: "MODE", label: "Mode" },
	{ value: "VARIANCE", label: "Variance" },
] as const;

const dateUnits = [
	{ value: "day", label: "Day" },
	{ value: "month", label: "Month" },
	{ value: "quarter", label: "Quarter" },
	{ value: "year", label: "Year" },
] as const;

const chartTypes = [
	{ value: "line", label: "Line" },
	{ value: "bar", label: "Bar" },
	{ value: "area", label: "Area" },
] as const;

export function HealthDataChart() {
	const [series, setSeries] = useState<DataSeries[]>([
		{
			id: crypto.randomUUID(),
			type: "HKQuantityTypeIdentifierHeartRate",
			aggregationMethod: "AVG",
		},
	]);

	const [dateUnit, setDateUnit] = useState<
		"day" | "month" | "quarter" | "year"
	>("day");
	const [dateRange, setDateRange] = useState<DateRange>();
	const [chartType, setChartType] = useState<"line" | "bar">("line");
	const [isSmooth, setIsSmooth] = useState(true);
	const [activeTab, setActiveTab] = useState<"builder" | "sql">("builder");
	const [customQuery, setCustomQuery] = useState(() => {
		return buildHealthDataQuery(
			series[0].type,
			series[0].aggregationMethod,
			dateUnit,
			dateRange,
		);
	});

	// Query for available types
	const typesQuery = useQuery({
		queryKey: ["stats", "health-data-types"],
		queryFn: async () => {
			const result = await pg.query<{ type: string }>(
				"SELECT DISTINCT type FROM records ORDER BY type",
			);
			return result.rows;
		},
	});

	// Query for chart data
	const chartDataQuery = useQuery({
		queryKey: [
			"stats",
			"health-data-chart",
			activeTab,
			customQuery,
			series,
			dateUnit,
			dateRange,
		],
		queryFn: async () => {
			if (activeTab === "sql") {
				const result = await pg.query<ChartData>(customQuery);
				return { custom: result.rows };
			}

			const results = await Promise.all(
				series.map(async (s) => {
					const query = buildHealthDataQuery(
						s.type,
						s.aggregationMethod,
						dateUnit,
						dateRange,
					);
					const result = await pg.query<ChartData>(query);
					return { id: s.id, data: result.rows };
				}),
			);
			return results.reduce(
				(acc, { id, data }) => {
					acc[id] = data;
					return acc;
				},
				{} as Record<string, ChartData[]>,
			);
		},
		enabled: activeTab === "sql" ? Boolean(customQuery) : series.length > 0,
	});

	const addNewSeries = () => {
		setSeries((prev) => [
			...prev,
			{
				id: crypto.randomUUID(),
				type: typesQuery.data?.[0]?.type ?? "",
				aggregationMethod: "AVG",
			},
		]);
	};

	const removeSeries = (id: string) => {
		setSeries((prev) => prev.filter((s) => s.id !== id));
	};

	const updateSeries = (id: string, updates: Partial<DataSeries>) => {
		setSeries((prev) =>
			prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
		);
	};

	const handleRunQuery = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const query = formData.get("query") as string;
		setCustomQuery(query);
	};

	if (!typesQuery.data)
		return <Spinner size={32} className="mx-auto my-6 animate-spin" />;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Visualize your health data</CardTitle>
				<Tabs defaultValue="builder" className="w-full">
					<TabsList className="grid grid-cols-2 w-full">
						<TabsTrigger
							value="builder"
							onClick={() => setActiveTab("builder")}
						>
							UI Builder
						</TabsTrigger>
						<TabsTrigger value="sql" onClick={() => setActiveTab("sql")}>
							<Code className="mr-2" />
							Custom SQL
						</TabsTrigger>
					</TabsList>

					<TabsContent value="builder">
						<div className="pt-4 space-y-4">
							<div className="grid gap-6 md:grid-cols-4">
								<div className="space-y-2">
									<Label>Time Grouping</Label>
									<Select
										value={dateUnit}
										onValueChange={(value) =>
											setDateUnit(value as typeof dateUnit)
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select time unit" />
										</SelectTrigger>
										<SelectContent>
											{dateUnits.map((unit) => (
												<SelectItem key={unit.value} value={unit.value}>
													{unit.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label>Date Range</Label>
									<div className="flex gap-2">
										<DatePickerRange
											date={dateRange}
											setDate={(range) => setDateRange(range)}
											className="flex-1"
										/>
										<Button
											variant="outline"
											size="icon"
											onClick={() => setDateRange(undefined)}
										>
											<X />
										</Button>
									</div>
								</div>
								<div className="space-y-2">
									<Label>Chart Type</Label>
									<Select
										value={chartType}
										onValueChange={(value) =>
											setChartType(value as "line" | "bar")
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select chart type" />
										</SelectTrigger>
										<SelectContent>
											{chartTypes.map((type) => (
												<SelectItem key={type.value} value={type.value}>
													{type.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								{chartType === "line" && (
									<div className="flex items-end space-x-2">
										<div className="space-y-2">
											<Label>Line Style</Label>
											<div className="flex items-center space-x-2 h-10">
												<Switch
													id="smooth-mode"
													checked={isSmooth}
													onCheckedChange={setIsSmooth}
												/>
												<Label htmlFor="smooth-mode">Smooth Line</Label>
											</div>
										</div>
									</div>
								)}
							</div>
							<Separator />
							<div className="space-y-4">
								<div className="flex gap-2 items-center">
									<Label>Data Series</Label>
									<Button variant="outline" size="sm" onClick={addNewSeries}>
										<PlusCircle />
										Add Series
									</Button>
								</div>

								{series.map((s) => (
									<div
										key={s.id}
										className="flex flex-col gap-4 md:flex-row md:items-end"
									>
										<div className="flex-1 space-y-2">
											<Label>Data Type</Label>
											<TypeCombobox
												types={typesQuery.data}
												value={s.type}
												onValueChange={(value) =>
													updateSeries(s.id, { type: value })
												}
											/>
										</div>
										<div className="space-y-2">
											<Label>Aggregation Method</Label>
											<Select
												value={s.aggregationMethod}
												onValueChange={(value) =>
													updateSeries(s.id, {
														aggregationMethod:
															value as DataSeries["aggregationMethod"],
													})
												}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select aggregation" />
												</SelectTrigger>
												<SelectContent>
													{aggregationMethods.map((method) => (
														<SelectItem key={method.value} value={method.value}>
															{method.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div className="flex justify-end items-end h-full">
											{series.length > 1 && (
												<Button
													variant="outline"
													size="icon"
													onClick={() => removeSeries(s.id)}
												>
													<Trash className="w-4 h-4" />
												</Button>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					</TabsContent>

					<TabsContent value="sql">
						<div className="pt-4 space-y-4">
							<Alert>
								<AlertDescription>
									Your query must return these columns: <code>date</code>{" "}
									(string), <code>timestamp</code> (string), <code>value</code>{" "}
									(number), <code>unit</code> (string)
								</AlertDescription>
							</Alert>

							<div className="space-y-2">
								<Label>SQL Query</Label>
								<form onSubmit={handleRunQuery}>
									<Textarea
										name="query"
										defaultValue={customQuery}
										className="font-mono text-sm min-h-[200px]"
										placeholder="Enter your SQL query..."
									/>
									<Button type="submit" className="mt-2">
										Run Query
									</Button>
								</form>
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</CardHeader>

			<CardContent>
				<HealthDataRenderer
					series={
						activeTab === "builder"
							? series
							: [
									{
										id: "custom",
										type: "Custom Query",
										aggregationMethod: "AVG",
									},
								]
					}
					data={chartDataQuery.data ?? {}}
					chartType={chartType}
					isSmooth={isSmooth}
					isLoading={chartDataQuery.isLoading}
				/>
			</CardContent>
		</Card>
	);
}
