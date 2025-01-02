import { PGliteProvider } from "@electric-sql/pglite-react";
import { GithubLogo, Heartbeat } from "@phosphor-icons/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";

import { pg } from "@/workers/pglite.worker-instance";

import { NavBarItems } from "@/components/nav-bar-items";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const queryClient = new QueryClient();

export const Route = createRootRoute({
	component: () => {
		return (
			<QueryClientProvider client={queryClient}>
				<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
					<PGliteProvider db={pg}>
						<main className="flex relative flex-col min-h-screen">
							<nav className="flex relative justify-between p-4 border-b backdrop-blur bg-primary-foreground/25">
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
										<a
											href="https://github.com/butttons/pg-health"
											target="_blank"
											rel="noreferrer"
										>
											<GithubLogo />
										</a>
									</Button>
								</div>
							</nav>

							<Outlet />
							<footer className="relative p-4 mx-4 mt-auto text-center border-t lg:mx-8">
								Made by <a href="https://yash.bio">butttons</a>
							</footer>
						</main>
					</PGliteProvider>
				</ThemeProvider>
			</QueryClientProvider>
		);
	},
});
