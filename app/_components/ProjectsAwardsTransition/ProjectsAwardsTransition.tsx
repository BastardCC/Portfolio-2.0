"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import AwardsScroll from "../Awards/AwardsScroll";
import { AWARDS, AWARDS_DESCRIPTION } from "../Awards/awards-data";
import { useSetTransitionReady } from "./TransitionProvider";
import TransitionCurtains from "./TransitionCurtains";
import {
  APPEAR_SCROLL_VIEWPORTS,
  CURTAIN_COUNT,
  areCurtainsComplete,
  getCurtainAppear,
} from "./transition-math";
import { getScrollY, subscribeScrollFrame } from "../scroll-frame";
import "./projects-awards-transition.css";

const PIN_TARGET_SELECTOR = ".projects-pin-target";
const ANCHOR_SELECTOR = ".projects-grid__transition-anchor";
const PIN_SPACER_CLASS = "projects-pin-spacer";

type PinSnapshot = {
  startScroll: number;
  top: number;
  left: number;
  width: number;
  height: number;
};

const ProjectsAwardsTransition = () => {
  const zoneRef = useRef<HTMLDivElement>(null);
  const pinSnapshotRef = useRef<PinSnapshot | null>(null);
  const spacerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const setTransitionReady = useSetTransitionReady();
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [awardsEngaged, setAwardsEngaged] = useState(false);

  const awardsReady = areCurtainsComplete(progress);
  const appears = Array.from({ length: CURTAIN_COUNT }, (_, bottomIndex) =>
    getCurtainAppear(progress, bottomIndex),
  );

  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone) return;

    const clearPinStyles = (pinTarget: HTMLElement) => {
      pinTarget.style.position = "";
      pinTarget.style.top = "";
      pinTarget.style.left = "";
      pinTarget.style.width = "";
      pinTarget.style.zIndex = "";
    };

    const releasePin = (pinTarget: HTMLElement | null) => {
      pinSnapshotRef.current = null;
      setIsActive(false);
      setAwardsEngaged(false);

      if (spacerRef.current) {
        spacerRef.current.remove();
        spacerRef.current = null;
      }

      if (!pinTarget) return;

      clearPinStyles(pinTarget);
      pinTarget.style.opacity = "";
      pinTarget.classList.remove("projects-pin-target--pinned");
    };

    const engagePin = (pinTarget: HTMLElement, scrollY: number) => {
      const rect = pinTarget.getBoundingClientRect();

      pinSnapshotRef.current = {
        startScroll: scrollY,
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: pinTarget.offsetHeight,
      };

      const spacer = document.createElement("div");
      spacer.className = PIN_SPACER_CLASS;
      spacer.style.height = `${pinSnapshotRef.current.height}px`;
      spacer.setAttribute("aria-hidden", "true");
      pinTarget.parentNode?.insertBefore(spacer, pinTarget);
      spacerRef.current = spacer;

      pinTarget.style.position = "fixed";
      pinTarget.style.top = `${rect.top}px`;
      pinTarget.style.left = `${rect.left}px`;
      pinTarget.style.width = `${rect.width}px`;
      pinTarget.style.zIndex = "10";
      pinTarget.classList.add("projects-pin-target--pinned");
      setIsActive(true);
    };

    const update = () => {
      const viewportHeight = window.innerHeight;
      const scrollY = getScrollY();
      const pinTarget = document.querySelector<HTMLElement>(PIN_TARGET_SELECTOR);
      const anchor = document.querySelector<HTMLElement>(ANCHOR_SELECTOR);
      const anchorBottom = anchor?.getBoundingClientRect().bottom ?? Infinity;
      const appearScrollDistance = viewportHeight * APPEAR_SCROLL_VIEWPORTS;

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reducedMotion) {
        releasePin(pinTarget);
        const rect = zone.getBoundingClientRect();
        const ready = rect.bottom > 0 && rect.top < viewportHeight;
        setProgress(0);
        setTransitionReady(ready);
        return;
      }

      const snapshot = pinSnapshotRef.current;

      if (snapshot && scrollY < snapshot.startScroll - 1) {
        releasePin(pinTarget);
        setProgress(0);
        setTransitionReady(false);
        return;
      }

      if (!snapshot && anchorBottom > viewportHeight + 0.5) {
        releasePin(pinTarget);
        setProgress(0);
        setTransitionReady(false);
        return;
      }

      if (!pinTarget) return;

      if (!snapshot) {
        engagePin(pinTarget, scrollY);
      }

      const activeSnapshot = pinSnapshotRef.current;
      if (!activeSnapshot) return;

      const scrolled = Math.max(0, scrollY - activeSnapshot.startScroll);
      const curtainProgress = Math.min(scrolled / appearScrollDistance, 1);
      const ready = areCurtainsComplete(curtainProgress);
      const projectsFade = Math.max(
        0,
        Math.min(1, (curtainProgress - 0.55) / 0.35),
      );

      pinTarget.style.opacity = String(Math.max(0, 1 - projectsFade));

      if (ready) {
        setAwardsEngaged(true);
      }

      setProgress(curtainProgress);
      setTransitionReady(ready);
    };

    const scheduleUpdate = () => {
      if (rafRef.current !== null) return;

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        update();
      });
    };

    update();
    const unsubscribeScroll = subscribeScrollFrame(scheduleUpdate);
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      unsubscribeScroll();
      window.removeEventListener("resize", scheduleUpdate);

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      releasePin(document.querySelector<HTMLElement>(PIN_TARGET_SELECTOR));
    };
  }, [setTransitionReady]);

  return (
    <div
      ref={zoneRef}
      className={[
        "transition-zone",
        isActive ? "transition-zone--active" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--award-count": AWARDS.length } as CSSProperties}
    >
      <div className="transition-sticky">
        <TransitionCurtains appears={appears} />
      </div>

      <div
        className={[
          "transition-awards-flow",
          awardsEngaged ? "transition-awards-flow--visible" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <section className="awards awards--on-curtains text-white">
          <AwardsScroll
            awards={AWARDS}
            description={AWARDS_DESCRIPTION}
            onCurtains
            scrollActive={awardsEngaged}
          />
        </section>
      </div>
    </div>
  );
};

export default ProjectsAwardsTransition;
