import React from "react";
import clsx from "../../../packages/ui/helpers/clsx";


type Variant = "primary" | "secondary" | "danger";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  loading = false,
  className,
  children,
  ...props
}: ButtonProps) {

  const base =
    "relative inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold tracking-wide transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed";

  const variants: Record<Variant, string> = {
    primary:
      "bg-[var(--meta-gradient)] text-white hover:shadow-[var(--shadow-cyan)]",

    secondary:
      "bg-meta-surface border border-meta-border text-text-primary hover:border-brand-cyan",

    danger:
      "bg-danger text-white hover:shadow-[0_0_12px_rgba(239,68,68,0.6)]",
  };

  return (
    <button
      className={clsx(base, variants[variant], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="absolute w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
      <span className={clsx(loading && "opacity-0")}>{children}</span>
    </button>
  );
}