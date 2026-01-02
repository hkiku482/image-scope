import {
	createContext,
	type MouseEvent,
	type ReactNode,
	useContext,
} from "react";
import { useCanvas } from "../hooks/useCanvas";

type CanvasContext = {
	src: string | null;
	scale: number;
	offset: { x: number; y: number };
	isDragging: boolean;
	setSrc: (src: string | null) => void;
	handleWheel: (e: WheelEvent) => void;
	handleDoubleClick: () => void;
	handleMouseDown: (e: MouseEvent) => void;
	handleMouseMove: (e: MouseEvent) => void;
	handleMouseUp: (e: MouseEvent) => void;
};
const CanvasContext = createContext<CanvasContext | undefined>(undefined);

export type CanvasProviderProps = {
	children: ReactNode;
};
export const CanvasProvider = ({ children }: CanvasProviderProps) => {
	const useCanvasValues = useCanvas();
	return (
		<CanvasContext.Provider value={{ ...useCanvasValues }}>
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
