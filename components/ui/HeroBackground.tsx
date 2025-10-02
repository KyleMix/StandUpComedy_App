import type { ReactElement } from "react";

export function HeroBackground({ pattern = "topography" }: { pattern?: "topography" | "circuit" | "jigsaw" }) {
  const patternDefs: Record<string, ReactElement> = {
    topography: (
      <pattern id="topography" width="200" height="200" patternUnits="userSpaceOnUse">
        <path
          d="M0 100c40-60 120-60 160 0s120 60 160 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="24"
          strokeLinecap="round"
          opacity="0.35"
        />
      </pattern>
    ),
    circuit: (
      <pattern id="circuit" width="120" height="120" patternUnits="userSpaceOnUse">
        <path d="M0 60h40v-40h40v40h40v40h-40v40h-40v-40h-40z" fill="none" stroke="currentColor" strokeWidth="10" opacity="0.25" />
      </pattern>
    ),
    jigsaw: (
      <pattern id="jigsaw" width="160" height="160" patternUnits="userSpaceOnUse">
        <path d="M0 40c40 0 40-40 80-40s40 40 80 40v80c-40 0-40 40-80 40s-40-40-80-40z" fill="currentColor" opacity="0.08" />
      </pattern>
    )
  };

  const selectedPattern = patternDefs[pattern] ?? patternDefs.topography;

  return (
    <div aria-hidden className="absolute inset-0 -z-10">
      <svg className="h-full w-full text-brand" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          {selectedPattern}
        </defs>
        <rect width="100%" height="100%" fill={`url(#${pattern})`} />
        <image href="/assets/bg/wave-01.svg" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" opacity="0.65" />
      </svg>
    </div>
  );
}
