import { useCallback, useEffect, useState } from "react";

export type Point = {
	x: number;
	y: number;
};

export const useViewportTransform = (imageKey: string | null) => {
	const [scale, setScale] = useState(1);
	const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
	const [dragStart, setDragStart] = useState<Point | null>(null);

	useEffect(() => {
		setScale(1);
		setOffset({ x: 0, y: 0 });
		setDragStart(null);
	}, [imageKey]);

	const reset = useCallback(() => {
		setScale(1);
		setOffset({ x: 0, y: 0 });
	}, []);

	const onWheel = useCallback(
		(event: WheelEvent, bounds: DOMRect) => {
			event.preventDefault();
			const factor = Math.exp(-event.deltaY * 0.0025);
			const nextScale = Math.min(Math.max(1, scale * factor), 20);
			const mouseX = event.clientX - bounds.left - bounds.width / 2;
			const mouseY = event.clientY - bounds.top - bounds.height / 2;
			const imageX = (mouseX - offset.x) / scale;
			const imageY = (mouseY - offset.y) / scale;

			setScale(nextScale);
			setOffset({
				x: Math.round(mouseX - imageX * nextScale),
				y: Math.round(mouseY - imageY * nextScale),
			});
		},
		[offset, scale],
	);

	const beginDrag = useCallback(
		(event: React.MouseEvent) => {
			if (event.button !== 0) return;
			setDragStart({ x: event.clientX - offset.x, y: event.clientY - offset.y });
		},
		[offset],
	);

	const drag = useCallback(
		(event: React.MouseEvent) => {
			if (!dragStart) return;
			setOffset({
				x: Math.round(event.clientX - dragStart.x),
				y: Math.round(event.clientY - dragStart.y),
			});
		},
		[dragStart],
	);

	const endDrag = useCallback(() => setDragStart(null), []);

	return {
		beginDrag,
		drag,
		endDrag,
		isDragging: dragStart !== null,
		offset,
		onWheel,
		reset,
		scale,
	};
};
