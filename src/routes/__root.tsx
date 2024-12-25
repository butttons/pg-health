import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { PGliteProvider } from "@electric-sql/pglite-react";
import { GithubLogo, Heartbeat } from "@phosphor-icons/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";

import { NavBarItems } from "@/components/nav-bar-items";
import { ThemeToggle } from "@/components/theme-toggle";
import { pg } from "@/workers/pglite.worker-instance";

const queryClient = new QueryClient();

export const Route = createRootRoute({
	component: () => {
		return (
			<QueryClientProvider client={queryClient}>
				<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
					<PGliteProvider db={pg}>
						<nav className="flex justify-between p-4 border-b">
							<Link
								href="/"
								className="flex gap-2 items-center text-primary hover:opacity-75"
							>
								<Heartbeat size={32} />
								<span className="text-lg font-medium">PGHealth</span>
							</Link>
							<div className="flex gap-2 items-center">
								<NavBarItems />
								<ThemeToggle />

								<Button asChild variant="outline" size="icon">
									<a href="https://github.com/butttons/pg-health">
										<GithubLogo />
									</a>
								</Button>
							</div>
						</nav>
						<Outlet />
						<footer className="p-4 mx-4 text-center border-t lg:mx-8">
							Made by <a href="https://yash.bio">butttons</a>
						</footer>
					</PGliteProvider>
				</ThemeProvider>
			</QueryClientProvider>
		);
	},
});
