import type * as React from "react";
import { cn } from "../../lib/utils";

export const AppFrame = ({
	className,
	...props
}: React.HTMLAttributes<HTMLElement>) => (
	<main
		className={cn(
			"flex h-screen flex-col overflow-hidden bg-background text-foreground",
			className,
		)}
		{...props}
	/>
);

export const AppBody = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn("flex min-h-0 flex-1", className)} {...props} />
);
