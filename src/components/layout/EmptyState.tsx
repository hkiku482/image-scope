import type * as React from "react";
import { cn } from "../../lib/utils";

export const EmptyState = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground",
			className,
		)}
		{...props}
	/>
);
