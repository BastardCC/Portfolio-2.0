"use client";

import { useEffect, useRef, useState } from "react";
import Contact from "../Contact";
import TransitionCurtains from "../ProjectsAwardsTransition/TransitionCurtains";
import {
  APPEAR_SCROLL_VIEWPORTS,
  CURTAIN_COUNT,
  areCurtainsComplete,
  getCurtainAppear,
} from "../ProjectsAwardsTransition/transition-math";
import { getScrollY, subscribeScrollFrame } from "../scroll-frame";
import "../ProjectsAwardsTransition/projects-awards-transition.css";
import "./services-contact-transition.css";

const PIN_TARGET_SELECTOR = ".services-pin-target";
const ANCHOR_SELECTOR = ".services__transition-anchor";
const PIN_SPACER_CLASS = "services-pin-spacer";
const CURTAIN_START_BUFFER_VIEWPORTS = 0.7;

const easeOutQuad = (value: number) => 1 - (1 - value) ** 2;

const getPinnedTop = (
  viewportHeight: number,
  contentHeight: number,
  engageTop: number,
  bufferProgress: number,
) => {
  const centeredTop =
    contentHeight <= viewportHeight
      ? (viewportHeight - contentHeight) / 2
      : Math.min(0, viewportHeight - contentHeight);

  return engageTop + (centeredTop - engageTop) * easeOutQuad(bufferProgress);
};

type PinSnapshot = {
  startScroll: number;
  top: number;
  left: number;
  width: number;
  height: number;
};

const ServicesContactTransition = () => {
  const zoneRef = useRef<HTMLDivElement>(null);
  const pinSnapshotRef = useRef<PinSnapshot | null>(null);
  const spacerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [contactEngaged, setContactEngaged] = useState(false);

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
      pinTarget.style.height = "";
      pinTarget.style.zIndex = "";
    };

    const releasePin = (pinTarget: HTMLElement | null) => {
      pinSnapshotRef.current = null;
      setIsActive(false);
      setContactEngaged(false);

      if (spacerRef.current) {
        spacerRef.current.remove();
        spacerRef.current = null;
      }

      if (!pinTarget) return;

      clearPinStyles(pinTarget);
      pinTarget.style.opacity = "";
      pinTarget.classList.remove("services-pin-target--pinned");
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
      pinTarget.classList.add("services-pin-target--pinned");
      setIsActive(true);
    };

    const update = () => {
      const viewportHeight = window.innerHeight;
      const scrollY = getScrollY();
      const pinTarget = document.querySelector<HTMLElement>(PIN_TARGET_SELECTOR);
      const anchor = document.querySelector<HTMLElement>(ANCHOR_SELECTOR);
      const anchorBottom = anchor?.getBoundingClientRect().bottom ?? Infinity;
      const appearScrollDistance = viewportHeight * APPEAR_SCROLL_VIEWPORTS;
      const bufferPx = viewportHeight * CURTAIN_START_BUFFER_VIEWPORTS;

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reducedMotion) {
        releasePin(pinTarget);
        const rect = zone.getBoundingClientRect();
        const ready = rect.bottom > 0 && rect.top < viewportHeight;
        setProgress(0);
        setContactEngaged(ready);
        return;
      }

      const snapshot = pinSnapshotRef.current;

      if (snapshot && scrollY < snapshot.startScroll - 1) {
        releasePin(pinTarget);
        setProgress(0);
        return;
      }

      if (!snapshot && anchorBottom > viewportHeight + 0.5) {
        releasePin(pinTarget);
        setProgress(0);
        return;
      }

      if (!pinTarget) return;

      if (!snapshot) {
        engagePin(pinTarget, scrollY);
      }

      const activeSnapshot = pinSnapshotRef.current;
      if (!activeSnapshot) return;

      const scrolled = Math.max(0, scrollY - activeSnapshot.startScroll);
      const bufferProgress =
        bufferPx > 0 ? Math.min(scrolled / bufferPx, 1) : 1;
      const pinnedTop = getPinnedTop(
        viewportHeight,
        activeSnapshot.height,
        activeSnapshot.top,
        bufferProgress,
      );

      pinTarget.style.top = `${pinnedTop}px`;

      const effectiveScrolled = Math.max(0, scrolled - bufferPx);
      const curtainProgress = Math.min(effectiveScrolled / appearScrollDistance, 1);
      const ready = areCurtainsComplete(curtainProgress);
      const servicesFade = Math.max(
        0,
        Math.min(1, (curtainProgress - 0.55) / 0.35),
      );

      pinTarget.style.opacity = String(Math.max(0, 1 - servicesFade));
      setContactEngaged(ready);
      setProgress(curtainProgress);
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
  }, []);

  return (
    <div
      ref={zoneRef}
      className={[
        "transition-zone",
        "services-contact-transition-zone",
        isActive ? "transition-zone--active" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="transition-sticky">
        <TransitionCurtains appears={appears} variant="light" />
        <div
          className={[
            "transition-contact-overlay",
            contactEngaged ? "transition-contact-overlay--visible" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <section className="contact contact--on-curtains">
            <Contact />
          </section>
        </div>
      </div>
    </div>
  );
};

export default ServicesContactTransition;
