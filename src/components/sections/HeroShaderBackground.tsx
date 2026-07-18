'use client';

import { MeshGradient } from '@paper-design/shaders-react';

// Brand colors only (see src/design/tokens.ts) — Matte Black/Midnight Navy as
// the base with Aqua/Electric Blue accents, never the shader library's demo
// palette. speed=0 fully stops the shader's rAF loop (per @paper-design/shaders
// docs) rather than just freezing on a frame, so reduced-motion costs nothing.
export default function HeroShaderBackground({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <MeshGradient
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      colors={['#0A0A0A', '#1A1A1A', '#38E8E8', '#0F6FB8']}
      distortion={0.6}
      swirl={0.3}
      speed={reducedMotion ? 0 : 0.3}
    />
  );
}
