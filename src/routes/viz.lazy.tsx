import { createLazyFileRoute } from "@tanstack/react-router";

import { HealthDataChart } from "@/components/charts/health-data-chart";
import { HealthStats } from "@/components/health-stats";

export const Route = createLazyFileRoute("/viz")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="container p-4 mx-auto space-y-8">
			<HealthStats />
			<HealthDataChart />
		</div>
	);
}
