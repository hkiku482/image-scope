import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import type * as React from "react";
import { cn } from "../lib/utils";

export const ContextMenu = ContextMenuPrimitive.Root;
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

export const ContextMenuContent = ({
	className,
	...props
}: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>) => (
	<ContextMenuPrimitive.Portal>
		<ContextMenuPrimitive.Content
			className={cn(
				"z-50 min-w-40 overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md",
				className,
			)}
			{...props}
		/>
	</ContextMenuPrimitive.Portal>
);

export const ContextMenuItem = ({
	className,
	...props
}: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item>) => (
	<ContextMenuPrimitive.Item
		className={cn(
			"relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
			className,
		)}
		{...props}
	/>
);
