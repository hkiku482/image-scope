import type * as React from "react";
import { cn } from "../../lib/utils";

type FloatingCornerProps = React.HTMLAttributes<HTMLDivElement> & {
	placement?: "bottom-right" | "top-right";
};

export const FloatingCorner = ({
	className,
	placement = "bottom-right",
	...props
}: FloatingCornerProps) => (
	<div
		className={cn(
			"absolute right-4 z-20 flex flex-col items-end gap-2",
			placement === "bottom-right" ? "bottom-4" : "top-4",
			className,
		)}
		{...props}
	/>
);
