import { invoke } from "@tauri-apps/api/core";

export type PathItem = {
	is_directory: boolean;
	path: string;
};

export type ImageRgbHistogram = {
	red: number[];
	green: number[];
	blue: number[];
	pixel_count: number;
};

export const getPathItems = (basePath: string) =>
	invoke<PathItem[]>("get_path_items", { basePath });

export const getParentPath = (path: string) =>
	invoke<string>("get_parent_path", { path });

export const getImageBase64 = (path: string) =>
	invoke<string>("get_image_base64", { path });

export const getImageRgbHistogram = (path: string) =>
	invoke<ImageRgbHistogram>("get_image_rgb_histogram", { path });

export const writeHistory = (path: string) =>
	invoke<void>("write_history", { path });

export const readHistory = () => invoke<string>("read_history");

export const fileNameOf = (path: string) =>
	path.split(/[/\\]/).filter(Boolean).slice(-1)[0] ?? path;
