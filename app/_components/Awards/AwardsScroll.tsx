"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import AwardList, { type Award } from "./AwardList";
import "./awards.css";

type AwardsScrollProps = {
  awards: Award[];
};

const LINE_LERP = 0.1;

const easeOutQuint = (value: number) => 1 - (1 - value) ** 5;

const getLineTarget = (scrollProgress: number, index: number, count: number) => {
  const spread = 1 / count;
  const start = index * spread * 0.7;
  const duration = spread * 1.45;
  const raw = (scrollProgress - start) / duration;
  const clamped = Math.max(0, Math.min(1, raw));

  return easeOutQuint(clamped);
};

const AwardsScroll = ({ awards }: AwardsScrollProps) => {
  const zoneRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef(0);
  const targetRef = useRef<number[]>(awards.map(() => 0));
  const currentRef = useRef<number[]>(awards.map(() => 0));
  const linesLockedRef = useRef(false);
  const contentShownRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const [lineProgress, setLineProgress] = useState<number[]>(() =>
    awards.map(() => 0),
  );
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone) return;

    const measureScrollProgress = () => {
      const viewportHeight = window.innerHeight;
      const zoneHeight = zone.offsetHeight;
      const scrollable = zoneHeight - viewportHeight;
      const rect = zone.getBoundingClientRect();

      if (scrollable <= 0) return 1;

      const scrolled = Math.min(Math.max(-rect.top, 0), scrollable);
      return scrolled / scrollable;
    };

    const updateTargets = () => {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reducedMotion) {
        const rect = zone.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          scrollProgressRef.current = 1;
          targetRef.current = awards.map(() => 1);
          linesLockedRef.current = true;
          contentShownRef.current = true;
        }
        return;
      }

      if (linesLockedRef.current) {
        targetRef.current = awards.map(() => 1);
        return;
      }

      scrollProgressRef.current = measureScrollProgress();

      targetRef.current = awards.map((_, index) =>
        getLineTarget(scrollProgressRef.current, index, awards.length),
      );

      if (
        scrollProgressRef.current >= 0.999 ||
        targetRef.current.every((value) => value >= 0.998)
      ) {
        targetRef.current = awards.map(() => 1);
        linesLockedRef.current = true;
        contentShownRef.current = true;
      }
    };

    const tick = () => {
      if (linesLockedRef.current) {
        currentRef.current = awards.map(() => 1);
        setLineProgress(awards.map(() => 1));
        setContentVisible(true);
        return;
      }

      const current = currentRef.current;
      const target = targetRef.current;
      let settled = true;

      for (let index = 0; index < awards.length; index += 1) {
        const next = current[index] + (target[index] - current[index]) * LINE_LERP;

        if (Math.abs(next - target[index]) > 0.001) {
          settled = false;
        }

        current[index] = next;
      }

      setLineProgress([...current]);

      if (
        settled &&
        target.every((value) => value >= 0.998) &&
        current.every((value) => value >= 0.998)
      ) {
        linesLockedRef.current = true;
        contentShownRef.current = true;
        currentRef.current = awards.map(() => 1);
        setLineProgress(awards.map(() => 1));
        setContentVisible(true);
        return;
      }

      if (contentShownRef.current) {
        setContentVisible(true);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    updateTargets();
    rafRef.current = requestAnimationFrame(tick);

    const onScroll = () => updateTargets();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateTargets);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateTargets);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [awards]);

  return (
    <div
      ref={zoneRef}
      className="awards__scroll-zone"
      style={{ "--award-count": awards.length } as CSSProperties}
    >
      <div className="awards__sticky">
        <div className="container">
          <div className="awards__layout">
            <div className="awards__panel awards__panel--emblem">
              <div className="awards__emblem" aria-hidden />
            </div>
            <div className="awards__panel awards__panel--list">
              <AwardList
                awards={awards}
                lineProgress={lineProgress}
                contentVisible={contentVisible}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AwardsScroll;
