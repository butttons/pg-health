import type { ApexOptions } from "apexcharts";
import { useMemo } from "react";
import Chart from "react-apexcharts";

import { useTheme } from "@/components/theme-provider";

type ChartData = {
	date: string;
	timestamp: string;
	value: number;
	unit: string;
};

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

export function HealthDataRenderer({
	series,
	data,
	chartType,
	isSmooth,
	isLoading,
}: {
	series: DataSeries[];
	data: Record<string, ChartData[]>;
	chartType: "line" | "bar" | "area";
	isSmooth: boolean;
	isLoading?: boolean;
}) {
	const { theme } = useTheme();
	const chartOptions: ApexOptions = useMemo(
		() => ({
			chart: {
				type: chartType,
				toolbar: {
					show: true,
				},
				background: "transparent",
				foreColor: "hsl(var(--foreground))",
			},
			stroke: {
				curve: isSmooth ? "smooth" : "stepline",
				width: 2,
			},
			markers: {
				size: 4,
				strokeWidth: 2,
				hover: {
					size: 6,
					sizeOffset: 3,
				},
			},
			grid: {
				borderColor: "hsl(var(--border))",
				xaxis: {
					lines: {
						show: true,
					},
				},
				yaxis: {
					lines: {
						show: true,
					},
				},
			},
			theme: {
				mode: theme === "dark" ? "dark" : "light",
			},
			xaxis: {
				type: "datetime",
				labels: {
					datetimeUTC: false,
					style: {
						colors: "hsl(var(--muted-foreground))",
					},
				},
				axisBorder: {
					color: "hsl(var(--border))",
				},
				axisTicks: {
					color: "hsl(var(--border))",
				},
			},
			yaxis: series.map((s, index) => ({
				title: {
					text: data[s.id]?.[0]?.unit ?? "",
					style: {
						color: "hsl(var(--muted-foreground))",
					},
				},
				labels: {
					formatter: (value: number) => value.toFixed(2),
					style: {
						colors: "hsl(var(--muted-foreground))",
					},
				},
				opposite: index % 2 === 1, // Alternate sides for multiple y-axes
			})),
			tooltip: {
				shared: true,
				intersect: false,
				theme: "dark",
				x: {
					format: "dd MMM yyyy",
				},
				custom: ({ dataPointIndex, w }) => {
					const date = new Date(
						w.globals.seriesX[0][dataPointIndex],
					).toLocaleDateString();

					const rows = series
						.map((s, idx) => {
							const value = w.globals.series[idx][dataPointIndex];
							if (value === null || value === undefined) return "";
							const unit = data[s.id]?.[0]?.unit ?? "";
							return `
								<div class="flex gap-4 justify-between">
									<span>${s.type}:</span>
									<span>${value.toFixed(2)} ${unit}</span>
								</div>
							`;
						})
						.filter(Boolean)
						.join("");

					return `
						<div class="justify-between p-2 rounded-md border shadow-none bg-background text-primary">
							<div class="mb-2 font-bold">${date}</div>
							${rows}
						</div>
					`;
				},
			},
			states: {
				hover: {
					filter: {
						type: "none",
					},
				},
			},
		}),
		[chartType, isSmooth, series, data, theme],
	);

	const chartSeries = useMemo(
		() =>
			series.map((s, index) => ({
				name: s.type,
				data: (data[s.id] ?? []).map((row) => ({
					x: new Date(row.timestamp).getTime(),
					y: row.value,
				})),
				color: `hsl(var(--chart-${(index % 5) + 1}))`,
			})),
		[series, data],
	);

	if (
		Object.values(data).every((seriesData) => !seriesData?.length) &&
		!isLoading
	) {
		return (
			<div className="flex h-[350px] items-center justify-center text-muted-foreground">
				{series.some((s) => s.type)
					? "No data available"
					: "Select a type to view data"}
			</div>
		);
	}

	return (
		<div className="relative aspect-[2/1] w-full">
			<Chart
				options={chartOptions}
				series={chartSeries}
				type={chartType}
				height="100%"
			/>
			{isLoading && (
				<div className="flex absolute inset-0 justify-center items-center backdrop-blur-sm bg-background/50">
					<div className="flex relative z-10 gap-2 items-center">
						<div className="w-4 h-4 rounded-full border-2 animate-spin border-primary border-t-transparent" />
						<span className="text-sm text-muted-foreground">Loading...</span>
					</div>
				</div>
			)}
		</div>
	);
}
