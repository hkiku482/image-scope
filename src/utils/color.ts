import type { RGBColor } from "../types/color";

const rgbToHex = (r: number, g: number, b: number): string => {
	return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
};

export const getPixelColor = (
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
): RGBColor | null => {
	try {
		const pixel = ctx.getImageData(x, y, 1, 1).data;
		if (pixel[3] === 0) {
			return null;
		}
		const r = pixel[0];
		const g = pixel[1];
		const b = pixel[2];
		const hex = rgbToHex(r, g, b);
		return { r, g, b, hex };
	} catch {
		return null;
	}
};
