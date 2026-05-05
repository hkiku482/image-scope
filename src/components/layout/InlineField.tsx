import type * as React from "react";
import { cn } from "../../lib/utils";

export type InlineFieldProps = React.HTMLAttributes<HTMLDivElement>;

export const InlineField = ({ className, ...props }: InlineFieldProps) => (
	<div
		className={cn(
			"flex h-6 shrink-0 items-center gap-2 rounded-md border border-border pl-2 pr-1",
			className,
		)}
		{...props}
	/>
);
