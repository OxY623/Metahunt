"use client";

import { useEffect, useState } from "react";

export default function MetaHuntLogo() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <svg
        width="220"
        height="200"
        viewBox="0 0 200 180"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="metaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#00F0FF" />
          </linearGradient>
        </defs>

        {/* M Shape */}
        <path
          d="M20 150 L60 40 L100 100 L140 40 L180 150"
          fill="none"
          stroke="url(#metaGradient)"
          strokeWidth="14"
          strokeLinecap="round"
          className={`transition-all duration-1000 ${
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`}
        />

        {/* Crosshair */}
        <g
          className={`transition-all duration-1500 ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
        >
          <circle
            cx="100"
            cy="95"
            r="18"
            stroke="#00F0FF"
            strokeWidth="2"
            fill="none"
            className="animate-pulse"
          />
          <line
            x1="100"
            y1="70"
            x2="100"
            y2="120"
            stroke="#8B5CF6"
            strokeWidth="2"
          />
          <line
            x1="75"
            y1="95"
            x2="125"
            y2="95"
            stroke="#8B5CF6"
            strokeWidth="2"
          />
        </g>
      </svg>

      {/* Title */}
      <h1
        className={`mt-6 text-3xl font-bold tracking-wide bg-meta-gradient bg-clip-text text-transparent transition-all duration-1000 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        MetaHunt
      </h1>
    </div>
  );
}
