import { useCallback, useEffect, useState } from "react";

export const useCanvas = (src: string | null) => {
	const [scale, setScale] = useState(1);
	const [offset, setOffset] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const [startPos, setStartPos] = useState({ x: 0, y: 0 });

	// 画像が切り替わったらリセット
	useEffect(() => {
		if (src !== undefined) {
			setScale(1);
			setOffset({ x: 0, y: 0 });
		}
	}, [src]);

	const handleWheel = useCallback(
		(e: WheelEvent) => {
			e.preventDefault();

			if (e.ctrlKey) {
				// Pinch-to-zoom (トラックパッド) または Ctrl + Scroll (マウス)
				const zoomSpeed = 0.02;
				const factor = Math.exp(-e.deltaY * zoomSpeed);
				const newScale = Math.min(Math.max(1, scale * factor), 20);

				if (newScale !== scale) {
					// マウスポインタを中心としたズーム
					const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
					// コンテナの中心からのマウス位置を計算
					const mouseX = e.clientX - rect.left - rect.width / 2;
					const mouseY = e.clientY - rect.top - rect.height / 2;

					// 現在のオフセットでのマウス位置の画像内座標（中心基準）
					const imageX = (mouseX - offset.x) / scale;
					const imageY = (mouseY - offset.y) / scale;

					// 新しいスケールでの新しいオフセットを計算
					setOffset({
						x: mouseX - imageX * newScale,
						y: mouseY - imageY * newScale,
					});
					setScale(newScale);
				}
			} else {
				// 2本指スクロール (トラックパッド) による移動
				// deltaX, deltaY をそのままオフセットに適用
				setOffset((prev) => ({
					x: prev.x - e.deltaX,
					y: prev.y - e.deltaY,
				}));
			}
		},
		[scale, offset],
	);

	const handleDoubleClick = useCallback(() => {
		setScale(1);
		setOffset({ x: 0, y: 0 });
	}, []);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			if (e.button !== 0) return; // 左クリックのみ
			setIsDragging(true);
			setStartPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
		},
		[offset],
	);

	const handleMouseMove = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			if (!isDragging) return;
			setOffset({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
		},
		[isDragging, startPos],
	);

	const handleMouseUp = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);

	return {
		scale,
		offset,
		isDragging,
		handleWheel,
		handleDoubleClick,
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
	};
};
