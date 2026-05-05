import type { ReactNode } from "react";
import { Button, type ButtonProps } from "./Button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";

type ToolButtonProps = {
	children: ReactNode;
	className?: ButtonProps["className"];
	disabled?: boolean;
	label: string;
	onClick?: () => void;
	pressed?: boolean;
	size?: ButtonProps["size"];
	variant?: ButtonProps["variant"];
};

export const ToolButton = ({
	children,
	className,
	disabled,
	label,
	onClick,
	pressed,
	size = "iconSm",
	variant = "ghost",
}: ToolButtonProps) => (
	<Tooltip>
		<TooltipTrigger asChild>
			<Button
				type="button"
				size={size}
				variant={pressed ? "secondary" : variant}
				className={className}
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
