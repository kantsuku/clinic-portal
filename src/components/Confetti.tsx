"use client";

import { useEffect, useState } from "react";

const COLORS = ["#1a73e8", "#1e8e3e", "#e37400", "#d93025", "#7b1fa2", "#00897b"];

interface ConfettiProps {
  trigger: boolean;
}

export default function Confetti({ trigger }: ConfettiProps) {
  const [pieces, setPieces] = useState<{ id: number; left: number; color: string; delay: number; size: number }[]>([]);

  useEffect(() => {
    if (!trigger) return;
    const newPieces = Array.from({ length: 40 }, (_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.8,
      size: 6 + Math.random() * 8,
    }));
    setPieces(newPieces);
    const timer = setTimeout(() => setPieces([]), 3000);
    return () => clearTimeout(timer);
  }, [trigger]);

  if (pieces.length === 0) return null;

  return (
    <>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </>
  );
}
