import type * as React from "react";
import { cn } from "../lib/utils";

export type ColorSwatchProps = React.HTMLAttributes<HTMLDivElement> & {
	color: string;
};

export const ColorSwatch = ({
	className,
	color,
	style,
	...props
}: ColorSwatchProps) => (
	<div
		className={cn("size-5 rounded border border-border", className)}
		style={{ backgroundColor: color, ...style }}
		{...props}
	/>
);
