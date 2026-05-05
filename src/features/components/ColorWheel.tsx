import { useEffect, useMemo, useRef } from "react";
import { ColorSwatch } from "../../components/ColorSwatch";
import {
	FloatingPanel,
	FloatingPanelCloseButton,
	PanelMetricRow,
} from "../../components/layout/FloatingPanel";
import { Text } from "../../components/Text";

const HUE_ROTATION_OFFSET = -150;

type ColorWheelProps = {
	color: string;
	hsl: { h: number; s: number; l: number };
	onClose: () => void;
	size?: number;
};

export const ColorWheel = ({
	color,
	hsl,
	onClose,
	size = 190,
}: ColorWheelProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const center = size / 2;
	const radius = size * 0.45;
	const ringThickness = size * 0.11;
	const innerRadius = radius - ringThickness - 3;

	const points = useMemo(() => {
		const angle = 0;
		return {
			color: {
				x: center + innerRadius * Math.cos(angle),
				y: center + innerRadius * Math.sin(angle),
			},
			white: {
				x: center + innerRadius * Math.cos(angle + (240 * Math.PI) / 180),
				y: center + innerRadius * Math.sin(angle + (240 * Math.PI) / 180),
			},
			black: {
				x: center + innerRadius * Math.cos(angle + (120 * Math.PI) / 180),
				y: center + innerRadius * Math.sin(angle + (120 * Math.PI) / 180),
			},
		};
	}, [center, innerRadius]);

	const marker = useMemo(() => {
		const s = hsl.s / 100;
		const l = hsl.l / 100;
		const base = {
			x: points.black.x + l * (points.white.x - points.black.x),
			y: points.black.y + l * (points.white.y - points.black.y),
		};
		const saturationReach = s * (1 - Math.abs(2 * l - 1));
		return {
			x:
				base.x +
				saturationReach *
					(points.color.x - (points.white.x + points.black.x) / 2),
			y:
				base.y +
				saturationReach *
					(points.color.y - (points.white.y + points.black.y) / 2),
		};
	}, [hsl.l, hsl.s, points]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const dpr = window.devicePixelRatio || 1;

		canvas.width = size * dpr;
		canvas.height = size * dpr;
		canvas.style.width = `${size}px`;
		canvas.style.height = `${size}px`;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, size, size);

		ctx.save();
		ctx.beginPath();
		ctx.arc(center, center, radius, 0, Math.PI * 2);
		ctx.arc(center, center, radius - ringThickness, 0, Math.PI * 2, true);
		ctx.clip();
		const gradient = ctx.createConicGradient(
			(HUE_ROTATION_OFFSET * Math.PI) / 180,
			center,
			center,
		);
		for (let i = 0; i <= 360; i += 10) {
			gradient.addColorStop(i / 360, `hsl(${i}, 100%, 50%)`);
		}
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, size, size);
		ctx.restore();

		ctx.save();
		ctx.beginPath();
		ctx.moveTo(points.color.x, points.color.y);
		ctx.lineTo(points.white.x, points.white.y);
		ctx.lineTo(points.black.x, points.black.y);
		ctx.closePath();
		ctx.clip();

		const lightness = ctx.createLinearGradient(
			points.black.x,
			points.black.y,
			points.white.x,
			points.white.y,
		);
		lightness.addColorStop(0, "#000");
		lightness.addColorStop(1, "#fff");
		ctx.fillStyle = lightness;
		ctx.fill();

		const saturation = ctx.createLinearGradient(
			(points.white.x + points.black.x) / 2,
			(points.white.y + points.black.y) / 2,
			points.color.x,
			points.color.y,
		);
		saturation.addColorStop(0, `hsla(${hsl.h}, 100%, 50%, 0)`);
		saturation.addColorStop(1, `hsla(${hsl.h}, 100%, 50%, 1)`);
		ctx.fillStyle = saturation;
		ctx.fill();
		ctx.restore();
	}, [center, hsl.h, points, radius, ringThickness, size]);

	return (
		<FloatingPanel className="w-[220px]">
			<FloatingPanelCloseButton onClick={onClose} label="Close color wheel" />
			<div className="relative" style={{ width: size, height: size }}>
				<canvas ref={canvasRef} className="absolute inset-0" />
				<svg
					width={size}
					height={size}
					className="pointer-events-none absolute inset-0"
					role="img"
					aria-label="Color wheel"
				>
					<g
						transform={`rotate(${hsl.h + HUE_ROTATION_OFFSET}, ${center}, ${center})`}
					>
						<rect
							x={center + radius - ringThickness - 1}
							y={center - 3}
							width={ringThickness + 2}
							height={6}
							fill="none"
							stroke="white"
							strokeWidth={2}
							rx={2}
						/>
					</g>
					<path
						d={`M ${points.color.x} ${points.color.y} L ${points.white.x} ${points.white.y} L ${points.black.x} ${points.black.y} Z`}
						fill="none"
						stroke="rgba(255,255,255,.25)"
					/>
					<circle
						cx={marker.x}
						cy={marker.y}
						r={6}
						fill="none"
						stroke={hsl.l > 70 && hsl.s < 30 ? "black" : "white"}
						strokeWidth={2}
					/>
				</svg>
			</div>
			<PanelMetricRow className="items-start">
				<div className="flex items-center gap-2.5 self-center">
					<ColorSwatch className="size-7" color={color} />
					<Text
						className="flex h-7 items-center text-sm font-semibold leading-none"
						size="xs"
						variant="mono"
					>
						{color.toUpperCase()}
					</Text>
				</div>
				<div className="grid grid-cols-[auto_2.5ch] gap-x-1 gap-y-0.5 font-mono text-[10px] leading-none text-muted-foreground tabular-nums">
					<span>H</span>
					<span className="text-right">{Math.round(hsl.h)}</span>
					<span>L</span>
					<span className="text-right">{Math.round(hsl.l)}</span>
					<span>S</span>
					<span className="text-right">{Math.round(hsl.s)}</span>
				</div>
			</PanelMetricRow>
		</FloatingPanel>
	);
};
