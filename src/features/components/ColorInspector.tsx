import { Palette } from "lucide-react";
import { FloatingCorner } from "../../components/layout/FloatingCorner";
import { ToolButton } from "../../components/ToolButton";
import type { RGBColor } from "../../types/color";
import { ColorWheel } from "./ColorWheel";

type ColorInspectorProps = {
	color: RGBColor | null;
	hsl: { h: number; s: number; l: number };
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
};

export const ColorInspector = ({
	color,
	hsl,
	isOpen,
	onOpenChange,
}: ColorInspectorProps) => {
	if (!color) {
		return null;
	}

	return (
		<FloatingCorner>
			{isOpen ? (
				<ColorWheel
					color={color.hex}
					hsl={hsl}
					onClose={() => onOpenChange(false)}
				/>
			) : (
				<ToolButton
					className="bg-secondary/30 backdrop-blur-md hover:bg-secondary/50"
					label="Show color inspector"
					onClick={() => onOpenChange(true)}
					size="icon"
					variant="secondary"
				>
					<Palette />
				</ToolButton>
			)}
		</FloatingCorner>
	);
};
