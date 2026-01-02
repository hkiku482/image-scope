import { useMemo, useState } from "react";

const hexToHsl = (hex: string) => {
	let r = 0,
		g = 0,
		b = 0;
	const h = hex.replace("#", "");
	if (h.length === 3) {
		r = parseInt(h[0] + h[0], 16);
		g = parseInt(h[1] + h[1], 16);
		b = parseInt(h[2] + h[2], 16);
	} else if (h.length === 6) {
		r = parseInt(h.substring(0, 2), 16);
		g = parseInt(h.substring(2, 4), 16);
		b = parseInt(h.substring(4, 6), 16);
	}

	r /= 255;
	g /= 255;
	b /= 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const l = (max + min) / 2;
	const d = max - min;
	let s = 0;
	if (d !== 0) {
		s = d / (1 - Math.abs(2 * l - 1));
	}
	let hue = 0;
	if (max !== min) {
		switch (max) {
			case r:
				hue = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				hue = (b - r) / d + 2;
				break;
			case b:
				hue = (r - g) / d + 4;
				break;
		}
		hue /= 6;
	}
	return { h: hue * 360, s: s * 100, l: l * 100 };
};

export type ColorPickerMode = "dynamic" | "eyedropper";

export const useColorCircle = () => {
	const [mode, setMode] = useState<ColorPickerMode>("dynamic");
	const [hexColor, setHexColor] = useState<string>("#000000");
	const hsl = useMemo(() => hexToHsl(hexColor), [hexColor]);

	return {
		mode,
		setMode,
		hexColor,
		setHexColor,
		hsl,
	};
};
