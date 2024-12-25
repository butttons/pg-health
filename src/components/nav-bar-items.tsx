import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { pg } from "@/workers/pglite.worker-instance";
import { ChartBar, Code, Table, Upload } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";

export const NavBarItems = () => {
	const { data, isLoading } = useQuery({
		queryKey: ["stats", "init"],
		queryFn: async () => {
			const results = await pg.query<{ count: number }>(
				"SELECT count(*) from records;",
			);
			return results.rows?.[0].count ?? 0;
		},
	});

	if (isLoading) {
		return null;
	}
	if (!data) {
		return null;
	}

	return (
		<>
			<div className="md:hidden">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="icon">
							<Menu />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem>
							<Link href="/import" className="flex gap-2 items-center">
								<Upload />
								Import
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem>
							<Link href="/viz" className="flex gap-2 items-center">
								<ChartBar />
								Visualize
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem>
							<Link href="/repl" className="flex gap-2 items-center">
								<Code />
								REPL
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem>
							<Link href="/explorer" className="flex gap-2 items-center">
								<Table />
								Explore
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className="hidden gap-2 md:flex">
				<Button asChild variant="outline">
					<Link href="/import">
						<Upload />
						Import
					</Link>
				</Button>
				<Button asChild variant="outline">
					<Link href="/viz">
						<ChartBar />
						Visualize
					</Link>
				</Button>
				<Button asChild variant="outline">
					<Link href="/repl">
						<Code />
						REPL
					</Link>
				</Button>
				<Button asChild variant="outline">
					<Link href="/explorer">
						<Table />
						Explore
					</Link>
				</Button>
			</div>
		</>
	);
};
