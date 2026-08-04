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
const ANCHOR_SELECTOR = ".projects__transition-anchor";
const PIN_SPACER_CLASS = "projects-pin-spacer";
/** Scroll libre après le pin avant que les rideaux ne commencent */
const CURTAIN_START_BUFFER_VIEWPORTS = 1.25;
/**
 * Réserve de scroll interne gardée au moment du pin : le contenu continue de
 * glisser sur cette distance au lieu de se figer net.
 */
const PIN_DRIFT_VIEWPORTS = 0.4;
/**
 * Course de scroll qui absorbe ce glissement. Le facteur 3 est la pente à
 * l'origine de easeOutCubic : le contenu démarre exactement à la vitesse du
 * scroll, puis retombe à zéro. Doit rester ≤ CURTAIN_START_BUFFER_VIEWPORTS.
 */
const PIN_DRIFT_SCROLL_VIEWPORTS = PIN_DRIFT_VIEWPORTS * 3;
/** Sous ce progress, Awards se détache (après la sortie animée) */
const AWARDS_EXIT_PROGRESS = 0.14;

const easeOutCubic = (value: number) => 1 - (1 - value) ** 3;
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

type PinSnapshot = {
  startScroll: number;
  top: number;
  left: number;
  width: number;
  height: number;
  drift: number;
};

const ProjectsAwardsTransition = () => {
  const zoneRef = useRef<HTMLDivElement>(null);
  const pinSnapshotRef = useRef<PinSnapshot | null>(null);
  const spacerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const awardsLatchedRef = useRef(false);
  const setTransitionReady = useSetTransitionReady();
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [awardsEngaged, setAwardsEngaged] = useState(false);
  const [awardsExiting, setAwardsExiting] = useState(false);

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
      pinTarget.style.overflow = "";
      pinTarget.style.zIndex = "";
      pinTarget.style.visibility = "";
      pinTarget.scrollTop = 0;
    };

    const releasePin = (pinTarget: HTMLElement | null) => {
      pinSnapshotRef.current = null;
      awardsLatchedRef.current = false;
      setIsActive(false);
      setAwardsEngaged(false);
      setAwardsExiting(false);

      if (spacerRef.current) {
        spacerRef.current.remove();
        spacerRef.current = null;
      }

      if (!pinTarget) return;

      clearPinStyles(pinTarget);
      pinTarget.style.opacity = "";
      pinTarget.classList.remove("projects-pin-target--pinned");
    };

    const engagePin = (
      pinTarget: HTMLElement,
      scrollY: number,
      drift: number,
    ) => {
      const rect = pinTarget.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const fullHeight = pinTarget.offsetHeight;

      pinSnapshotRef.current = {
        startScroll: scrollY,
        top: 0,
        left: rect.left,
        width: rect.width,
        height: fullHeight,
        drift,
      };

      const spacer = document.createElement("div");
      spacer.className = PIN_SPACER_CLASS;
      spacer.style.height = `${fullHeight}px`;
      spacer.setAttribute("aria-hidden", "true");
      pinTarget.parentNode?.insertBefore(spacer, pinTarget);
      spacerRef.current = spacer;

      /*
        Contenu plus haut que le viewport : on pin en 100dvh
        et on scrolle l’intérieur jusqu’en bas (dernières cards visibles).
        Évite top négatif → trou blanc pendant les rideaux.
      */
      pinTarget.style.position = "fixed";
      pinTarget.style.top = "0";
      pinTarget.style.left = `${rect.left}px`;
      pinTarget.style.width = `${rect.width}px`;
      pinTarget.style.height = `${viewportHeight}px`;
      pinTarget.style.overflow = "hidden";
      pinTarget.style.zIndex = "10";
      pinTarget.classList.add("projects-pin-target--pinned");
      pinTarget.scrollTop = Math.max(0, fullHeight - viewportHeight - drift);
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

      /* On accroche avant que le contenu ne touche le bas du viewport pour
         garder de quoi le laisser glisser en douceur. */
      const pinFullHeight = snapshot?.height ?? pinTarget?.offsetHeight ?? 0;
      const pinDrift = Math.min(
        Math.max(0, pinFullHeight - viewportHeight),
        viewportHeight * PIN_DRIFT_VIEWPORTS,
      );

      if (!snapshot && anchorBottom > viewportHeight + pinDrift + 0.5) {
        releasePin(pinTarget);
        setProgress(0);
        setTransitionReady(false);
        return;
      }

      if (!pinTarget) return;

      if (!snapshot) {
        engagePin(pinTarget, scrollY, pinDrift);
      }

      const activeSnapshot = pinSnapshotRef.current;
      if (!activeSnapshot) return;

      const scrolled = Math.max(0, scrollY - activeSnapshot.startScroll);

      const driftRunway = viewportHeight * PIN_DRIFT_SCROLL_VIEWPORTS;
      const driftProgress =
        driftRunway > 0 ? Math.min(1, scrolled / driftRunway) : 1;
      const maxScrollTop = Math.max(0, activeSnapshot.height - viewportHeight);

      pinTarget.scrollTop =
        maxScrollTop - activeSnapshot.drift * (1 - easeOutCubic(driftProgress));

      const bufferPx = viewportHeight * CURTAIN_START_BUFFER_VIEWPORTS;
      const effectiveScrolled = Math.max(0, scrolled - bufferPx);
      const curtainProgress = Math.min(
        effectiveScrolled / appearScrollDistance,
        1,
      );
      const ready = areCurtainsComplete(curtainProgress);
      const projectsFade = Math.max(
        0,
        Math.min(1, (curtainProgress - 0.55) / 0.35),
      );

      pinTarget.style.opacity = String(Math.max(0, 1 - projectsFade));
      if (ready) {
        pinTarget.style.visibility = "hidden";
      } else {
        pinTarget.style.visibility = "";
      }

      /* Hystérésis : Awards reste accroché au scroll-up pour jouer la sortie */
      if (ready) {
        awardsLatchedRef.current = true;
      } else if (curtainProgress < AWARDS_EXIT_PROGRESS) {
        awardsLatchedRef.current = false;
      }

      const awardsActive = awardsLatchedRef.current;
      const exiting = awardsActive && !ready;
      const awardsFade = awardsActive
        ? exiting
          ? clamp01(
              (curtainProgress - AWARDS_EXIT_PROGRESS) /
                Math.max(0.22, 0.0001),
            )
          : 1
        : 0;

      setAwardsEngaged(awardsActive);
      setAwardsExiting(exiting);
      if (zone) {
        zone.style.setProperty("--awards-flow-opacity", String(awardsFade));
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
          awardsExiting ? "transition-awards-flow--exiting" : "",
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
            exiting={awardsExiting}
          />
        </section>
      </div>
    </div>
  );
};

export default ProjectsAwardsTransition;
