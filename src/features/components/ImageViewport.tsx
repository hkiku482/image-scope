import { ImageOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { EmptyState } from "../../components/layout/EmptyState";
import { getPixelColor } from "../../utils/color";
import type { ColorPickerState } from "../hooks/useColorPicker";
import { useViewportTransform } from "../hooks/useViewportTransform";
import { ColorInspector } from "./ColorInspector";

type ImageViewportProps = {
	colorPicker: ColorPickerState;
	isGrayscale: boolean;
	imageDataUrl: string | null;
	onResolutionChange: (
		resolution: { width: number; height: number } | null,
	) => void;
	onScaleChange: (scale: number) => void;
};

export const ImageViewport = ({
	colorPicker,
	isGrayscale,
	imageDataUrl,
	onResolutionChange,
	onScaleChange,
}: ImageViewportProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const imageRef = useRef<HTMLImageElement | null>(null);
	const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
	const animationRef = useRef<number | null>(null);
	const hoverRef = useRef<number | null>(null);
	const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
	const [imageResolution, setImageResolution] = useState<{
		width: number;
		height: number;
	} | null>(null);
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const transform = useViewportTransform(imageDataUrl);
	const {
		activeColor,
		hoverColor,
		hsl,
		isInspectorOpen,
		setHoverColor,
		setIsInspectorOpen,
		setPickedColor,
	} = colorPicker;

	useEffect(() => {
		onScaleChange(transform.scale);
	}, [onScaleChange, transform.scale]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		const resize = () => {
			const rect = container.getBoundingClientRect();
			setContainerSize({ width: rect.width, height: rect.height });
		};
		resize();
		const observer = new ResizeObserver(resize);
		observer.observe(container);
		window.addEventListener("resize", resize);
		return () => {
			observer.disconnect();
			window.removeEventListener("resize", resize);
		};
	}, []);

	useEffect(() => {
		if (!imageDataUrl) {
			imageRef.current = null;
			setImageResolution(null);
			onResolutionChange(null);
			setHoverColor(null);
			setPickedColor(null);
			return;
		}

		const image = new Image();
		image.onload = () => {
			imageRef.current = image;
			const resolution = { width: image.width, height: image.height };
			setImageResolution(resolution);
			onResolutionChange(resolution);
			setHoverColor(null);
			setPickedColor(null);
		};
		image.src = imageDataUrl;
	}, [imageDataUrl, onResolutionChange, setHoverColor, setPickedColor]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		const onWheel = (event: WheelEvent) => {
			transform.onWheel(event, container.getBoundingClientRect());
		};
		container.addEventListener("wheel", onWheel, { passive: false });
		return () => container.removeEventListener("wheel", onWheel);
	}, [transform.onWheel]);

	useEffect(() => {
		const canvas = canvasRef.current;
		const image = imageRef.current;
		if (!canvas) return;
		if (animationRef.current) cancelAnimationFrame(animationRef.current);

		animationRef.current = requestAnimationFrame(() => {
			const { width, height } = containerSize;
			const dpr = window.devicePixelRatio || 1;
			if (!width || !height) return;

			const needsResize =
				canvas.width !== Math.round(width * dpr) ||
				canvas.height !== Math.round(height * dpr);
			if (!ctxRef.current || needsResize) {
				ctxRef.current = canvas.getContext("2d", { willReadFrequently: true });
			}

			const ctx = ctxRef.current;
			if (!ctx) return;

			if (needsResize) {
				canvas.width = Math.round(width * dpr);
				canvas.height = Math.round(height * dpr);
				canvas.style.width = `${width}px`;
				canvas.style.height = `${height}px`;
				ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			}

			ctx.clearRect(0, 0, width, height);
			if (!image || !imageResolution) return;

			const containerRatio = width / height;
			const imageRatio = image.width / image.height;
			const baseScale =
				containerRatio > imageRatio
					? height / image.height
					: width / image.width;
			const drawWidth = image.width * baseScale * transform.scale;
			const drawHeight = image.height * baseScale * transform.scale;
			const x = Math.round(width / 2 + transform.offset.x - drawWidth / 2);
			const y = Math.round(height / 2 + transform.offset.y - drawHeight / 2);

			ctx.imageSmoothingEnabled = true;
			ctx.imageSmoothingQuality = "high";
			ctx.filter = isGrayscale ? "grayscale(1)" : "none";
			ctx.drawImage(image, x, y, drawWidth, drawHeight);
			ctx.filter = "none";
		});

		return () => {
			if (animationRef.current) cancelAnimationFrame(animationRef.current);
		};
	}, [
		containerSize,
		imageResolution,
		isGrayscale,
		transform.offset,
		transform.scale,
	]);

	const sampleColor = useCallback((clientX: number, clientY: number) => {
		const canvas = canvasRef.current;
		const ctx = ctxRef.current;
		if (!canvas || !ctx) return null;
		const rect = canvas.getBoundingClientRect();
		const dpr = window.devicePixelRatio || 1;
		const x = (clientX - rect.left) * dpr;
		const y = (clientY - rect.top) * dpr;
		if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
			return null;
		}
		return getPixelColor(ctx, x, y);
	}, []);

	const updateHoverColor = useCallback(
		(clientX: number, clientY: number) => {
			if (hoverRef.current) cancelAnimationFrame(hoverRef.current);
			hoverRef.current = requestAnimationFrame(() => {
				setHoverColor(sampleColor(clientX, clientY));
			});
		},
		[sampleColor, setHoverColor],
	);

	return (
		<section
			ref={containerRef}
			className="relative min-h-0 flex-1 overflow-hidden bg-viewer outline-none"
			onMouseDown={transform.beginDrag}
			onMouseMove={(event) => {
				setMousePosition({ x: event.clientX, y: event.clientY });
				transform.drag(event);
				updateHoverColor(event.clientX, event.clientY);
			}}
			onMouseUp={transform.endDrag}
			onMouseLeave={() => {
				transform.endDrag();
				setHoverColor(null);
			}}
			onDoubleClick={transform.reset}
			onContextMenu={(event) => {
				event.preventDefault();
				const color = sampleColor(event.clientX, event.clientY);
				if (color) {
					setPickedColor(color);
					setIsInspectorOpen(true);
				}
			}}
			aria-label="Image viewport"
		>
			{imageDataUrl ? (
				<canvas
					ref={canvasRef}
					className="pointer-events-none select-none"
					style={{ imageRendering: "pixelated" }}
				/>
			) : (
				<EmptyState>
					<ImageOff className="size-10" />
					<div className="text-sm">Drop an image or folder to start</div>
				</EmptyState>
			)}
			{hoverColor && (
				<div
					className="pointer-events-none fixed z-50 size-4 rounded-full border border-white shadow-lg"
					style={{
						backgroundColor: hoverColor.hex,
						left: mousePosition.x + 12,
						top: mousePosition.y + 12,
					}}
				/>
			)}
			<ColorInspector
				color={activeColor}
				hsl={hsl}
				isOpen={isInspectorOpen}
				onOpenChange={setIsInspectorOpen}
			/>
		</section>
	);
};
