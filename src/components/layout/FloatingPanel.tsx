import type * as React from "react";
import { cn } from "../../lib/utils";

export const FloatingPanel = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"relative rounded-lg border border-border/70 bg-popover/55 p-3 text-popover-foreground shadow-xl backdrop-blur-md",
			className,
		)}
		{...props}
	/>
);

export const PanelMetricRow = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"mt-3 flex items-center justify-between rounded-md border border-border bg-background p-2 font-mono text-xs",
			className,
		)}
		{...props}
	/>
);
