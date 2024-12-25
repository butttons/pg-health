import { createLazyFileRoute } from "@tanstack/react-router";

import { Setup } from "@/components/setup";

export const Route = createLazyFileRoute("/import")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="container p-4 mx-auto">
			<Setup />
		</div>
	);
}
