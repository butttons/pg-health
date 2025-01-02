import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
	{
		key: "mobile",
		question: "Does it work on mobile?",
		answer: "No. Maybe it works with smaller files (<100mb).",
	},
	{
		key: "acc",
		question: "How is my file managed?",
		answer:
			"When you import your file, it is processed on your machine and the data is saved locally. There are no servers that processes the SQL.",
	},

	{
		key: "sql",
		question: "Where is my data saved?",
		answer: (
			<>
				Thanks to{" "}
				<a
					href="https://pglite.dev/"
					target="_blank"
					rel="noreferrer"
					className="text-blue-500"
				>
					pglite.dev
				</a>{" "}
				and{" "}
				<a
					href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API"
					target="_blank"
					rel="noreferrer"
					className="text-blue-500"
				>
					Web Workers
				</a>
				, the file that you upload is parsed and it's data saved in a local SQL
				database. It's backed by{" "}
				<a
					href="https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API"
					target="_blank"
					rel="noreferrer"
					className="text-blue-500"
				>
					IndexedDB
				</a>{" "}
				so your data won't be lost when you close the window.
			</>
		),
	},
	{
		key: "qa",
		question: "How do I provide feedback or report a bug?",
		answer: (
			<>
				Please create an issue on{" "}
				<a
					target="_blank"
					rel="noreferrer"
					className="text-blue-500"
					href="https://github.com/butttons/pg-health"
				>
					GitHub
				</a>
				.
			</>
		),
	},
] as const;

export const FAQItems = () => {
	return (
		<Accordion type="multiple">
			{FAQ_ITEMS.map((item) => (
				<AccordionItem value={item.key} key={item.key}>
					<AccordionTrigger>{item.question}</AccordionTrigger>
					<AccordionContent>{item.answer}</AccordionContent>
				</AccordionItem>
			))}
		</Accordion>
	);
};
