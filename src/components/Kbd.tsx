import type * as React from "react";
import { cn } from "../lib/utils";

export const Kbd = ({
	className,
	...props
}: React.HTMLAttributes<HTMLElement>) => (
	<kbd
		className={cn(
			"rounded border border-border bg-muted px-1 font-mono text-[10px] leading-4 text-muted-foreground",
			className,
		)}
		{...props}
	/>
);
