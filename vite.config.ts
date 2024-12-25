import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
	base: "/pg-health/",
	build: {
		outDir: "dist",
		sourcemap: false,
		target: "esnext",
		rollupOptions: {
			output: {
				format: "es",
			},
		},
	},
	plugins: [TanStackRouterVite(), react()],
	resolve: {
		preserveSymlinks: false,
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	worker: {
		format: "es",
	},
	optimizeDeps: {
		exclude: ["@electric-sql/pglite"],
	},
});
