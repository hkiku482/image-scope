import {
	ChevronLeft,
	ChevronRight,
	PanelLeftClose,
	PanelLeftOpen,
	RefreshCw,
} from "lucide-react";
import { Badge } from "../../components/Badge";
import { Input } from "../../components/Input";
import { Separator } from "../../components/Separator";
import { ToolButton } from "../../components/ToolButton";

type TopBarProps = {
	currentPath: string;
	imageCount: number;
	isLoading: boolean;
	isSidebarOpen: boolean;
	onNext: () => void;
	onPrevious: () => void;
	onReload: () => void;
	onToggleSidebar: () => void;
	selectedIndex: number;
};

export const TopBar = ({
	currentPath,
	imageCount,
	isLoading,
	isSidebarOpen,
	onNext,
	onPrevious,
	onReload,
	onToggleSidebar,
	selectedIndex,
}: TopBarProps) => (
	<header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-card px-3">
		<ToolButton
			label={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
			onClick={onToggleSidebar}
			pressed={isSidebarOpen}
		>
			{isSidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
		</ToolButton>
		<Separator orientation="vertical" className="h-6" />
		<ToolButton
			label="Previous image"
			onClick={onPrevious}
			disabled={!imageCount}
		>
			<ChevronLeft />
		</ToolButton>
		<ToolButton label="Next image" onClick={onNext} disabled={!imageCount}>
			<ChevronRight />
		</ToolButton>
		<ToolButton
			label="Reload current path"
			onClick={onReload}
			disabled={!currentPath}
		>
			<RefreshCw className={isLoading ? "animate-spin" : ""} />
		</ToolButton>
		<Input
			readOnly
			value={currentPath}
			placeholder="Drop an image or folder into the viewer"
			className="min-w-0 flex-1 border-border bg-background/80 font-mono text-xs"
		/>
		<Badge className="min-w-20 justify-center">
			{imageCount ? `${selectedIndex + 1} / ${imageCount}` : "0 / 0"}
		</Badge>
	</header>
);
