import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDisplayImage } from "./hooks/useDisplayImage";
import { useSearchPath } from "./hooks/useSearchPath";

function App() {
	const { searchPath, handlePathChange } = useSearchPath();
	const {
		imagePaths,
		currentImageIndex,
		currentImage,
		handleSetImagePaths,
		handleNext,
		handlePrevious,
		handleSelectImage,
	} = useDisplayImage();

	// 拡大・縮小と移動のための状態
	const [scale, setScale] = useState(1);
	const [offset, setOffset] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const [startPos, setStartPos] = useState({ x: 0, y: 0 });

	const imageContainerRef = useRef<HTMLElement>(null);

	// 画像が切り替わったらリセット
	useEffect(() => {
		if (currentImage !== undefined) {
			setScale(1);
			setOffset({ x: 0, y: 0 });
		}
	}, [currentImage]);

	const handleWheel = useCallback((e: WheelEvent) => {
		e.preventDefault();
		const zoomSpeed = 0.02;
		const factor = 2 ** (-e.deltaY * zoomSpeed);
		setScale((prev) => Math.min(Math.max(1, prev * factor), 16));
	}, []);

	const handleDoubleClick = useCallback(() => {
		setScale(1);
		setOffset({ x: 0, y: 0 });
	}, []);

	// ホイールでズーム (ログスケール)
	useEffect(() => {
		const container = imageContainerRef.current;
		if (!container) return;

		container.addEventListener("wheel", handleWheel, { passive: false });
		container.addEventListener("dblclick", handleDoubleClick, {
			passive: false,
		});
		return () => {
			container.removeEventListener("wheel", handleWheel);
			container.removeEventListener("dblclick", handleDoubleClick);
		};
	}, [handleWheel, handleDoubleClick]);

	// ドラッグ開始
	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault();
		if (e.button !== 0) return; // 左クリックのみ
		setIsDragging(true);
		setStartPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
	};

	// ドラッグ中
	const handleMouseMove = (e: React.MouseEvent) => {
		e.preventDefault();
		if (!isDragging) return;
		setOffset({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
	};

	// ドラッグ終了
	const handleMouseUp = () => {
		setIsDragging(false);
	};

	useEffect(() => {
		const unlisten = getCurrentWebviewWindow().onDragDropEvent(
			async (event) => {
				if (event.payload.type === "drop") {
					const paths = event.payload.paths;
					if (paths.length > 0) {
						const droppedPath = paths[0];
						const images = await handlePathChange(droppedPath);
						handleSetImagePaths(images);
					}
				}
			},
		);

		return () => {
			unlisten.then((fn) => fn());
		};
	}, [handlePathChange, handleSetImagePaths]);

	const onPathChange = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const path = e.target.value;
			if (!path) return;
			handleSetImagePaths(await handlePathChange(path));
		},
		[handlePathChange, handleSetImagePaths],
	);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// 入力欄にフォーカスがある時はスキップ
			if (document.activeElement?.tagName === "INPUT") return;

			if (e.key === "ArrowRight" || e.key === "ArrowDown") {
				handleNext();
			} else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
				handlePrevious();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [handleNext, handlePrevious]);

	return (
		<main className="bg-[#404040] h-screen p-2 flex flex-col overflow-hidden">
			{/* コントロールパネル */}
			<input
				type="text"
				value={searchPath ?? ""}
				onChange={onPathChange}
				placeholder="Directory path..."
				className="bg-[#303030] text-white border border-[#606060] p-1 rounded w-full placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-2"
			/>

			{/* メインコンテンツエリア */}
			<div className="flex flex-row flex-1 min-h-0 gap-2">
				{/* サイドバー: ファイル一覧 */}
				<div className="w-64 bg-[#303030] rounded-lg overflow-y-auto p-2 border border-[#505050]">
					<div className="text-gray-400 text-xs mb-2 px-1 uppercase tracking-wider font-bold">
						Images ({imagePaths.length})
					</div>
					<ul className="space-y-1">
						{imagePaths.map((path, index) => {
							const fileName = path.split(/[/\\]/).pop();
							return (
								<li key={path}>
									<button
										type="button"
										onClick={() => handleSelectImage(index)}
										className={`w-full text-left px-2 py-1 rounded text-sm truncate transition-colors ${
											index === currentImageIndex
												? "bg-blue-600 text-white"
												: "text-gray-300 hover:bg-[#404040] hover:text-white"
										}`}
										title={fileName}
									>
										{fileName}
									</button>
								</li>
							);
						})}
					</ul>
				</div>

				{/* 画像表示エリア */}
				<section
					ref={imageContainerRef}
					className="flex-1 bg-[#202020] rounded-lg overflow-hidden flex items-center justify-center border border-[#505050] relative cursor-grab active:cursor-grabbing"
					onMouseDown={handleMouseDown}
					onMouseMove={handleMouseMove}
					onMouseUp={handleMouseUp}
					onMouseLeave={handleMouseUp}
					aria-label="Image viewer"
				>
					{currentImage ? (
						<img
							src={`data:image/jpeg;base64,${currentImage}`}
							alt="featured"
							className="max-w-full max-h-full object-contain pointer-events-none select-none"
							style={{
								transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
								transformOrigin: "center",
							}}
							draggable={false}
						/>
					) : (
						<div className="text-gray-500 italic">No image selected</div>
					)}
				</section>
			</div>
		</main>
	);
}

export default App;
