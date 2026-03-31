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
  sm: "px-3 py-2 text-[11px]",
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
        "cyber-btn",
        variantClass[variant],
        sizeClass[size],
        "rounded-lg transition hover:shadow-[0_0_16px_rgba(0,240,255,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/40 disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      )}
      
      {...props}
    />
  );
}


