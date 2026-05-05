import { Kbd } from "../../components/Kbd";
import { InlineField } from "../../components/layout/InlineField";
import { MetricBadge } from "../../components/MetricBadge";
import { Switch } from "../../components/Switch";
import { Text } from "../../components/Text";
import { formatResolution, formatZoom } from "../lib/format";

type StatusBarProps = {
	error: string | null;
	imageName: string | null;
	imageResolution: { width: number; height: number } | null;
	isDynamicColor: boolean;
	isGrayscale: boolean;
	onDynamicColorChange: (enabled: boolean) => void;
	onGrayscaleChange: (enabled: boolean) => void;
	scale: number;
};

export const StatusBar = ({
	error,
	imageName,
	imageResolution,
	isDynamicColor,
	isGrayscale,
	onDynamicColorChange,
	onGrayscaleChange,
	scale,
}: StatusBarProps) => (
	<footer className="flex h-8 shrink-0 items-center gap-2 border-t border-border bg-card px-3 text-xs text-muted-foreground">
		<Text className="flex-1" size="xs" truncate variant="muted">
			{error ?? imageName ?? "No image selected"}
		</Text>
		<InlineField>
			<Kbd>G</Kbd>
			<Text size="xs" variant="muted">
				Gray Scale
			</Text>
			<Switch
				checked={isGrayscale}
				onCheckedChange={onGrayscaleChange}
				aria-label="Toggle grayscale"
			/>
		</InlineField>
		<InlineField>
			<Kbd>D</Kbd>
			<Text size="xs" variant="muted">
				Dynamic
			</Text>
			<Switch
				checked={isDynamicColor}
				onCheckedChange={onDynamicColorChange}
				aria-label="Toggle dynamic color mode"
			/>
		</InlineField>
		{imageResolution && (
			<MetricBadge widthCh={13}>
				{formatResolution(imageResolution)}
			</MetricBadge>
		)}
		<MetricBadge widthCh={7}>{formatZoom(scale)}</MetricBadge>
	</footer>
);
