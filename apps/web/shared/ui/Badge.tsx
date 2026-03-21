import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

type Props = HTMLAttributes<HTMLSpanElement> & {
  tone?: "cyan" | "pink" | "muted" | "warning";
};

const toneClass = {
  cyan: "text-brand-cyan border-brand-cyan/50",
  pink: "text-brand-pink border-brand-pink/50",
  muted: "text-text-muted border-meta-border",
  warning: "text-amber-300 border-amber-300/50",
};

export function Badge({ className, tone = "muted", ...props }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 text-xs uppercase tracking-wider border rounded-sm",
        toneClass[tone],
        className,
      )}
      {...props}
    />
  );
}
