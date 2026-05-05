import type * as React from "react";
import { cn } from "../lib/utils";

type TextElement = "span" | "div" | "p";

export type TextProps<TElement extends TextElement = "span"> =
	React.ComponentPropsWithoutRef<TElement> & {
		as?: TElement;
		size?: "xs" | "sm" | "base";
		truncate?: boolean;
		variant?: "default" | "muted" | "mono" | "sidebar";
	};

const sizeClass = {
	xs: "text-xs",
	sm: "text-sm",
	base: "text-base",
} satisfies Record<NonNullable<TextProps["size"]>, string>;

const variantClass = {
	default: "text-foreground",
	muted: "text-muted-foreground",
	mono: "font-mono",
	sidebar: "text-sidebar-foreground",
} satisfies Record<NonNullable<TextProps["variant"]>, string>;

export const Text = <TElement extends TextElement = "span">({
	as,
	className,
	size = "sm",
	truncate,
	variant = "default",
	...props
}: TextProps<TElement>) => {
	const Comp = as ?? "span";
	return (
		<Comp
			className={cn(
				sizeClass[size],
				variantClass[variant],
				truncate && "min-w-0 truncate",
				className,
			)}
			{...props}
		/>
	);
};
