import { useEffect, useRef, useState } from "react";
import { useCanvas } from "../hooks/useCanvas";

export type CanvasProps = { src: string | null };

export const Canvas = ({ src }: CanvasProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const imageRef = useRef<HTMLImageElement | null>(null);
	const [isImageLoaded, setIsImageLoaded] = useState(false);

	const {
		scale,
		offset,
		handleWheel,
		handleDoubleClick,
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
	} = useCanvas(src);

	const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const updateSize = () => {
			if (containerRef.current) {
				const rect = containerRef.current.getBoundingClientRect();
				setContainerSize({ width: rect.width, height: rect.height });
			}
		};

		updateSize();
		window.addEventListener("resize", updateSize);
		return () => window.removeEventListener("resize", updateSize);
	}, []);

	// 画像の読み込み
	useEffect(() => {
		if (!src) {
			imageRef.current = null;
			setIsImageLoaded(false);
			return;
		}

		const img = new Image();
		img.src = src;
		img.onload = () => {
			imageRef.current = img;
			setIsImageLoaded(true);
		};
	}, [src]);

	// 描画処理
	useEffect(() => {
		const canvas = canvasRef.current;
		const container = containerRef.current;
		const img = imageRef.current;
		if (!canvas || !container || !img || !isImageLoaded) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// キャンバスサイズの調整 (High DPI対応)
		const dpr = window.devicePixelRatio || 1;
		const { width, height } = containerSize;
		if (width === 0 || height === 0) return;

		canvas.width = width * dpr;
		canvas.height = height * dpr;
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;

		ctx.scale(dpr, dpr);
		ctx.clearRect(0, 0, width, height);

		// 画像の描画位置の計算
		const containerRatio = width / height;
		const imageRatio = img.width / img.height;
		let baseScale = 1;
		if (containerRatio > imageRatio) {
			baseScale = height / img.height;
		} else {
			baseScale = width / img.width;
		}

		const drawWidth = img.width * baseScale * scale;
		const drawHeight = img.height * baseScale * scale;

		// 中心位置 + オフセット
		const x = width / 2 + offset.x - drawWidth / 2;
		const y = height / 2 + offset.y - drawHeight / 2;

		// 補間設定
		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = "high";

		ctx.drawImage(img, x, y, drawWidth, drawHeight);
	}, [scale, offset, isImageLoaded, containerSize]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		container.addEventListener("wheel", handleWheel, { passive: false });
		return () => {
			container.removeEventListener("wheel", handleWheel);
		};
	}, [handleWheel]);

	return (
		<section
			ref={containerRef}
			className="flex-1 bg-[#202020] rounded-lg overflow-hidden flex items-center justify-center border border-[#505050] relative cursor-grab active:cursor-grabbing"
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			onMouseLeave={handleMouseUp}
			onDoubleClick={handleDoubleClick}
			aria-label="Image viewer"
		>
			{src ? (
				<canvas
					ref={canvasRef}
					className="pointer-events-none select-none"
					style={{ imageRendering: "pixelated" }}
				/>
			) : (
				<div className="text-gray-500 italic">No image selected</div>
			)}
		</section>
	);
};
