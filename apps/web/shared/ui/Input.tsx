import type { InputHTMLAttributes } from "react";
import { cn } from "../lib/cn";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  variant?: "default" | "muted";
};

export function Input({ className, variant = "default", ...props }: Props) {
  return (
    <input
      className={cn(
        "aug-input",
        variant === "muted" ? "aug-input--muted" : "",
        "w-full px-4 py-3 rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/30",
        className,
      )}
      
      {...props}
    />
  );
}


