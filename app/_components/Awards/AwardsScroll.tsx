"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import RevealText from "../RevealText";
import AwardList, { type Award } from "./AwardList";
import AwardTrophy from "./AwardTrophy";
import { getScrollY, shouldEmitVisualFrame, subscribeScrollFrame } from "../scroll-frame";
import "./awards.css";

type AwardsScrollProps = {
  awards: Award[];
  description: string;
  onCurtains?: boolean;
  scrollActive?: boolean;
};

const LINE_LERP = 0.1;
const TROPHY_APPEAR_LERP = 0.09;
const SHADE_APPEAR_LERP = 0.065;
const TROPHY_APPEAR_SCROLL_SPAN = 0.2;
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

const AwardsScroll = ({
  awards,
  description,
  onCurtains = false,
  scrollActive = true,
}: AwardsScrollProps) => {
  const zoneRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef(0);
  const animationProgressRef = useRef(0);
  const scrollYAtActiveRef = useRef(0);
  const scrollYAtActiveSetRef = useRef(false);
  const trophyAppearRef = useRef(0);
  const shadeAppearRef = useRef(0);
  const shadeRef = useRef<HTMLDivElement>(null);
  const lineCount = awards.length + 1;
  const targetRef = useRef<number[]>(new Array(lineCount).fill(0));
  const currentRef = useRef<number[]>(new Array(lineCount).fill(0));
  const rafRef = useRef<number | null>(null);
  const visualEmitRef = useRef(0);

  const [lineProgress, setLineProgress] = useState<number[]>(() =>
    new Array(lineCount).fill(0),
  );
  const [contentVisible, setContentVisible] = useState(false);
  const [introActive, setIntroActive] = useState(false);

  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone || !scrollActive) return;

    const measureScrollMetrics = () => {
      const viewportHeight = window.innerHeight;
      const zoneHeight = zone.offsetHeight;
      const scrollable = zoneHeight - viewportHeight;
      const rect = zone.getBoundingClientRect();

      if (scrollable <= 0) {
        return { animationProgress: 1, scrollProgress: 1 };
      }

      const rawScrolled = Math.min(Math.max(-rect.top, 0), scrollable);
      const tailPx = parseCssLength(
        getComputedStyle(zone).getPropertyValue("--awards-scroll-tail"),
        viewportHeight,
      );
      const stepPx = parseCssLength(
        getComputedStyle(zone).getPropertyValue("--awards-scroll-step"),
        viewportHeight,
      );

      if (onCurtains) {
        const scrolledSinceActive = Math.max(
          0,
          getScrollY() - scrollYAtActiveRef.current,
        );
        const animationScrollable = Math.max(awards.length * stepPx, 1);
        const animationProgress = Math.min(
          scrolledSinceActive / animationScrollable,
          1,
        );
        const scrollProgress =
          scrolledSinceActive / Math.max(animationScrollable + tailPx, 1);

        return { animationProgress, scrollProgress };
      }

      const scrolled = rawScrolled;
      const scrollProgress = scrolled / scrollable;
      const animationScrollable = Math.max(scrollable - tailPx, 1);
      const animationProgress = Math.min(scrolled / animationScrollable, 1);

      return { animationProgress, scrollProgress };
    };

    const captureScrollBaseline = () => {
      if (!onCurtains || scrollYAtActiveSetRef.current) return;

      scrollYAtActiveRef.current = getScrollY();
      scrollYAtActiveSetRef.current = true;
      targetRef.current = new Array(lineCount).fill(0);
      currentRef.current = new Array(lineCount).fill(0);
      setLineProgress(new Array(lineCount).fill(0));
      setContentVisible(false);
      animationProgressRef.current = 0;
      scrollProgressRef.current = 0;
      trophyAppearRef.current = 0;
      shadeAppearRef.current = 0;
      if (shadeRef.current) {
        shadeRef.current.style.opacity = "0";
      }
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
          targetRef.current = new Array(lineCount).fill(1);
          setContentVisible(true);
        }
        return;
      }

      targetRef.current = Array.from({ length: lineCount }, (_, index) =>
        getLineTarget(animationProgress, index, lineCount),
      );
    };

    const tick = () => {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reducedMotion) {
        currentRef.current = new Array(lineCount).fill(1);
        setLineProgress(new Array(lineCount).fill(1));
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const current = currentRef.current;
      const target = targetRef.current;

      for (let index = 0; index < lineCount; index += 1) {
        current[index] += (target[index] - current[index]) * LINE_LERP;
      }

      const { emit, now } = shouldEmitVisualFrame(visualEmitRef.current);

      if (emit) {
        visualEmitRef.current = now;
        setLineProgress([...current]);
        setContentVisible(
          animationProgressRef.current >= CONTENT_VISIBLE_THRESHOLD,
        );
        setIntroActive(
          onCurtains
            ? animationProgressRef.current > 0.04
            : animationProgressRef.current > 0.02,
        );
      }

      if (onCurtains) {
        const trophyTarget = Math.min(
          1,
          animationProgressRef.current / TROPHY_APPEAR_SCROLL_SPAN,
        );
        trophyAppearRef.current +=
          (trophyTarget - trophyAppearRef.current) * TROPHY_APPEAR_LERP;

        shadeAppearRef.current +=
          (trophyAppearRef.current - shadeAppearRef.current) * SHADE_APPEAR_LERP;

        if (shadeRef.current) {
          shadeRef.current.style.opacity = String(shadeAppearRef.current);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    captureScrollBaseline();
    updateTargets();
    rafRef.current = requestAnimationFrame(tick);

    const unsubscribeScroll = subscribeScrollFrame(updateTargets);
    window.addEventListener("resize", updateTargets);

    return () => {
      unsubscribeScroll();
      window.removeEventListener("resize", updateTargets);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [awards, scrollActive, onCurtains]);

  useEffect(() => {
    if (!scrollActive) {
      setIntroActive(false);
      scrollYAtActiveRef.current = 0;
      scrollYAtActiveSetRef.current = false;
      trophyAppearRef.current = 0;
      shadeAppearRef.current = 0;
      if (shadeRef.current) {
        shadeRef.current.style.opacity = "0";
      }
    }
  }, [scrollActive]);

  return (
    <div
      ref={zoneRef}
      className={[
        "awards__scroll-zone",
        onCurtains ? "awards__scroll-zone--on-curtains" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--award-count": awards.length } as CSSProperties}
    >
      <div className="awards__sticky">
        <div className="awards__trophy-bg" aria-hidden>
          <AwardTrophy
            scrollProgressRef={scrollProgressRef}
            decorative
            appearProgressRef={onCurtains ? trophyAppearRef : undefined}
          />
        </div>

        <div
          ref={shadeRef}
          className={[
            "awards__content-shade",
            onCurtains ? "awards__content-shade--scroll-driven" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden
        />

        <div className="container awards__stage">
          <div className="awards__layout">
            <div className="awards__panel awards__panel--intro">
              <div className="awards__intro">
                {introActive ? (
                  <>
                    <RevealText triggerOnScroll={false} duration={1.2}>
                      <h2 className="awards__title">Awards</h2>
                    </RevealText>
                    <RevealText
                      triggerOnScroll={false}
                      duration={1.15}
                      delay={0.16}
                    >
                      <p className="awards__description">{description}</p>
                    </RevealText>
                  </>
                ) : (
                  <>
                    <h2 className="awards__title awards__title--pending" aria-hidden>
                      Awards
                    </h2>
                    <p
                      className="awards__description awards__description--pending"
                      aria-hidden
                    >
                      {description}
                    </p>
                  </>
                )}
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
