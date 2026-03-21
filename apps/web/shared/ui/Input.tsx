import type { InputHTMLAttributes } from "react";
import { cn } from "../lib/cn";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  variant?: "default" | "muted";
};

export function Input({ className, variant = "default", ...props }: Props) {
  return (
    <input
      className={cn(
        "augmented-ui aug-input",
        variant === "muted" ? "aug-input--muted" : "",
        "w-full px-4 py-3 rounded-sm text-sm",
        className,
      )}
      data-augmented-ui="tl-clip tr-clip br-clip bl-clip"
      {...props}
    />
  );
}
