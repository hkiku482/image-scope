import { useCallback, useEffect, useRef, useState } from "react";
import { useCanvasContext } from "./CanvasProvider";
import { ColorCircle } from "./ColorCircle";

const DEFAULT_PICKED_COLOR = { r: 0, g: 0, b: 0, hex: "#000000" };

export const Canvas = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const imageRef = useRef<HTMLImageElement | null>(null);
	const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
	const animationFrameRef = useRef<number | null>(null);
	const colorUpdateFrameRef = useRef<number | null>(null);
	const [imageResolution, setImageResolution] = useState<{
		width: number;
		height: number;
	} | null>(null);
	const [pickedColor, setPickedColor] = useState<{
		r: number;
		g: number;
		b: number;
		hex: string;
	}>(DEFAULT_PICKED_COLOR);
	const [hoverColor, setHoverColor] = useState<string | null>(null);
	const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
	const [showColorCircle, setShowColorCircle] = useState(false);

	const {
		src,
		scale,
		offset,
		handleWheel,
		handleDoubleClick,
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
		setHexColor,
		mode,
	} = useCanvasContext();

	const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const updateSize = () => {
			const rect = container.getBoundingClientRect();
			setContainerSize({ width: rect.width, height: rect.height });
		};

		// 初回サイズ設定
		updateSize();

		// ResizeObserverでコンテナのサイズ変更を監視（サイドバーの表示/非表示も検出）
		const resizeObserver = new ResizeObserver(() => {
			updateSize();
		});
		resizeObserver.observe(container);

		// ウィンドウリサイズも監視（念のため）
		window.addEventListener("resize", updateSize);

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener("resize", updateSize);
		};
	}, []);

	// 画像の読み込み
	useEffect(() => {
		if (!src) {
			imageRef.current = null;
			setImageResolution(null);
			setPickedColor(DEFAULT_PICKED_COLOR);
			return;
		}

		// 新しい画像の読み込み開始時に状態をクリア
		setImageResolution(null);
		imageRef.current = null;

		const img = new Image();
		img.onload = () => {
			imageRef.current = img;
			setImageResolution({ width: img.width, height: img.height });
			setPickedColor(DEFAULT_PICKED_COLOR);
		};
		img.src = src;
	}, [src]);

	const handleContextMenu = (e: React.MouseEvent) => {
		e.preventDefault();
		const canvas = canvasRef.current;
		const ctx = ctxRef.current;
		if (!canvas || !ctx) return;

		const rect = canvas.getBoundingClientRect();
		const dpr = window.devicePixelRatio || 1;
		const x = (e.clientX - rect.left) * dpr;
		const y = (e.clientY - rect.top) * dpr;

		try {
			const pixel = ctx.getImageData(x, y, 1, 1).data;
			const r = pixel[0];
			const g = pixel[1];
			const b = pixel[2];
			const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
			setPickedColor({ r, g, b, hex });
			setHexColor(hex);
			setShowColorCircle(true);
		} catch (error) {
			console.error("Failed to pick color:", error);
		}
	};

	const updateHoverColor = useCallback(
		(clientX: number, clientY: number) => {
			const canvas = canvasRef.current;
			const ctx = ctxRef.current;
			if (!canvas || !ctx) return;

			const rect = canvas.getBoundingClientRect();
			const dpr = window.devicePixelRatio || 1;
			const x = (clientX - rect.left) * dpr;
			const y = (clientY - rect.top) * dpr;

			if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
				setHoverColor(null);
				return;
			}

			try {
				const pixel = ctx.getImageData(x, y, 1, 1).data;
				if (pixel[3] === 0) {
					setHoverColor(null);
					return;
				}
				const r = pixel[0];
				const g = pixel[1];
				const b = pixel[2];
				const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
				setHoverColor(hex);

				if (mode === "dynamic" && showColorCircle) {
					setHexColor(hex);
				}
			} catch {
				setHoverColor(null);
			}
		},
		[mode, showColorCircle, setHexColor],
	);

	const onMouseMoveWithColor = (e: React.MouseEvent) => {
		handleMouseMove(e);
		setMousePos({ x: e.clientX, y: e.clientY });

		// 色取得処理をスロットリング
		if (colorUpdateFrameRef.current !== null) {
			cancelAnimationFrame(colorUpdateFrameRef.current);
		}
		colorUpdateFrameRef.current = requestAnimationFrame(() => {
			updateHoverColor(e.clientX, e.clientY);
			colorUpdateFrameRef.current = null;
		});
	};

	// 描画処理（requestAnimationFrameでスロットリング）
	useEffect(() => {
		const canvas = canvasRef.current;
		const container = containerRef.current;
		const img = imageRef.current;

		if (!canvas || !container) return;

		// 既存のアニメーションフレームをキャンセル
		if (animationFrameRef.current !== null) {
			cancelAnimationFrame(animationFrameRef.current);
		}

		animationFrameRef.current = requestAnimationFrame(() => {
			// キャンバスサイズの調整 (High DPI対応)
			const dpr = window.devicePixelRatio || 1;
			const { width, height } = containerSize;
			if (width === 0 || height === 0) {
				animationFrameRef.current = null;
				return;
			}

			const needsResize =
				canvas.width !== width * dpr || canvas.height !== height * dpr;

			// コンテキストの初期化または再取得
			if (!ctxRef.current || needsResize) {
				ctxRef.current = canvas.getContext("2d", {
					willReadFrequently: true,
				});
			}

			const ctx = ctxRef.current;
			if (!ctx) {
				animationFrameRef.current = null;
				return;
			}

			if (needsResize) {
				canvas.width = width * dpr;
				canvas.height = height * dpr;
				canvas.style.width = `${width}px`;
				canvas.style.height = `${height}px`;
				ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			}

			ctx.clearRect(0, 0, width, height);

			// 画像がない、または読み込み中の場合はクリアのみ行い終了
			if (!img || !imageResolution) {
				animationFrameRef.current = null;
				return;
			}

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

			// 中心位置 + オフセット（整数に丸める）
			const x = Math.round(width / 2 + offset.x - drawWidth / 2);
			const y = Math.round(height / 2 + offset.y - drawHeight / 2);

			// 補間設定
			ctx.imageSmoothingEnabled = true;
			ctx.imageSmoothingQuality = "high";

			ctx.drawImage(img, x, y, drawWidth, drawHeight);
			animationFrameRef.current = null;
		});

		return () => {
			if (animationFrameRef.current !== null) {
				cancelAnimationFrame(animationFrameRef.current);
				animationFrameRef.current = null;
			}
		};
	}, [scale, offset, containerSize, imageResolution]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		container.addEventListener("wheel", handleWheel, { passive: false });
		return () => {
			container.removeEventListener("wheel", handleWheel);
		};
	}, [handleWheel]);

	// クリーンアップ
	useEffect(() => {
		return () => {
			if (animationFrameRef.current !== null) {
				cancelAnimationFrame(animationFrameRef.current);
			}
			if (colorUpdateFrameRef.current !== null) {
				cancelAnimationFrame(colorUpdateFrameRef.current);
			}
		};
	}, []);

	return (
		<section
			ref={containerRef}
			className="flex-1 bg-[#202020] rounded-lg overflow-hidden flex items-center justify-center border border-[#505050] relative cursor-default"
			onMouseDown={handleMouseDown}
			onMouseMove={onMouseMoveWithColor}
			onMouseUp={handleMouseUp}
			onMouseLeave={(e) => {
				handleMouseUp(e);
				setHoverColor(null);
			}}
			onDoubleClick={handleDoubleClick}
			onContextMenu={handleContextMenu}
			aria-label="Image viewer"
		>
			{hoverColor && (
				<div
					className="fixed w-4 h-4 rounded-full border border-white/80 shadow-lg pointer-events-none z-50"
					style={{
						left: mousePos.x + 12,
						top: mousePos.y + 12,
						backgroundColor: hoverColor,
					}}
				/>
			)}
			{pickedColor && imageResolution && (
				<div className="absolute bottom-4 right-4 z-20">
					{showColorCircle ? (
						<div className="shadow-2xl">
							<ColorCircle
								size={200}
								imageResolution={imageResolution}
								onClose={() => setShowColorCircle(false)}
							/>
						</div>
					) : (
						<button
							type="button"
							onClick={() => setShowColorCircle(true)}
							className="bg-black/50 hover:bg-black/70 text-white/70 hover:text-white p-2 rounded-full shadow-lg transition-all cursor-pointer border border-white/10"
							title="Show Color Circle"
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<title>Show Color Circle</title>
								<circle cx="12" cy="12" r="10" />
								<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8" />
							</svg>
						</button>
					)}
				</div>
			)}
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
