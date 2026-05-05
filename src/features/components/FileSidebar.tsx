import { ArrowUp, FileImage, Folder } from "lucide-react";
import { Button } from "../../components/Button";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "../../components/ContextMenu";
import { ListItemButton } from "../../components/ListItemButton";
import {
	SidebarPanel,
	SidebarPanelContent,
	SidebarPanelHeader,
} from "../../components/layout/SidebarPanel";
import { ScrollArea } from "../../components/ScrollArea";
import { Text } from "../../components/Text";
import { fileNameOf, type PathItem } from "../../lib/tauri-api";

type FileSidebarProps = {
	items: PathItem[];
	onOpenDirectory: (path: string) => void;
	onOpenParent: () => void;
	onSelectImage: (path: string) => void;
	selectedPath: string | null;
};

export const FileSidebar = ({
	items,
	onOpenDirectory,
	onOpenParent,
	onSelectImage,
	selectedPath,
}: FileSidebarProps) => (
	<SidebarPanel>
		<SidebarPanelHeader>
			<Text className="font-semibold uppercase" size="xs" variant="muted">
				Items
			</Text>
			<Text size="xs" variant="muted">
				{items.length}
			</Text>
		</SidebarPanelHeader>
		<ScrollArea className="min-h-0 flex-1">
			<SidebarPanelContent>
				<Button
					type="button"
					variant="ghost"
					className="h-8 w-full justify-start px-2 text-muted-foreground"
					onClick={onOpenParent}
				>
					<ArrowUp />
					..
				</Button>
				{items.map((item) => {
					const name = fileNameOf(item.path);
					const isSelected = item.path === selectedPath;
					const Icon = item.is_directory ? Folder : FileImage;
					const onOpen = () =>
						item.is_directory
							? onOpenDirectory(item.path)
							: onSelectImage(item.path);

					return (
						<ContextMenu key={item.path}>
							<ContextMenuTrigger asChild>
								<ListItemButton
									title={name}
									onClick={onOpen}
									icon={Icon}
									selected={isSelected}
								>
									{name}
								</ListItemButton>
							</ContextMenuTrigger>
							<ContextMenuContent>
								<ContextMenuItem onSelect={onOpen}>
									Open {item.is_directory ? "folder" : "image"}
								</ContextMenuItem>
							</ContextMenuContent>
						</ContextMenu>
					);
				})}
			</SidebarPanelContent>
		</ScrollArea>
	</SidebarPanel>
);
