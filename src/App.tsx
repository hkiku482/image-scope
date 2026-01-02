import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useCallback, useEffect } from "react";
import { Canvas } from "./features/Canvas";
import { CanvasProvider, useCanvasContext } from "./features/CanvasProvider";
import { useDisplayImage } from "./hooks/useDisplayImage";
import { useSearchPath } from "./hooks/useSearchPath";

function App() {
	const {
		searchPath,
		changeSearchPath,
		getChildItems,
		getChildItemsBySearchPath,
	} = useSearchPath();
	const {
		imagePaths,
		currentImageIndex,
		currentImage,
		handleSetImagePaths,
		handleNext,
		handlePrevious,
		handleSelectImage,
	} = useDisplayImage();

	useEffect(() => {
		const unlisten = getCurrentWebviewWindow().onDragDropEvent(
			async (event) => {
				if (event.payload.type === "drop") {
					const paths = event.payload.paths;
					if (paths.length > 0) {
						const droppedPath = paths[0];
						const images = await getChildItems(droppedPath);
						handleSetImagePaths(images);
					}
				}
			},
		);

		return () => {
			unlisten.then((fn) => fn());
		};
	}, [getChildItems, handleSetImagePaths]);

	const onPathChange = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const path = e.target.value;
			if (!path) return;
			changeSearchPath(path);
		},
		[changeSearchPath],
	);

	const onSubmit = useCallback(
		async (e?: React.FormEvent<HTMLFormElement>) => {
			e?.preventDefault();
			const images = await getChildItemsBySearchPath();
			handleSetImagePaths(images);
		},
		[getChildItemsBySearchPath, handleSetImagePaths],
	);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// 入力欄にフォーカスがある時はスキップ
			if (document.activeElement?.tagName === "INPUT") return;
			e.preventDefault();

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
		<CanvasProvider>
			<main className="bg-[#404040] h-screen p-2 flex flex-col overflow-hidden">
				{/* コントロールパネル */}
				<form onSubmit={onSubmit}>
					<div className="flex flex-row gap-2">
						<input
							type="text"
							value={searchPath ?? ""}
							onChange={onPathChange}
							placeholder="Directory path..."
							className="bg-[#303030] text-white border border-[#606060] p-1 rounded w-full placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-2"
						/>
						<button
							type="submit"
							className="px-6 bg-blue-600 text-white rounded mb-2 hover:bg-blue-500 active:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm font-bold whitespace-nowrap shadow-lg"
						>
							Search
						</button>
					</div>
				</form>

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

					{/* 画像表示エリア (Canvas) */}
					<Canvas />
				</div>
				<CanvasSync src={currentImage} />
			</main>
		</CanvasProvider>
	);
}

const CanvasSync = ({ src }: { src: string | null }) => {
	const { setSrc } = useCanvasContext();
	useEffect(() => {
		setSrc(src);
	}, [src, setSrc]);
	return null;
};

export default App;
