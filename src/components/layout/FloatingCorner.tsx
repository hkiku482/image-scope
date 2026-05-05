import type * as React from "react";
import { cn } from "../../lib/utils";

export const FloatingCorner = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2",
			className,
		)}
		{...props}
	/>
);
