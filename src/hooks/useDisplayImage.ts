import { invoke } from "@tauri-apps/api/core";
import { useCallback, useState } from "react";

export const useDisplayImage = () => {
	const [imagePaths, setImagePaths] = useState<string[]>([]);
	const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
	const [currentImage, setCurrentImage] = useState<string | null>(null);

	const handleSetImagePaths = useCallback(async (paths: string[]) => {
		setImagePaths(paths);
		setCurrentImageIndex(0);
		if (paths.length > 0) {
			invoke("get_image_base64", { path: paths[0] })
				.then((base64) => {
					setCurrentImage(base64 as string);
				})
				.catch((error) => {
					console.error(error);
				});
		} else {
			setCurrentImage(null);
		}
	}, []);

	const handleNext = useCallback(async () => {
		if (imagePaths.length === 0) return;
		const nextIdx = (currentImageIndex + 1) % imagePaths.length;
		invoke("get_image_base64", { path: imagePaths[nextIdx] })
			.then((base64) => {
				setCurrentImage(base64 as string);
				setCurrentImageIndex(nextIdx);
			})
			.catch((error) => {
				console.error(error);
			});
	}, [currentImageIndex, imagePaths]);

	const handlePrevious = useCallback(async () => {
		if (imagePaths.length === 0) return;
		const prevIdx =
			(currentImageIndex - 1 + imagePaths.length) % imagePaths.length;
		invoke("get_image_base64", { path: imagePaths[prevIdx] })
			.then((base64) => {
				setCurrentImage(base64 as string);
				setCurrentImageIndex(prevIdx);
			})
			.catch((error) => {
				console.error(error);
			});
	}, [currentImageIndex, imagePaths]);

	const handleSelectImage = useCallback(
		async (index: number) => {
			if (index < 0 || index >= imagePaths.length) return;
			invoke("get_image_base64", { path: imagePaths[index] })
				.then((base64) => {
					setCurrentImage(base64 as string);
					setCurrentImageIndex(index);
				})
				.catch((error) => {
					console.error(error);
				});
		},
		[imagePaths],
	);

	return {
		imagePaths,
		currentImageIndex,
		currentImage,
		handleSetImagePaths,
		handleNext,
		handlePrevious,
		handleSelectImage,
	};
};
