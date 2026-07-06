"use client";

import { useLayoutEffect, useRef } from "react";

const ScrollToTop = () => {
  const didInitRef = useRef(false);

  useLayoutEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
    };

    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  return null;
};

export default ScrollToTop;
