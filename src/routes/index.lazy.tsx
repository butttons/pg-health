import {
	ChartBar,
	Code,
	NumberCircleOne,
	NumberCircleThree,
	NumberCircleTwo,
	Table,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link, createLazyFileRoute } from "@tanstack/react-router";

import { pg } from "@/workers/pglite.worker-instance";

import { FAQItems } from "@/components/faq-items";
import { HealthStats } from "@/components/health-stats";
import { Setup } from "@/components/setup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { TypographyInlineCode } from "@/components/ui/typograpghy";

export const Route = createLazyFileRoute("/")({
	component: Index,
});

function Index() {
	const { data, isLoading } = useQuery({
		queryKey: ["stats", "init"],
		queryFn: async () => {
			const results = await pg.query<{ count: number }>(
				"SELECT count(*) from records;",
			);
			return results.rows?.[0].count ?? 0;
		},
	});

	return (
		<div className="relative">
			<div className="container flex flex-col gap-8 justify-center items-center px-4 mx-auto my-20">
				<div className="text-sm font-semibold text-gray-700 uppercase dark:text-gray-300">
					No sign ups. Run locally on device.
				</div>
				<h1 className="text-5xl font-semibold tracking-tight text-center text-gray-900 dark:text-white text-balance sm:text-7xl">
					Unlock insights from your
					<br />
					Apple Health data
				</h1>
				<div className="pt-2 text-xl text-center border-t">
					Visualize with charts or explore with SQL, all on your machine.
				</div>
			</div>
			<div className="py-12 my-12 bg-secondary dark:bg-secondary">
				<div className="container px-4 mx-auto">
					<div className="mb-6 text-3xl text-center">How it works</div>
					<div className="grid gap-4 lg:gap-12 md:grid-cols-2 lg:grid-cols-3">
						<Card>
							<CardTitle className="flex gap-2 items-center p-4">
								<NumberCircleOne size={42} />
								<span className="text-2xl">Upload file</span>
							</CardTitle>
							<CardContent>
								The file is parsed locally on your device. It contains records
								of all your health data, sometimes where each record might have
								subsequent metadata for it also. The data is then ingested into
								a local postgres database running using{" "}
								<a
									href="https://pglite.dev"
									target="_blank"
									rel="noreferrer"
									className="text-blue-500"
								>
									pglite.dev
								</a>
							</CardContent>
						</Card>
						<Card>
							<CardTitle className="flex gap-2 items-center p-4">
								<NumberCircleTwo size={42} />
								<span className="text-2xl">Populating the database</span>
							</CardTitle>
							<CardContent>
								The <TypographyInlineCode>records</TypographyInlineCode> table
								and <TypographyInlineCode>record_metadata</TypographyInlineCode>{" "}
								table are populated as the file is parsed. Each health record is
								uniquely identified by an ID and has fields like type, value,
								dates, etc.
							</CardContent>
						</Card>
						<Card>
							<CardTitle className="flex gap-2 items-center p-4">
								<NumberCircleThree size={42} />
								<span className="text-2xl">Browse your data</span>
							</CardTitle>
							<CardContent>
								Use the REPL or Explorer to view your data, or visualize it by
								making charts.
							</CardContent>
							<CardFooter>
								<Button asChild>
									<Link href="/import">Get started</Link>
								</Button>
							</CardFooter>
						</Card>
					</div>
				</div>
			</div>
			<div>
				{isLoading ? (
					<Skeleton className="w-full h-20" />
				) : !(data && data > 0) ? (
					<div>
						<HealthStats />
						<div className="grid gap-6 my-6 md:grid-cols-3">
							<Card className="p-6">
								<Link href="/viz" className="flex gap-2 items-center">
									<ChartBar size={64} />
									<div className="text-3xl">Visualize</div>
								</Link>
							</Card>
							<Card className="p-6">
								<Link href="/repl" className="flex gap-2 items-center">
									<Code size={64} />
									<div className="text-3xl">REPL</div>
								</Link>
							</Card>
							<Card className="p-6">
								<Link href="/explore" className="flex gap-2 items-center">
									<Table size={64} />
									<div className="text-3xl">Explore</div>
								</Link>
							</Card>
						</div>
					</div>
				) : (
					<div className="py-6">
						<div className="container px-4 mx-auto lg:px-20">
							<Setup />
						</div>
					</div>
				)}
			</div>

			<Separator className="my-6" />
			<div className="container px-4 mx-auto my-12 lg:w-1/2">
				<div className="text-3xl">FAQ</div>
				<FAQItems />
			</div>
		</div>
	);
}
