import { invoke } from "@tauri-apps/api/core";
import { useCallback, useState } from "react";

export const useSearchPath = () => {
	const [searchPath, setSearchPath] = useState<string | null>(null);

	const handlePathChange = useCallback(async (path: string) => {
		const paths = await invoke("get_path_items", { basePath: path });
		setSearchPath(path);
		return paths as string[];
	}, []);

	return { searchPath, handlePathChange };
};
