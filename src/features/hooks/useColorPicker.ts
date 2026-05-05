import { useCallback, useMemo, useState } from "react";
import type { RGBColor } from "../../types/color";

export type ColorPickerMode = "dynamic" | "eyedropper";

const hexToHsl = (hex: string) => {
	const normalized = hex.replace("#", "");
	const r = parseInt(normalized.slice(0, 2), 16) / 255;
	const g = parseInt(normalized.slice(2, 4), 16) / 255;
	const b = parseInt(normalized.slice(4, 6), 16) / 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const delta = max - min;
	const l = (max + min) / 2;
	const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
	let h = 0;

	if (delta !== 0) {
		if (max === r) h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
		if (max === g) h = ((b - r) / delta + 2) / 6;
		if (max === b) h = ((r - g) / delta + 4) / 6;
	}

	return { h: h * 360, s: s * 100, l: l * 100 };
};

export const useColorPicker = () => {
	const [mode, setMode] = useState<ColorPickerMode>("dynamic");
	const [pickedColor, setPickedColor] = useState<RGBColor | null>(null);
	const [hoverColor, setHoverColor] = useState<RGBColor | null>(null);
	const [lastColor, setLastColor] = useState<RGBColor | null>(null);
	const [isInspectorOpen, setIsInspectorOpen] = useState(false);

	const updatePickedColor = useCallback((color: RGBColor | null) => {
		setPickedColor(color);
		if (color) setLastColor(color);
	}, []);

	const updateHoverColor = useCallback((color: RGBColor | null) => {
		setHoverColor(color);
		if (color) setLastColor(color);
	}, []);

	const activeColor =
		hoverColor && mode === "dynamic" ? hoverColor : (pickedColor ?? lastColor);
	const hsl = useMemo(
		() => hexToHsl(activeColor?.hex ?? "#000000"),
		[activeColor],
	);

	return {
		activeColor,
		hoverColor,
		hsl,
		isInspectorOpen,
		mode,
		pickedColor,
		setHoverColor: updateHoverColor,
		setIsInspectorOpen,
		setMode,
		setPickedColor: updatePickedColor,
	};
};

export type ColorPickerState = ReturnType<typeof useColorPicker>;
