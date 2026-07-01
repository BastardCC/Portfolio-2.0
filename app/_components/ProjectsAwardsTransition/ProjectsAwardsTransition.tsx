"use client";

import { useEffect, useRef, useState } from "react";
import { useSetTransitionReady } from "./TransitionProvider";
import TransitionCurtains from "./TransitionCurtains";
import {
  CURTAIN_COUNT,
  getCurtainLift,
  measureTransitionProgress,
} from "./transition-math";
import "./projects-awards-transition.css";

const ProjectsAwardsTransition = () => {
  const zoneRef = useRef<HTMLDivElement>(null);
  const setTransitionReady = useSetTransitionReady();
  const rafRef = useRef<number | null>(null);

  const [lifts, setLifts] = useState<number[]>(() =>
    Array.from({ length: CURTAIN_COUNT }, () => 1),
  );
  const [active, setActive] = useState(false);

  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone) return;

    const update = () => {
      const viewportHeight = window.innerHeight;
      const rect = zone.getBoundingClientRect();
      const zoneVisible = rect.bottom > 0 && rect.top < viewportHeight;
      const pinned = rect.top <= 0;
      const progress = measureTransitionProgress(
        rect.top,
        zone.offsetHeight,
        viewportHeight,
      );
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reducedMotion) {
        if (zoneVisible) {
          setTransitionReady(true);
          setActive(false);
        }
        return;
      }

      const nextLifts = Array.from({ length: CURTAIN_COUNT }, (_, bottomIndex) =>
        getCurtainLift(progress, bottomIndex),
      );

      setLifts(nextLifts);
      setActive(zoneVisible && pinned);

      if (progress >= 1) {
        setTransitionReady(true);
      }
    };

    const tick = () => {
      update();
      rafRef.current = requestAnimationFrame(tick);
    };

    update();
    rafRef.current = requestAnimationFrame(tick);

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [setTransitionReady]);

  return (
    <div ref={zoneRef} className="transition-zone">
      <div className="transition-sticky">
        <TransitionCurtains lifts={lifts} visible={active} />
      </div>
    </div>
  );
};

export default ProjectsAwardsTransition;
