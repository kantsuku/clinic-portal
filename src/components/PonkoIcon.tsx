"use client";

import Image from "next/image";

interface PonkoIconProps {
  size?: number;
  className?: string;
  jump?: boolean;
  alt?: string;
}

export default function PonkoIcon({
  size = 20,
  className = "",
  jump = false,
  alt = "ぽん子",
}: PonkoIconProps) {
  return (
    <Image
      src="/ponko.png"
      alt={alt}
      width={size}
      height={size}
      className={`${jump ? "ponko-jump" : ""} ${className}`}
      priority={size >= 40}
    />
  );
}
