import { live } from "@electric-sql/pglite/live";
import { PGliteWorker } from "@electric-sql/pglite/worker";

export const pg = await PGliteWorker.create(
	new Worker(new URL("./pglite.worker.ts", import.meta.url), {
		type: "module",
	}),
	{
		extensions: { live },
	},
);
