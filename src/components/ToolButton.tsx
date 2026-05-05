import type { ReactNode } from "react";
import { Button } from "./Button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";

type ToolButtonProps = {
	children: ReactNode;
	disabled?: boolean;
	label: string;
	onClick?: () => void;
	pressed?: boolean;
};

export const ToolButton = ({
	children,
	disabled,
	label,
	onClick,
	pressed,
}: ToolButtonProps) => (
	<Tooltip>
		<TooltipTrigger asChild>
			<Button
				type="button"
				size="iconSm"
				variant={pressed ? "secondary" : "ghost"}
				onClick={onClick}
				disabled={disabled}
				aria-label={label}
				aria-pressed={pressed}
			>
				{children}
			</Button>
		</TooltipTrigger>
		<TooltipContent>{label}</TooltipContent>
	</Tooltip>
);
