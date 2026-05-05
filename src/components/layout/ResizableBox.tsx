import type * as React from "react";
import { cn } from "../../lib/utils";

type ResizeHandle = "bottom" | "bottom-left" | "left";

export type ResizableBoxSize = {
	height: number;
	width: number;
};

export type ResizableBoxProps = {
	aspectRatio: number;
	children: React.ReactNode;
	className?: string;
	handles?: ResizeHandle[];
	maxWidth?: number;
	minWidth: number;
	onSizeChange: (size: ResizableBoxSize) => void;
	size: ResizableBoxSize;
};

const handleClass = {
	bottom: "bottom-[-4px] left-3 right-3 h-2 cursor-ns-resize",
	"bottom-left": "bottom-[-6px] left-[-6px] size-4 cursor-nesw-resize",
	left: "bottom-3 left-[-4px] top-3 w-2 cursor-ew-resize",
} satisfies Record<ResizeHandle, string>;

export const ResizableBox = ({
	aspectRatio,
	children,
	className,
	handles = ["left", "bottom", "bottom-left"],
	maxWidth = 640,
	minWidth,
	onSizeChange,
	size,
}: ResizableBoxProps) => {
	const minHeight = minWidth / aspectRatio;
	const maxHeight = maxWidth / aspectRatio;

	const beginResize =
		(handle: ResizeHandle) => (event: React.PointerEvent<HTMLDivElement>) => {
			event.preventDefault();
			event.currentTarget.setPointerCapture(event.pointerId);

			const start = {
				height: size.height,
				width: size.width,
				x: event.clientX,
				y: event.clientY,
			};

			const onPointerMove = (moveEvent: PointerEvent) => {
				const widthFromLeft = start.width - (moveEvent.clientX - start.x);
				const heightFromBottom = start.height + (moveEvent.clientY - start.y);
				const nextWidth =
					handle === "left"
						? widthFromLeft
						: handle === "bottom"
							? heightFromBottom * aspectRatio
							: Math.max(widthFromLeft, heightFromBottom * aspectRatio);
				const width = Math.min(maxWidth, Math.max(minWidth, nextWidth));
				const height = Math.min(
					maxHeight,
					Math.max(minHeight, width / aspectRatio),
				);

				onSizeChange({ height, width });
			};

			const endResize = () => {
				window.removeEventListener("pointermove", onPointerMove);
				window.removeEventListener("pointerup", endResize);
			};

			window.addEventListener("pointermove", onPointerMove);
			window.addEventListener("pointerup", endResize);
		};

	return (
		<div
			className={cn("relative", className)}
			style={{ height: size.height, width: size.width }}
		>
			{children}
			{handles.map((handle) => (
				<div
					key={handle}
					className={cn("absolute z-20", handleClass[handle])}
					onPointerDown={beginResize(handle)}
				/>
			))}
		</div>
	);
};
