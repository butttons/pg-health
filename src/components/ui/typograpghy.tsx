import { cn } from "@/lib/utils";
import type React from "react";

export function TypographyInlineCode({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<code
			className={cn(
				"relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-medium",
				className,
			)}
		>
			{children}
		</code>
	);
}
