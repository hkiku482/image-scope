import { invoke } from "@tauri-apps/api/core";
import { useCallback, useState } from "react";

export type PathItem = {
	is_directory: boolean;
	path: string;
};

export const useSearchPath = () => {
	const [searchPath, setSearchPath] = useState<string | null>(null);

	const writeHistory = useCallback(async (path: string) => {
		try {
			await invoke("write_history", { path });
		} catch (e) {
			console.error("Failed to write history:", e);
		}
	}, []);

	const changeSearchPath = useCallback((path: string) => {
		setSearchPath(path);
	}, []);

	const getChildItems = useCallback(
		async (path: string) => {
			const items = (await invoke("get_path_items", {
				basePath: path,
			})) as PathItem[];
			setSearchPath(path);
			await writeHistory(path);
			return items;
		},
		[writeHistory],
	);

	const getChildItemsBySearchPath = useCallback(async () => {
		if (!searchPath) return [];
		const items = (await invoke("get_path_items", {
			basePath: searchPath,
		})) as PathItem[];
		await writeHistory(searchPath);
		return items;
	}, [searchPath, writeHistory]);

	const moveParentPath = useCallback(async () => {
		if (!searchPath) return null;
		const parent = (await invoke("get_parent_path", {
			path: searchPath,
		})) as string;
		const items = await getChildItems(parent);
		return { items, path: parent };
	}, [getChildItems, searchPath]);

	const loadHistory = useCallback(async () => {
		try {
			const savedPath = await invoke<string>("read_history");
			if (savedPath) {
				const items = await getChildItems(savedPath);
				return { path: savedPath, items };
			}
		} catch (e) {
			console.error("Failed to load history:", e);
		}
		return null;
	}, [getChildItems]);

	return {
		searchPath,
		getChildItems,
		changeSearchPath,
		getChildItemsBySearchPath,
		moveParentPath,
		loadHistory,
	};
};
