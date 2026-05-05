import { Palette } from "lucide-react";
import { Button } from "../../components/Button";
import { FloatingCorner } from "../../components/layout/FloatingCorner";
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
				<Button
					type="button"
					variant="secondary"
					size="icon"
					onClick={() => onOpenChange(true)}
					aria-label="Show color inspector"
				>
					<Palette />
				</Button>
			)}
		</FloatingCorner>
	);
};
