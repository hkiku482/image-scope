import { useEffect, useRef } from "react";
import { useCanvas } from "../hooks/useCanvas";

export type CanvasProps = { src: string | null };

export const Canvas = ({ src }: CanvasProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const {
		scale,
		offset,
		handleWheel,
		handleDoubleClick,
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
	} = useCanvas(src);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		// ReactのonWheelイベントは非パッシブにできないため、直接addEventListenerを使用
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
				<img
					src={src}
					alt="featured"
					className="max-w-full max-h-full object-contain pointer-events-none select-none"
					style={{
						transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
						transformOrigin: "center",
						willChange: "transform",
						backfaceVisibility: "hidden",
						WebkitBackfaceVisibility: "hidden",
					}}
					draggable={false}
				/>
			) : (
				<div className="text-gray-500 italic">No image selected</div>
			)}
		</section>
	);
};
