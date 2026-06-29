"use client";

import { useLayoutEffect } from "react";

const scrollToTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
};

const ScrollToTop = () => {
  useLayoutEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    scrollToTop();

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        scrollToTop();
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
