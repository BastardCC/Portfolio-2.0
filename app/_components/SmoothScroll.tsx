"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";
import "lenis/dist/lenis.css";
import LenisReducedMotion from "./LenisReducedMotion";
import LenisScrollBridge from "./LenisScrollBridge";

const lenisEasing = (time: number) =>
  Math.min(1, 1.001 - 2 ** (-10 * time));

/**
 * Lissage léger — assez pour sentir la fluidité,
 * pas assez pour se battre avec pin / rideaux / Awards.
 */
const LENIS_OPTIONS = {
  autoRaf: true,
  duration: 1.15,
  easing: lenisEasing,
  smoothWheel: true,
  wheelMultiplier: 0.72,
  touchMultiplier: 0.85,
  syncTouch: false,
};

type SmoothScrollProps = {
  children: ReactNode;
};

const SmoothScroll = ({ children }: SmoothScrollProps) => {
  return (
    <ReactLenis root options={LENIS_OPTIONS}>
      <LenisScrollBridge />
      <LenisReducedMotion />
      {children}
    </ReactLenis>
  );
};

export default SmoothScroll;
