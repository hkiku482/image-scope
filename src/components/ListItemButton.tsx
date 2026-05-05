import type * as React from "react";
import { cn } from "../lib/utils";

type IconComponent = React.ComponentType<{ className?: string }>;

export type ListItemButtonProps =
	React.ButtonHTMLAttributes<HTMLButtonElement> & {
		icon?: IconComponent;
		selected?: boolean;
	};

export const ListItemButton = ({
	children,
	className,
	icon: Icon,
	selected,
	...props
}: ListItemButtonProps) => (
	<button
		type="button"
		className={cn(
			"flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm transition-colors",
			selected
				? "bg-primary text-primary-foreground"
				: "text-sidebar-foreground hover:bg-accent hover:text-accent-foreground",
			className,
		)}
		{...props}
	>
		{Icon && <Icon className="size-4 shrink-0 opacity-75" />}
		<span className="min-w-0 truncate">{children}</span>
	</button>
);
