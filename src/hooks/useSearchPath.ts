import { invoke } from "@tauri-apps/api/core";
import { useCallback, useState } from "react";

export const useSearchPath = () => {
	const [searchPath, setSearchPath] = useState<string | null>(null);

	const changeSearchPath = useCallback((path: string) => {
		setSearchPath(path);
	}, []);

	const getChildItemsBySearchPath = useCallback(async () => {
		const paths = await invoke("get_path_items", { basePath: searchPath });
		return paths as string[];
	}, [searchPath]);

	const getChildItems = useCallback(async (path: string) => {
		const paths = await invoke("get_path_items", { basePath: path });
		setSearchPath(path);
		return paths as string[];
	}, []);

	return {
		searchPath,
		getChildItems,
		changeSearchPath,
		getChildItemsBySearchPath,
	};
};
