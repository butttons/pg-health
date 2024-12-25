import { HealthRecordsTable } from "@/components/health-records-table";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/explorer")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="container p-4 mx-auto">
			<HealthRecordsTable />
		</div>
	);
}
