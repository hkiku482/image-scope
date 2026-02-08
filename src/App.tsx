import {
	IconArrowBackUp,
	IconFolder,
	IconLayoutSidebar,
	IconLayoutSidebarRight,
	IconSearch,
} from "@tabler/icons-react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useCallback, useEffect, useState } from "react";
import { Canvas } from "./features/Canvas";
import { CanvasProvider, useCanvasContext } from "./features/CanvasProvider";
import { useDisplayImage } from "./hooks/useDisplayImage";
import { type PathItem, useSearchPath } from "./hooks/useSearchPath";

function App() {
	const {
		searchPath,
		changeSearchPath,
		getChildItems,
		getChildItemsBySearchPath,
		moveParentPath,
		loadHistory,
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

	const [currentItems, setCurrentItems] = useState<PathItem[]>([]);
	const [isSidebarVisible, setIsSidebarVisible] = useState(true);

	const updateItems = useCallback(
		async (items: PathItem[]) => {
			setCurrentItems(items);
			const images = items
				.filter((item) => !item.is_directory)
				.map((item) => item.path);
			await handleSetImagePaths(images);
		},
		[handleSetImagePaths],
	);

	// 起動時に履歴を読み込む
	useEffect(() => {
		const init = async () => {
			const result = await loadHistory();
			if (result) {
				await updateItems(result.items);
			}
		};
		init();
	}, [loadHistory, updateItems]);

	useEffect(() => {
		const unlisten = getCurrentWebviewWindow().onDragDropEvent(
			async (event) => {
				if (event.payload.type === "drop") {
					const paths = event.payload.paths;
					if (paths.length > 0) {
						const droppedPath = paths[0];
						const items = await getChildItems(droppedPath);
						await updateItems(items);
					}
				}
			},
		);

		return () => {
			unlisten.then((fn) => fn());
		};
	}, [getChildItems, updateItems]);

	const onSubmit = useCallback(
		async (e?: React.FormEvent<HTMLFormElement>) => {
			e?.preventDefault();
			const items = await getChildItemsBySearchPath();
			await updateItems(items);
		},
		[getChildItemsBySearchPath, updateItems],
	);

	const handleDirectoryClick = useCallback(
		async (path: string) => {
			const items = await getChildItems(path);
			await updateItems(items);
		},
		[getChildItems, updateItems],
	);

	const handleBackClick = useCallback(async () => {
		const result = await moveParentPath();
		if (result) {
			await updateItems(result.items);
		}
	}, [moveParentPath, updateItems]);

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

	useEffect(() => {
		if (imagePaths.length === 0) return;
		const selectedPath = imagePaths[currentImageIndex];
		if (selectedPath) {
			changeSearchPath(selectedPath);
		}
	}, [changeSearchPath, currentImageIndex, imagePaths]);

	return (
		<CanvasProvider>
			<CanvasSyncEffect src={currentImage} />
			<main className="bg-[#404040] h-screen p-2 flex flex-col overflow-hidden">
				{/* コントロールパネル */}
				<form onSubmit={onSubmit}>
					<div className="flex flex-row gap-2">
						<button
							type="button"
							onClick={() => setIsSidebarVisible((prev) => !prev)}
							aria-label={isSidebarVisible ? "Hide sidebar" : "Show sidebar"}
							title={isSidebarVisible ? "Hide sidebar" : "Show sidebar"}
							className="p-2 bg-[#505050] text-white rounded mb-2 hover:bg-[#606060] active:bg-[#505050] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm font-bold whitespace-nowrap shadow-lg"
						>
							{isSidebarVisible ? (
								<IconLayoutSidebar size={16} />
							) : (
								<IconLayoutSidebarRight size={16} />
							)}
						</button>
						<input
							type="text"
							value={searchPath ?? ""}
							readOnly
							placeholder="Directory path..."
							className="bg-[#303030] text-white border border-[#606060] p-1 rounded w-full placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-2"
						/>
						<button
							type="submit"
							aria-label="Search"
							title="Search"
							className="px-6 bg-blue-600 text-white rounded mb-2 hover:bg-blue-500 active:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm font-bold whitespace-nowrap shadow-lg"
						>
							<IconSearch size={16} />
						</button>
					</div>
				</form>

				{/* メインコンテンツエリア */}
				<div className="flex flex-row flex-1 min-h-0 gap-2">
					{/* サイドバー: ファイル一覧 */}
					{isSidebarVisible && (
						<div className="w-64 bg-[#303030] rounded-lg overflow-y-scroll overscroll-y-contain p-2 border border-[#505050]">
							<div className="text-gray-400 text-xs mb-2 px-1 uppercase tracking-wider font-bold">
								Items ({currentItems.length})
							</div>
							<ul className="space-y-1">
								{searchPath && (
									<li>
										<button
											type="button"
											onClick={handleBackClick}
											className="w-full text-left px-2 py-1 rounded text-sm truncate transition-colors text-gray-300 hover:bg-[#404040] hover:text-white flex items-center gap-1.5"
										>
											<IconArrowBackUp size={16} className="opacity-60" />
											<span className="font-bold">..</span>
										</button>
									</li>
								)}
								{currentItems.map((item) => {
									const fileName = item.path.split(/[/\\]/).pop();
									const isDir = item.is_directory;

									if (isDir) {
										return (
											<li key={item.path}>
												<button
													type="button"
													onClick={() => handleDirectoryClick(item.path)}
													className="w-full text-left px-2 py-1 rounded text-sm truncate transition-colors text-blue-400 hover:bg-[#404040] hover:text-blue-300 flex items-center gap-1.5"
													title={fileName}
												>
													<IconFolder size={16} className="opacity-80" />
													<span className="font-medium">{fileName}</span>
												</button>
											</li>
										);
									}

									const imgIndex = imagePaths.indexOf(item.path);
									return (
										<li key={item.path}>
											<button
												type="button"
												onClick={() => handleSelectImage(imgIndex)}
												className={`w-full text-left px-2 py-1 rounded text-sm truncate transition-colors ${
													imgIndex === currentImageIndex
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
					)}

					{/* 画像表示エリア (Canvas) */}
					<Canvas />
				</div>
			</main>
		</CanvasProvider>
	);
}

const CanvasSyncEffect = ({ src }: { src: string | null }) => {
	const { setSrc } = useCanvasContext();
	useEffect(() => {
		setSrc(src);
	}, [src, setSrc]);
	return null;
};

export default App;
