import { useEffect, useMemo, useRef } from "react";

/**
 * HEXからHSVへの変換
 */
const hexToHsv = (hex: string) => {
	let r = 0,
		g = 0,
		b = 0;
	const h = hex.replace("#", "");
	if (h.length === 3) {
		r = parseInt(h[0] + h[0], 16);
		g = parseInt(h[1] + h[1], 16);
		b = parseInt(h[2] + h[2], 16);
	} else if (h.length === 6) {
		r = parseInt(h.substring(0, 2), 16);
		g = parseInt(h.substring(2, 4), 16);
		b = parseInt(h.substring(4, 6), 16);
	}

	r /= 255;
	g /= 255;
	b /= 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const d = max - min;
	let hue = 0;
	const s = max === 0 ? 0 : d / max;
	const v = max;

	if (max !== min) {
		switch (max) {
			case r:
				hue = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				hue = (b - r) / d + 2;
				break;
			case b:
				hue = (r - g) / d + 4;
				break;
		}
		hue /= 6;
	}

	return { h: hue * 360, s: s * 100, v: v * 100 };
};

/**
 * 色相環の回転オフセット
 * H=60 (黄色) を真上 (-90度) に配置するため:
 * 60 + OFFSET = -90  => OFFSET = -150
 */
const HUE_ROTATION_OFFSET = -150;

/**
 * 固定された三角形の回転角度 (再生アイコンのように右を向く)
 */
const TRIANGLE_FIXED_ANGLE = 0;

export type ColorCircleProps = {
	// 16進数カラー (例: "#ff0000")
	color: string;
	imageResolution: {
		width: number;
		height: number;
	};
	size?: number;
	onClose?: () => void;
};

export const ColorCircle = ({
	color,
	imageResolution,
	size = 300,
	onClose,
}: ColorCircleProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const hsv = useMemo(() => hexToHsv(color), [color]);

	const center = size / 2;
	const radius = size * 0.45;
	const ringThickness = size * 0.1;
	const innerRadius = radius - ringThickness - 2;

	// 固定された三角形の頂点計算
	const trianglePoints = useMemo(() => {
		const angleRad = (TRIANGLE_FIXED_ANGLE * Math.PI) / 180;
		return {
			pColor: {
				x: center + innerRadius * Math.cos(angleRad),
				y: center + innerRadius * Math.sin(angleRad),
			},
			pWhite: {
				x: center + innerRadius * Math.cos(angleRad + (240 * Math.PI) / 180),
				y: center + innerRadius * Math.sin(angleRad + (240 * Math.PI) / 180),
			},
			pBlack: {
				x: center + innerRadius * Math.cos(angleRad + (120 * Math.PI) / 180),
				y: center + innerRadius * Math.sin(angleRad + (120 * Math.PI) / 180),
			},
		};
	}, [center, innerRadius]);

	const { pColor, pWhite, pBlack } = trianglePoints;

	// 現在のS, Vから三角形内の位置を計算
	const currentPos = useMemo(() => {
		const s = hsv.s / 100;
		const v = hsv.v / 100;
		return {
			x: pBlack.x + v * (pWhite.x - pBlack.x) + v * s * (pColor.x - pWhite.x),
			y: pBlack.y + v * (pWhite.y - pBlack.y) + v * s * (pColor.y - pWhite.y),
		};
	}, [pColor, pWhite, pBlack, hsv.s, hsv.v]);

	// Canvas描画
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// 高解像度対応
		const dpr = window.devicePixelRatio || 1;
		canvas.width = size * dpr;
		canvas.height = size * dpr;
		canvas.style.width = `${size}px`;
		canvas.style.height = `${size}px`;
		ctx.scale(dpr, dpr);

		ctx.clearRect(0, 0, size, size);

		// 1. 色相環の描画 (createConicGradientを使用して滑らかに)
		const renderHueRing = () => {
			ctx.save();
			// ドーナツ型にクリップ
			ctx.beginPath();
			ctx.arc(center, center, radius, 0, Math.PI * 2);
			ctx.arc(center, center, radius - ringThickness, 0, Math.PI * 2, true);
			ctx.clip();

			// 円錐グラデーションの作成
			const startAngleRad = (HUE_ROTATION_OFFSET * Math.PI) / 180;
			const gradient = ctx.createConicGradient(startAngleRad, center, center);

			// 360度分、細かく色を指定して滑らかにする
			for (let i = 0; i <= 360; i += 10) {
				gradient.addColorStop(i / 360, `hsl(${i}, 100%, 50%)`);
			}

			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, size, size);
			ctx.restore();
		};

		// 2. 三角形のグラデーション描画
		const renderTriangle = () => {
			ctx.save();
			ctx.beginPath();
			ctx.moveTo(pColor.x, pColor.y);
			ctx.lineTo(pWhite.x, pWhite.y);
			ctx.lineTo(pBlack.x, pBlack.y);
			ctx.closePath();
			ctx.clip();

			ctx.fillStyle = "#fff";
			ctx.fill();

			const sGrad = ctx.createLinearGradient(
				(pWhite.x + pBlack.x) / 2,
				(pWhite.y + pBlack.y) / 2,
				pColor.x,
				pColor.y,
			);
			sGrad.addColorStop(0, `hsla(${hsv.h}, 100%, 50%, 0)`);
			sGrad.addColorStop(1, `hsla(${hsv.h}, 100%, 50%, 1)`);
			ctx.fillStyle = sGrad;
			ctx.fill();

			const vGrad = ctx.createLinearGradient(
				(pWhite.x + pColor.x) / 2,
				(pWhite.y + pColor.y) / 2,
				pBlack.x,
				pBlack.y,
			);
			vGrad.addColorStop(0, "rgba(0,0,0,0)");
			vGrad.addColorStop(1, "rgba(0,0,0,1)");
			ctx.fillStyle = vGrad;
			ctx.fill();

			ctx.restore();
		};

		renderHueRing();
		renderTriangle();
	}, [hsv.h, pColor, pWhite, pBlack, size, center, radius, ringThickness]);

	return (
		<div
			className="flex flex-col items-center gap-2.5 p-4 bg-[#1a1a1a80] rounded-xl relative group"
			style={{ width: size + 40 }}
		>
			{onClose && (
				<button
					type="button"
					onClick={onClose}
					className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-black/40 text-white/60 hover:bg-black/60 hover:text-white transition-all cursor-pointer z-30 opacity-0 group-hover:opacity-100"
					aria-label="Close"
				>
					<svg
						width="12"
						height="12"
						viewBox="0 0 12 12"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
					>
						<title>Close</title>
						<path d="M2 2l8 8M10 2L2 10" />
					</svg>
				</button>
			)}
			<div
				className="relative"
				style={{
					width: size,
					height: size,
				}}
			>
				<canvas
					ref={canvasRef}
					className="absolute top-0 left-0"
					width={size}
					height={size}
				/>

				<svg
					width={size}
					height={size}
					className="absolute top-0 left-0 pointer-events-none"
				>
					<title>Color Picker</title>
					{/* 色相マーカー */}
					<g
						transform={`rotate(${hsv.h + HUE_ROTATION_OFFSET}, ${center}, ${center})`}
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

					{/* S/Vマーカー */}
					<circle
						cx={currentPos.x}
						cy={currentPos.y}
						r={6}
						fill="none"
						stroke={hsv.v > 70 && hsv.s < 30 ? "black" : "white"}
						strokeWidth={2}
						className="drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]"
					/>

					{/* 三角形の枠線 */}
					<path
						d={`M ${pColor.x} ${pColor.y} L ${pWhite.x} ${pWhite.y} L ${pBlack.x} ${pBlack.y} Z`}
						fill="none"
						stroke="rgba(255,255,255,0.2)"
						strokeWidth={1}
					/>
				</svg>
			</div>

			<div className="w-full text-white text-[12px] font-mono bg-white/10 px-3.5 py-2.5 rounded-md border border-white/10 flex justify-between items-center">
				<div className="flex items-center gap-2.5">
					<div
						className="w-5 h-5 rounded border border-white/30"
						style={{
							backgroundColor: color,
						}}
					/>
					<div className="flex flex-col">
						<span className="font-bold text-sm">{color.toUpperCase()}</span>
						<span className="text-[10px] text-white/60">
							{imageResolution.width} × {imageResolution.height}
						</span>
					</div>
				</div>
				<div className="text-white/80 flex flex-col gap-0.5 leading-tight">
					<div>H: {Math.round(hsv.h)}°</div>
					<div>S: {Math.round(hsv.s)}%</div>
					<div>V: {Math.round(hsv.v)}%</div>
				</div>
			</div>
		</div>
	);
};
