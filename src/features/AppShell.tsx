import { useEffect, useState } from "react";
import { AppBody, AppFrame } from "../components/layout/AppFrame";
import { TooltipProvider } from "../components/Tooltip";
import { FileSidebar } from "./components/FileSidebar";
import { ImageViewport } from "./components/ImageViewport";
import { StatusBar } from "./components/StatusBar";
import { TopBar } from "./components/TopBar";
import { useColorPicker } from "./hooks/useColorPicker";
import { useImageRgbHistogram } from "./hooks/useImageRgbHistogram";
import { useImageViewer } from "./hooks/useImageViewer";

export const AppShell = () => {
	const viewer = useImageViewer();
	const colorPicker = useColorPicker();
	const histogramState = useImageRgbHistogram(viewer.selectedPath);
	const [isGrayscale, setIsGrayscale] = useState(false);
	const [scale, setScale] = useState(1);
	const [resolution, setResolution] = useState<{
		width: number;
		height: number;
	} | null>(null);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (
				document.activeElement instanceof HTMLInputElement ||
				document.activeElement instanceof HTMLTextAreaElement
			) {
				return;
			}

			if (event.key.toLowerCase() === "g") {
				event.preventDefault();
				setIsGrayscale((current) => !current);
			}

			if (event.key.toLowerCase() === "d") {
				event.preventDefault();
				colorPicker.setMode(
					colorPicker.mode === "dynamic" ? "eyedropper" : "dynamic",
				);
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [colorPicker]);

	return (
		<TooltipProvider delayDuration={250}>
			<AppFrame>
				<TopBar
					currentPath={viewer.currentPath}
					imageCount={viewer.imagePaths.length}
					isSidebarOpen={viewer.isSidebarOpen}
					onNext={viewer.nextImage}
					onPathSubmit={viewer.openPath}
					onPrevious={viewer.previousImage}
					onToggleSidebar={() => viewer.setIsSidebarOpen(!viewer.isSidebarOpen)}
					selectedIndex={viewer.selectedIndex}
				/>
				<AppBody>
					{viewer.isSidebarOpen && (
						<FileSidebar
							items={viewer.items}
							onOpenDirectory={viewer.openPath}
							onOpenParent={viewer.openParent}
							onSelectImage={viewer.selectImage}
							selectedPath={viewer.selectedPath}
						/>
					)}
					<ImageViewport
						colorPicker={colorPicker}
						histogramState={histogramState}
						isGrayscale={isGrayscale}
						imageDataUrl={viewer.imageDataUrl}
						onResolutionChange={setResolution}
						onScaleChange={setScale}
					/>
				</AppBody>
				<StatusBar
					error={viewer.error}
					imageName={viewer.selectedName}
					imageResolution={resolution}
					isDynamicColor={colorPicker.mode === "dynamic"}
					isGrayscale={isGrayscale}
					onDynamicColorChange={(enabled) =>
						colorPicker.setMode(enabled ? "dynamic" : "eyedropper")
					}
					onGrayscaleChange={setIsGrayscale}
					scale={scale}
				/>
			</AppFrame>
		</TooltipProvider>
	);
};
