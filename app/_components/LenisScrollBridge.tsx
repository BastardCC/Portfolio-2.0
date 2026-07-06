"use client";

import { useLenis } from "lenis/react";
import { useEffect } from "react";
import { notifyScrollFrame, syncScrollPosition } from "./scroll-frame";

const LenisScrollBridge = () => {
  const lenis = useLenis();

  useLenis((instance) => {
    syncScrollPosition(instance.scroll);
    notifyScrollFrame();
  });

  useEffect(() => {
    if (!lenis) return;

    const onNativeScroll = () => {
      if (!lenis.isStopped) return;

      syncScrollPosition(window.scrollY);
      notifyScrollFrame();
    };

    window.addEventListener("scroll", onNativeScroll, { passive: true });

    return () => window.removeEventListener("scroll", onNativeScroll);
  }, [lenis]);

  return null;
};

export default LenisScrollBridge;
