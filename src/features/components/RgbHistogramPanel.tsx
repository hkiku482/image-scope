import { Info } from "lucide-react";
import { useState } from "react";
import { LineChart } from "../../components/LineChart";
import { FloatingCorner } from "../../components/layout/FloatingCorner";
import {
	FloatingPanel,
	FloatingPanelCloseButton,
} from "../../components/layout/FloatingPanel";
import { ResizableBox } from "../../components/layout/ResizableBox";
import { Text } from "../../components/Text";
import { ToolButton } from "../../components/ToolButton";
import type { ImageRgbHistogramState } from "../hooks/useImageRgbHistogram";

type RgbHistogramPanelProps = {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	state: ImageRgbHistogramState;
};

const HISTOGRAM_PANEL_ASPECT_RATIO = 1.5;
const HISTOGRAM_PANEL_MIN_WIDTH = 260;

export const RgbHistogramPanel = ({
	isOpen,
	onOpenChange,
	state,
}: RgbHistogramPanelProps) => {
	const { error, histogram, isLoading } = state;
	const [panelSize, setPanelSize] = useState({
		height: HISTOGRAM_PANEL_MIN_WIDTH / HISTOGRAM_PANEL_ASPECT_RATIO,
		width: HISTOGRAM_PANEL_MIN_WIDTH,
	});
	const chartHeight = Math.max(96, panelSize.height - 44);

	return (
		<FloatingCorner placement="top-right">
			{!isOpen && (
				<ToolButton
					className="bg-secondary/30 backdrop-blur-md hover:bg-secondary/50"
					label="Show RGB histogram"
					onClick={() => onOpenChange(true)}
					disabled={!histogram && !isLoading && !error}
					size="icon"
					variant="secondary"
				>
					<Info />
				</ToolButton>
			)}
			{isOpen && (
				<ResizableBox
					aspectRatio={HISTOGRAM_PANEL_ASPECT_RATIO}
					minWidth={HISTOGRAM_PANEL_MIN_WIDTH}
					onSizeChange={setPanelSize}
					size={panelSize}
				>
					<FloatingPanel className="h-full w-full overflow-hidden">
						<FloatingPanelCloseButton
							onClick={() => onOpenChange(false)}
							label="Close RGB histogram"
						/>
						<div className="mb-2 pr-8">
							<Text size="xs" variant="mono">
								RGB Histogram
							</Text>
						</div>
						{isLoading && (
							<Text as="div" size="xs" variant="muted">
								Loading color data...
							</Text>
						)}
						{error && !isLoading && (
							<Text as="div" size="xs" variant="muted">
								{error}
							</Text>
						)}
						{histogram && !isLoading && (
							<LineChart
								ariaLabel="RGB histogram"
								bottomPadding={8}
								className="-mx-3 -mb-3 w-[calc(100%+1.5rem)] rounded-b-lg rounded-t-none border-x-0 border-b-0"
								height={chartHeight}
								style={{ height: chartHeight }}
								width={panelSize.width}
								series={[
									{ color: "rgb(248 113 113)", values: histogram.red },
									{ color: "rgb(74 222 128)", values: histogram.green },
									{ color: "rgb(96 165 250)", values: histogram.blue },
								]}
							/>
						)}
					</FloatingPanel>
				</ResizableBox>
			)}
		</FloatingCorner>
	);
};
