import { X } from "lucide-react";
import type * as React from "react";
import { cn } from "../../lib/utils";
import { Button } from "../Button";

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

export type FloatingPanelCloseButtonProps =
	React.ButtonHTMLAttributes<HTMLButtonElement> & {
		label: string;
	};

export const FloatingPanelCloseButton = ({
	className,
	label,
	...props
}: FloatingPanelCloseButtonProps) => (
	<Button
		type="button"
		variant="ghost"
		size="iconSm"
		aria-label={label}
		className={cn("absolute right-1.5 top-1.5 z-10", className)}
		{...props}
	>
		<X />
	</Button>
);
