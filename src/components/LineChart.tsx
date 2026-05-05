import type * as React from "react";
import { cn } from "../lib/utils";

export type LineChartSeries = {
	color: string;
	values: number[];
};

export type LineChartProps = {
	ariaLabel: string;
	bottomPadding?: number;
	className?: string;
	height?: number;
	series: LineChartSeries[];
	style?: React.CSSProperties;
	width?: number;
};

const pointsFor = (
	values: number[],
	maxValue: number,
	width: number,
	height: number,
	bottomPadding: number,
) =>
	values
		.map((value, index) => {
			const x = values.length > 1 ? (index / (values.length - 1)) * width : 0;
			const drawableHeight = Math.max(1, height - bottomPadding);
			const y = height - bottomPadding - (value / maxValue) * drawableHeight;
			return `${x.toFixed(1)},${y.toFixed(1)}`;
		})
		.join(" ");

export const LineChart = ({
	ariaLabel,
	bottomPadding = 0,
	className,
	height = 96,
	series,
	style,
	width = 220,
}: LineChartProps) => {
	const maxValue = Math.max(...series.flatMap(({ values }) => values), 1);

	return (
		<svg
			viewBox={`0 0 ${width} ${height}`}
			preserveAspectRatio="none"
			className={cn(
				"h-24 w-full overflow-visible rounded-md border border-border/70 bg-popover/25",
				className,
			)}
			style={style}
			role="img"
			aria-label={ariaLabel}
		>
			{series.map(({ color, values }) => (
				<polyline
					key={color}
					points={pointsFor(values, maxValue, width, height, bottomPadding)}
					fill="none"
					stroke={color}
					strokeWidth={1.4}
					vectorEffect="non-scaling-stroke"
				/>
			))}
		</svg>
	);
};
