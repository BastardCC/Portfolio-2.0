"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import AwardList, { type Award } from "./AwardList";
import AwardTrophy from "./AwardTrophy";
import "./awards.css";

type AwardsScrollProps = {
  awards: Award[];
  description: string;
};

const LINE_LERP = 0.1;
const CONTENT_VISIBLE_THRESHOLD = 0.92;

const easeOutQuint = (value: number) => 1 - (1 - value) ** 5;

const parseCssLength = (value: string, viewportHeight: number) => {
  const trimmed = value.trim();

  if (!trimmed) return 0;
  if (trimmed.endsWith("vh")) {
    return (parseFloat(trimmed) / 100) * viewportHeight;
  }
  if (trimmed.endsWith("px")) {
    return parseFloat(trimmed);
  }

  return 0;
};

const getLineTarget = (scrollProgress: number, index: number, count: number) => {
  const spread = 1 / count;
  const start = index * spread * 0.7;
  const duration = spread * 1.45;
  const raw = (scrollProgress - start) / duration;
  const clamped = Math.max(0, Math.min(1, raw));

  return easeOutQuint(clamped);
};

const AwardsScroll = ({ awards, description }: AwardsScrollProps) => {
  const zoneRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef(0);
  const animationProgressRef = useRef(0);
  const targetRef = useRef<number[]>(awards.map(() => 0));
  const currentRef = useRef<number[]>(awards.map(() => 0));
  const rafRef = useRef<number | null>(null);

  const [lineProgress, setLineProgress] = useState<number[]>(() =>
    awards.map(() => 0),
  );
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone) return;

    const measureScrollMetrics = () => {
      const viewportHeight = window.innerHeight;
      const zoneHeight = zone.offsetHeight;
      const scrollable = zoneHeight - viewportHeight;
      const rect = zone.getBoundingClientRect();

      if (scrollable <= 0) {
        return { animationProgress: 1, scrollProgress: 1 };
      }

      const scrolled = Math.min(Math.max(-rect.top, 0), scrollable);
      const scrollProgress = scrolled / scrollable;
      const tailPx = parseCssLength(
        getComputedStyle(zone).getPropertyValue("--awards-scroll-tail"),
        viewportHeight,
      );
      const animationScrollable = Math.max(scrollable - tailPx, 1);
      const animationProgress = Math.min(scrolled / animationScrollable, 1);

      return { animationProgress, scrollProgress };
    };

    const updateTargets = () => {
      const { animationProgress, scrollProgress } = measureScrollMetrics();
      scrollProgressRef.current = scrollProgress;
      animationProgressRef.current = animationProgress;

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reducedMotion) {
        const rect = zone.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          scrollProgressRef.current = 1;
          animationProgressRef.current = 1;
          targetRef.current = awards.map(() => 1);
          setContentVisible(true);
        }
        return;
      }

      targetRef.current = awards.map((_, index) =>
        getLineTarget(animationProgress, index, awards.length),
      );
    };

    const tick = () => {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reducedMotion) {
        currentRef.current = awards.map(() => 1);
        setLineProgress(awards.map(() => 1));
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const current = currentRef.current;
      const target = targetRef.current;

      for (let index = 0; index < awards.length; index += 1) {
        current[index] += (target[index] - current[index]) * LINE_LERP;
      }

      setLineProgress([...current]);
      setContentVisible(
        animationProgressRef.current >= CONTENT_VISIBLE_THRESHOLD,
      );

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
        <div className="awards__trophy-bg" aria-hidden>
          <AwardTrophy scrollProgressRef={scrollProgressRef} decorative />
        </div>

        <div className="container awards__stage">
          <div className="awards__layout">
            <div className="awards__panel awards__panel--intro">
              <div className="awards__intro">
                <h2 className="awards__title">Awards</h2>
                <p className="awards__description">{description}</p>
              </div>
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
