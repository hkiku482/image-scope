import { useEffect, useMemo, useState } from "react";
import {
	getImageRgbHistogram,
	type ImageRgbHistogram,
} from "../../lib/tauri-api";

export type ImageRgbHistogramState = {
	error: string | null;
	histogram: ImageRgbHistogram | null;
	isLoading: boolean;
};

export const useImageRgbHistogram = (path: string | null) => {
	const [state, setState] = useState<ImageRgbHistogramState>({
		error: null,
		histogram: null,
		isLoading: false,
	});

	useEffect(() => {
		let isCurrent = true;

		if (!path) {
			setState({ error: null, histogram: null, isLoading: false });
			return () => {
				isCurrent = false;
			};
		}

		setState({ error: null, histogram: null, isLoading: true });
		getImageRgbHistogram(path)
			.then((histogram) => {
				if (!isCurrent) return;
				setState({ error: null, histogram, isLoading: false });
			})
			.catch((error) => {
				if (!isCurrent) return;
				setState({
					error: error instanceof Error ? error.message : String(error),
					histogram: null,
					isLoading: false,
				});
			});

		return () => {
			isCurrent = false;
		};
	}, [path]);

	return useMemo(() => state, [state]);
};
