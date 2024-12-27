import { Repl } from "@electric-sql/pglite-repl";
import { createLazyFileRoute } from "@tanstack/react-router";

import { pg } from "@/workers/pglite.worker-instance";

import { useTheme } from "@/components/theme-provider";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardTitle } from "@/components/ui/card";
export const Route = createLazyFileRoute("/repl")({
	component: About,
});

function About() {
	const { theme } = useTheme();
	return (
		<div className="container p-4 mx-auto">
			<Card className="p-4">
				<CardTitle>REPL</CardTitle>
				<Accordion type="single" collapsible>
					<AccordionItem value="item-1">
						<AccordionTrigger>Current schema</AccordionTrigger>
						<AccordionContent>
							<pre className="p-2 text-xs rounded-md bg-secondary">
								{`CREATE TABLE IF NOT EXISTS records(
  id text PRIMARY KEY,
  type TEXT NOT NULL,
  source_name text,
  source_version text,
  device text,
  unit text,
  value real NOT NULL,
  creation_date timestamp,
  start_date timestamp,
  end_date timestamp
);

CREATE TABLE IF NOT EXISTS record_metadata(
  record_id text REFERENCES records(id),
  key TEXT NOT NULL,
  value text NOT NULL,
  PRIMARY KEY (record_id, key)
);

CREATE INDEX idx_records_type ON records(type);

CREATE INDEX idx_records_dates ON records(start_date, end_date);

CREATE INDEX idx_metadata_key ON record_metadata(key);`}
							</pre>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
				<Repl
					pg={pg}
					showTime
					border
					theme={theme === "system" ? "auto" : theme}
				/>
			</Card>
		</div>
	);
}
