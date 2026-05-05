import type * as React from "react";
import { cn } from "../lib/utils";
import { Badge } from "./Badge";

export type MetricBadgeProps = React.HTMLAttributes<HTMLDivElement> & {
	widthCh?: number;
};

export const MetricBadge = ({
	className,
	widthCh,
	style,
	children,
	...props
}: MetricBadgeProps) => {
	const fixedWidth =
		widthCh === undefined
			? undefined
			: {
					maxWidth: `${widthCh}ch`,
					minWidth: `${widthCh}ch`,
					width: `${widthCh}ch`,
				};

	return (
		<Badge
			className={cn(
				"h-6 shrink-0 justify-center px-1 font-mono tabular-nums",
				className,
			)}
			style={{ ...fixedWidth, ...style }}
			{...props}
		>
			<span className="w-full truncate text-center">{children}</span>
		</Badge>
	);
};
