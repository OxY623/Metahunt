import type { ButtonHTMLAttributes } from "react";
import { cn } from "../lib/cn";

type Variant = "cyan" | "pink" | "neutral" | "warning";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
};

const variantClass: Record<Variant, string> = {
  cyan: "aug-btn aug-btn--cyan",
  pink: "aug-btn aug-btn--pink",
  neutral: "aug-btn aug-btn--neutral",
  warning: "aug-btn aug-btn--warning",
};

const sizeClass = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-3 text-sm",
  lg: "px-5 py-3 text-sm md:text-base",
};

export function Button({
  className,
  variant = "neutral",
  size = "md",
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        "augmented-ui cyber-btn",
        variantClass[variant],
        sizeClass[size],
        "rounded-sm transition hover:shadow-[0_0_12px_rgba(0,240,255,0.2)] disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      )}
      data-augmented-ui="tl-clip tr-clip bl-clip br-clip"
      {...props}
    />
  );
}
