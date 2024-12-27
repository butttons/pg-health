import {
	Calendar,
	DeviceMobile,
	List,
	Spinner,
	Star,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { pg } from "@/workers/pglite.worker-instance";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const formatDate = (date: string | undefined) => {
	if (!date) return "";
	return new Date(date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
};

export const HealthStats = () => {
	const queryClient = useQueryClient();

	const statsQueries = {
		totalRecords: useQuery({
			queryKey: ["stats", "total-records"],
			queryFn: async () => {
				const result = await pg.query<{ count: number }>(
					"SELECT count(*) as count from records;",
				);
				return result.rows[0].count;
			},
		}),
		totalTypes: useQuery({
			queryKey: ["stats", "total-types"],
			queryFn: async () => {
				const result = await pg.query<{ count: number }>(
					"SELECT count(distinct type) as count from records;",
				);
				return result.rows[0].count;
			},
		}),
		dateRange: useQuery({
			queryKey: ["stats", "date-range"],
			queryFn: async () => {
				const result = await pg.query<{ min: string; max: string }>(
					"SELECT min(start_date) as min, max(end_date) as max from records;",
				);
				return result.rows[0];
			},
		}),
		totalDevices: useQuery({
			queryKey: ["stats", "total-devices"],
			queryFn: async () => {
				const result = await pg.query<{ count: number }>(
					"SELECT count(distinct device) as count from records;",
				);
				return result.rows[0].count;
			},
		}),
	};

	const resetMutation = useMutation({
		mutationFn: async () => {
			await pg.query("TRUNCATE record_metadata;");
			await pg.query("TRUNCATE records CASCADE;");
			await pg.query("DROP TABLE record_metadata;");
			await pg.query("DROP TABLE records;");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["stats"] });
		},
	});

	return (
		<div className="space-y-8">
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-semibold">Health Data Statistics</h2>
				<Button
					onClick={() => resetMutation.mutate()}
					disabled={resetMutation.isPending}
					variant="destructive"
				>
					{resetMutation.isPending ? (
						<>
							<Spinner className="mr-2 w-4 h-4 animate-spin" />
							Resetting...
						</>
					) : (
						"Reset Database"
					)}
				</Button>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				<StatCard
					title="Total Records"
					icon={<List />}
					isLoading={statsQueries.totalRecords.isLoading}
					value={statsQueries.totalRecords.data?.toLocaleString()}
				/>
				<StatCard
					title="Total Types"
					icon={<Star />}
					isLoading={statsQueries.totalTypes.isLoading}
					value={statsQueries.totalTypes.data?.toLocaleString()}
				/>
				<StatCard
					title="Date Range"
					icon={<Calendar />}
					isLoading={statsQueries.dateRange.isLoading}
					value={`${formatDate(statsQueries.dateRange.data?.min)} - ${formatDate(
						statsQueries.dateRange.data?.max,
					)}`}
				/>
				<StatCard
					title="Total Devices"
					icon={<DeviceMobile />}
					isLoading={statsQueries.totalDevices.isLoading}
					value={statsQueries.totalDevices.data?.toLocaleString()}
				/>
			</div>
		</div>
	);
};

type StatCardProps = {
	title: string;
	icon: React.ReactNode;
	value?: string;
	isLoading?: boolean;
	valueClassName?: string;
};

const StatCard = ({
	title,
	icon,
	value,
	isLoading,
	valueClassName = "text-2xl",
}: StatCardProps) => (
	<Card className="p-6">
		<div className="flex justify-between items-center mb-4">
			<div className="text-sm font-medium text-muted-foreground">{title}</div>
			{icon}
		</div>
		{isLoading ? (
			<Skeleton className="w-3/4 h-8" />
		) : (
			<div className={`font-semibold ${valueClassName}`}>{value}</div>
		)}
	</Card>
);
