import { invoke } from "@tauri-apps/api/core";
import { useCallback, useState } from "react";

export type PathItem = {
	is_directory: boolean;
	path: string;
};

export const useSearchPath = () => {
	const [searchPath, setSearchPath] = useState<string | null>(null);

	const changeSearchPath = useCallback((path: string) => {
		setSearchPath(path);
	}, []);

	const getChildItemsBySearchPath = useCallback(async () => {
		const items = await invoke("get_path_items", { basePath: searchPath });
		return items as PathItem[];
	}, [searchPath]);

	const getChildItems = useCallback(async (path: string) => {
		const items = await invoke("get_path_items", { basePath: path });
		setSearchPath(path);
		return items as PathItem[];
	}, []);

	const moveParentPath = useCallback(async () => {
		if (!searchPath) return null;
		const parent = (await invoke("get_parent_path", {
			path: searchPath,
		})) as string;
		return await getChildItems(parent);
	}, [getChildItems, searchPath]);

	return {
		searchPath,
		getChildItems,
		changeSearchPath,
		getChildItemsBySearchPath,
		moveParentPath,
	};
};
