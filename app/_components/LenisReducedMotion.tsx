"use client";

import { useLenis } from "lenis/react";
import { useEffect } from "react";

const LenisReducedMotion = () => {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      if (mediaQuery.matches) {
        lenis.stop();
        return;
      }

      lenis.start();
    };

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, [lenis]);

  return null;
};

export default LenisReducedMotion;
