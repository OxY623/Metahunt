import Image from "next/image";
import type { Archetype } from "../../../lib/api";
import { ARCHETYPE_IMAGES } from "../lib/archetypes";
import { cn } from "../../../shared/lib/cn";

type Props = {
  archetype?: Archetype | null;
  size?: number;
  className?: string;
  alt?: string;
};

export function UserAvatar({ archetype, size = 72, className, alt }: Props) {
  const src = archetype ? ARCHETYPE_IMAGES[archetype] : "/users/FOXY.png";
  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden border border-brand-cyan/40 shadow-[0_0_16px_rgba(0,240,255,0.25)]",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt ?? "User archetype"}
        fill
        className="object-cover"
      />
    </div>
  );
}
