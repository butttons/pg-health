export const importWorker = new Worker(
	new URL("./import.worker.ts", import.meta.url),
	{ type: "module" },
);
