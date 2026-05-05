import type * as React from "react";
import { cn } from "../../lib/utils";
import { Separator } from "../Separator";

export const SidebarPanel = ({
	className,
	...props
}: React.HTMLAttributes<HTMLElement>) => (
	<aside
		className={cn(
			"flex w-72 shrink-0 flex-col border-r border-border bg-sidebar",
			className,
		)}
		{...props}
	/>
);

export const SidebarPanelHeader = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<>
		<div
			className={cn("flex h-11 items-center justify-between px-3", className)}
			{...props}
		/>
		<Separator />
	</>
);

export const SidebarPanelContent = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn("space-y-1 p-2", className)} {...props} />
);
