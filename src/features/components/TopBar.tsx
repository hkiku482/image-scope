import {
	ChevronLeft,
	ChevronRight,
	PanelLeftClose,
	PanelLeftOpen,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../../components/Badge";
import { Input } from "../../components/Input";
import { Separator } from "../../components/Separator";
import { ToolButton } from "../../components/ToolButton";

type TopBarProps = {
	currentPath: string;
	imageCount: number;
	isSidebarOpen: boolean;
	onNext: () => void;
	onPathSubmit: (path: string) => void;
	onPrevious: () => void;
	onToggleSidebar: () => void;
	selectedIndex: number;
};

export const TopBar = ({
	currentPath,
	imageCount,
	isSidebarOpen,
	onNext,
	onPathSubmit,
	onPrevious,
	onToggleSidebar,
	selectedIndex,
}: TopBarProps) => {
	const [pathDraft, setPathDraft] = useState(currentPath);

	useEffect(() => {
		setPathDraft(currentPath);
	}, [currentPath]);

	const submitPath = () => {
		const path = pathDraft.trim();
		if (path && path !== currentPath) {
			onPathSubmit(path);
		}
	};

	return (
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
			<form
				className="min-w-0 flex-1"
				onSubmit={(event) => {
					event.preventDefault();
					submitPath();
				}}
			>
				<Input
					value={pathDraft}
					onBlur={submitPath}
					onChange={(event) => setPathDraft(event.target.value)}
					placeholder="Drop an image or folder into the viewer"
					className="min-w-0 border-border bg-background/80 font-mono text-xs"
				/>
			</form>
			<Badge className="min-w-20 justify-center">
				{imageCount ? `${selectedIndex + 1} / ${imageCount}` : "0 / 0"}
			</Badge>
		</header>
	);
};
