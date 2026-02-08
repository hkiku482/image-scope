import {
	createContext,
	type MouseEvent,
	type ReactNode,
	useContext,
} from "react";
import { useCanvas } from "../hooks/useCanvas";
import { type ColorPickerMode, useColorCircle } from "../hooks/useColorCircle";

type CanvasContext = {
	src: string | null;
	scale: number;
	offset: { x: number; y: number };
	hexColor: string;
	hsl: { h: number; s: number; l: number };
	mode: ColorPickerMode;
	setSrc: (src: string | null) => void;
	handleWheel: (e: WheelEvent) => void;
	handleDoubleClick: () => void;
	handleMouseDown: (e: MouseEvent) => void;
	handleMouseMove: (e: MouseEvent) => void;
	handleMouseUp: (e: MouseEvent) => void;
	setHexColor: (hexColor: string) => void;
	setMode: (mode: ColorPickerMode) => void;
};
const CanvasContext = createContext<CanvasContext | undefined>(undefined);

export type CanvasProviderProps = {
	children: ReactNode;
};
export const CanvasProvider = ({ children }: CanvasProviderProps) => {
	const useCanvasValues = useCanvas();
	const useColorCircleValues = useColorCircle();
	return (
		<CanvasContext.Provider
			value={{ ...useCanvasValues, ...useColorCircleValues }}
		>
			{children}
		</CanvasContext.Provider>
	);
};

export const useCanvasContext = () => {
	const context = useContext(CanvasContext);
	if (!context) {
		throw new Error("useCanvas must be used within a CanvasProvider");
	}
	return context;
};
