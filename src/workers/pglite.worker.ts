import { PGlite } from "@electric-sql/pglite";
import { live } from "@electric-sql/pglite/live";
import { worker } from "@electric-sql/pglite/worker";

worker({
	async init() {
		return new PGlite("idb://pg-health", {
			extensions: { live },
			relaxedDurability: true,
		});
	},
});
