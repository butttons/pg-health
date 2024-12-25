"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

interface TypeComboboxProps {
	types: { type: string }[];
	value: string;
	onValueChange: (value: string) => void;
}

export function TypeCombobox({
	types,
	value,
	onValueChange,
}: TypeComboboxProps) {
	const [open, setOpen] = React.useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					// biome-ignore lint/a11y/useSemanticElements: <explanation>
					role="combobox"
					aria-expanded={open}
					className="justify-between w-full"
				>
					{value || "Select type..."}
					<ChevronsUpDown className="ml-2 w-4 h-4 opacity-50 shrink-0" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="p-0 w-full">
				<Command>
					<CommandInput placeholder="Search type..." />
					<CommandList>
						<CommandEmpty>No type found.</CommandEmpty>
						<CommandGroup>
							{types.map((item) => (
								<CommandItem
									key={item.type}
									value={item.type}
									onSelect={(currentValue) => {
										onValueChange(currentValue === value ? "" : currentValue);
										setOpen(false);
									}}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											value === item.type ? "opacity-100" : "opacity-0",
										)}
									/>
									{item.type}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
