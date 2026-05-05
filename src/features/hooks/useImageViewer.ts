import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	fileNameOf,
	getImageBase64,
	getParentPath,
	getPathItems,
	readHistory,
	type PathItem,
	writeHistory,
} from "../../lib/tauri-api";

const imageItemsOf = (items: PathItem[]) =>
	items.filter((item) => !item.is_directory).map((item) => item.path);

const parentDirectoryOf = (path: string) => {
	const parts = path.split(/[/\\]/);
	parts.pop();
	return parts.join(path.includes("\\") ? "\\" : "/");
};

export const useImageViewer = () => {
	const [currentPath, setCurrentPath] = useState("");
	const [items, setItems] = useState<PathItem[]>([]);
	const [imagePaths, setImagePaths] = useState<string[]>([]);
	const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const selectedPath = imagePaths[selectedIndex] ?? null;
	const selectedName = selectedPath ? fileNameOf(selectedPath) : null;

	const openImageAt = useCallback(
		async (paths: string[], index: number) => {
			if (paths.length === 0) {
				setSelectedIndex(0);
				setImageDataUrl(null);
				return;
			}

			const safeIndex = (index + paths.length) % paths.length;
			const path = paths[safeIndex];
			setIsLoading(true);
			setError(null);
			try {
				const dataUrl = await getImageBase64(path);
				setSelectedIndex(safeIndex);
				setImageDataUrl(dataUrl);
			} catch (e) {
				setError(e instanceof Error ? e.message : String(e));
			} finally {
				setIsLoading(false);
			}
		},
		[],
	);

	const openPath = useCallback(
		async (path: string, preferredImagePath?: string) => {
			if (!path) return;
			setIsLoading(true);
			setError(null);
			try {
				const nextItems = await getPathItems(path);
				const nextImages = imageItemsOf(nextItems);
				const initialIndex =
					preferredImagePath && nextImages.includes(preferredImagePath)
						? nextImages.indexOf(preferredImagePath)
						: 0;
				const nextCurrentPath = nextImages.includes(path)
					? parentDirectoryOf(path)
					: path;

				setItems(nextItems);
				setImagePaths(nextImages);
				setCurrentPath(nextCurrentPath);
				await writeHistory(nextCurrentPath);
				await openImageAt(nextImages, initialIndex);
			} catch (e) {
				setError(e instanceof Error ? e.message : String(e));
			} finally {
				setIsLoading(false);
			}
		},
		[openImageAt],
	);

	const openParent = useCallback(async () => {
		if (!currentPath) return;
		const parent = await getParentPath(currentPath);
		await openPath(parent);
	}, [currentPath, openPath]);

	const selectImage = useCallback(
		async (path: string) => {
			const index = imagePaths.indexOf(path);
			if (index >= 0) {
				await openImageAt(imagePaths, index);
			}
		},
		[imagePaths, openImageAt],
	);

	const nextImage = useCallback(async () => {
		await openImageAt(imagePaths, selectedIndex + 1);
	}, [imagePaths, openImageAt, selectedIndex]);

	const previousImage = useCallback(async () => {
		await openImageAt(imagePaths, selectedIndex - 1);
	}, [imagePaths, openImageAt, selectedIndex]);

	useEffect(() => {
		const init = async () => {
			try {
				const saved = await readHistory();
				if (saved) {
					await openPath(saved);
				}
			} catch (e) {
				console.error(e);
			}
		};
		init();
	}, [openPath]);

	useEffect(() => {
		const unlisten = getCurrentWebviewWindow().onDragDropEvent(async (event) => {
			if (event.payload.type !== "drop") return;
			const [path] = event.payload.paths;
			if (path) {
				await openPath(path, path);
			}
		});

		return () => {
			unlisten.then((fn) => fn());
		};
	}, [openPath]);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (
				document.activeElement instanceof HTMLInputElement ||
				document.activeElement instanceof HTMLTextAreaElement
			) {
				return;
			}

			if (event.key === "ArrowRight" || event.key === "ArrowDown") {
				event.preventDefault();
				nextImage();
			}
			if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
				event.preventDefault();
				previousImage();
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [nextImage, previousImage]);

	return useMemo(
		() => ({
			currentPath,
			error,
			imageDataUrl,
			imagePaths,
			isLoading,
			isSidebarOpen,
			items,
			openParent,
			openPath,
			previousImage,
			nextImage,
			selectedIndex,
			selectedName,
			selectedPath,
			selectImage,
			setIsSidebarOpen,
		}),
		[
			currentPath,
			error,
			imageDataUrl,
			imagePaths,
			isLoading,
			isSidebarOpen,
			items,
			openParent,
			openPath,
			previousImage,
			nextImage,
			selectedIndex,
			selectedName,
			selectedPath,
			selectImage,
		],
	);
};
