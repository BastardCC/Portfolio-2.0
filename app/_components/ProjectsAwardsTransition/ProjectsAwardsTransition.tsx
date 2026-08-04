"use client";

import { useLenis } from "lenis/react";
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
const SOFT_END_MARK_SELECTOR = ".projects__soft-end-mark";
const PIN_SPACER_CLASS = "projects-pin-spacer";
/** Petite pause après le pin pour voir les derniers projets avant les rideaux */
const CURTAIN_START_BUFFER_VIEWPORTS = 0.55;
/** Tolérance avant de relâcher le pin (évite le flicker Lenis) */
const PIN_RELEASE_HYSTERESIS_PX = 48;
/** Anticipation max du pin selon la vitesse de scroll (px) */
const PIN_VELOCITY_LEAD_MAX_PX = 140;
const PIN_VELOCITY_LEAD_FACTOR = 90;
/**
 * Freinage + soft-snap vers la fin des projets
 * (tout près de l’ancre de fin).
 */
const PROJECTS_END_APPROACH_VIEWPORTS = 1.15;
const PROJECTS_END_SPEED_FAR = 0.55;
const PROJECTS_END_SPEED_NEAR = 0.16;
const PROJECTS_END_MAX_STEP = 6.5;
/** Marque proche du haut du viewport → on force la fin */
const PROJECTS_END_MARK_TRIGGER = 0.35;
const PROJECTS_END_SNAP_DISTANCE_VIEWPORTS = 0.7;
const PROJECTS_END_SOFT_DURATION = 1.15;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const easeOutExpo = (time: number) => Math.min(1, 1.001 - 2 ** (-10 * time));

type PinSnapshot = {
  startScroll: number;
  height: number;
  startScrollTop: number;
};

const ProjectsAwardsTransition = () => {
  const zoneRef = useRef<HTMLDivElement>(null);
  const awardsPanelRef = useRef<HTMLDivElement>(null);
  const pinSnapshotRef = useRef<PinSnapshot | null>(null);
  const spacerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const awardsScrollLatchedRef = useRef(false);
  const setTransitionReady = useSetTransitionReady();
  const lenis = useLenis();
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [awardsFlowActive, setAwardsFlowActive] = useState(false);
  const [awardsScrollActive, setAwardsScrollActive] = useState(false);

  const appears = Array.from({ length: CURTAIN_COUNT }, (_, bottomIndex) =>
    getCurtainAppear(progress, bottomIndex),
  );

  /* Freinage + soft-snap : marque grille → fin des projets */
  useEffect(() => {
    if (!lenis) return;

    let softLanding = false;
    let hasSnapped = false;

    const getAnchor = () =>
      document.querySelector<HTMLElement>(ANCHOR_SELECTOR);

    const getMark = () =>
      document.querySelector<HTMLElement>(SOFT_END_MARK_SELECTOR);

    const getDistanceToEnd = () => {
      const anchor = getAnchor();
      if (!anchor) return Infinity;
      return anchor.getBoundingClientRect().bottom - window.innerHeight;
    };

    const inApproachZone = () => {
      const vh = window.innerHeight;
      const distance = getDistanceToEnd();
      const markTop = getMark()?.getBoundingClientRect().top ?? Infinity;
      return (
        distance < vh * PROJECTS_END_APPROACH_VIEWPORTS && distance > -8
      ) || markTop < vh * 0.92;
    };

    const snapToProjectsEnd = () => {
      if (softLanding || pinSnapshotRef.current) return;

      const distance = getDistanceToEnd();
      if (!Number.isFinite(distance) || distance <= 2) return;

      softLanding = true;
      hasSnapped = true;

      lenis.scrollTo(lenis.scroll + distance, {
        duration: PROJECTS_END_SOFT_DURATION,
        easing: easeOutExpo,
        force: true,
        onComplete: () => {
          softLanding = false;
        },
      });
    };

    const onVirtualScroll = (data: { deltaY: number }) => {
      if (data.deltaY <= 0) {
        if (softLanding) {
          softLanding = false;
          lenis.scrollTo(lenis.scroll, { immediate: true, force: true });
        }
        return;
      }

      if (pinSnapshotRef.current) return;
      if (!inApproachZone()) return;

      const vh = window.innerHeight;
      const distance = getDistanceToEnd();
      const markTop = getMark()?.getBoundingClientRect().top ?? Infinity;
      const shouldSnap =
        !hasSnapped &&
        !softLanding &&
        (markTop < vh * PROJECTS_END_MARK_TRIGGER ||
          distance < vh * PROJECTS_END_SNAP_DISTANCE_VIEWPORTS);

      if (shouldSnap && distance > 2) {
        data.deltaY = 0;
        snapToProjectsEnd();
        return;
      }

      if (softLanding) {
        data.deltaY = 0;
        return;
      }

      const zone = vh * PROJECTS_END_APPROACH_VIEWPORTS;
      const t = clamp01(distance / Math.max(zone, 1));
      const speed =
        PROJECTS_END_SPEED_NEAR +
        (PROJECTS_END_SPEED_FAR - PROJECTS_END_SPEED_NEAR) * t;

      data.deltaY = Math.min(data.deltaY * speed, PROJECTS_END_MAX_STEP);
    };

    const onScroll = () => {
      const vh = window.innerHeight;
      const markTop = getMark()?.getBoundingClientRect().top ?? Infinity;
      const distance = getDistanceToEnd();

      if (markTop > vh * 1.05 && distance > vh * PROJECTS_END_APPROACH_VIEWPORTS) {
        hasSnapped = false;
      }

      if (lenis.velocity < -0.05) {
        softLanding = false;
        return;
      }

      if (pinSnapshotRef.current || softLanding || hasSnapped) return;

      if (
        (markTop < vh * PROJECTS_END_MARK_TRIGGER ||
          distance < vh * PROJECTS_END_SNAP_DISTANCE_VIEWPORTS) &&
        distance > 2 &&
        lenis.velocity > 0.05
      ) {
        snapToProjectsEnd();
      }
    };

    lenis.on("virtual-scroll", onVirtualScroll);
    lenis.on("scroll", onScroll);

    return () => {
      lenis.off("virtual-scroll", onVirtualScroll);
      lenis.off("scroll", onScroll);
    };
  }, [lenis]);

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
      awardsScrollLatchedRef.current = false;
      setIsActive(false);
      setAwardsFlowActive(false);
      setAwardsScrollActive(false);

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
      const viewportHeight = window.innerHeight;
      const fullHeight = pinTarget.offsetHeight;
      const maxScrollTop = Math.max(0, fullHeight - viewportHeight);
      /* Sync exact avec l’écran — pas de saut vers le bas */
      const startScrollTop = Math.min(maxScrollTop, Math.max(0, -rect.top));

      pinSnapshotRef.current = {
        startScroll: scrollY,
        height: fullHeight,
        startScrollTop,
      };

      const spacer = document.createElement("div");
      spacer.className = PIN_SPACER_CLASS;
      spacer.style.height = `${fullHeight}px`;
      spacer.setAttribute("aria-hidden", "true");
      pinTarget.parentNode?.insertBefore(spacer, pinTarget);
      spacerRef.current = spacer;

      pinTarget.style.position = "fixed";
      pinTarget.style.top = "0";
      pinTarget.style.left = `${rect.left}px`;
      pinTarget.style.width = `${rect.width}px`;
      pinTarget.style.height = `${viewportHeight}px`;
      pinTarget.style.overflow = "hidden";
      pinTarget.style.zIndex = "10";
      pinTarget.classList.add("projects-pin-target--pinned");
      pinTarget.scrollTop = startScrollTop;
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
        setAwardsFlowActive(ready);
        setAwardsScrollActive(ready);
        return;
      }

      const snapshot = pinSnapshotRef.current;

      /*
        Relâche seulement sur une vraie remontée — une petite correction
        Lenis au moment du pin ne doit pas tout démonter.
      */
      if (snapshot && scrollY < snapshot.startScroll - PIN_RELEASE_HYSTERESIS_PX) {
        releasePin(pinTarget);
        setProgress(0);
        setTransitionReady(false);
        return;
      }

      const velocity = Math.max(0, lenis?.velocity ?? 0);
      const engageLead = Math.min(
        PIN_VELOCITY_LEAD_MAX_PX,
        velocity * PIN_VELOCITY_LEAD_FACTOR,
      );

      if (!snapshot && anchorBottom > viewportHeight + engageLead + 0.5) {
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
      const maxScrollTop = Math.max(0, activeSnapshot.height - viewportHeight);
      /* Suite 1:1 du scroll page jusqu’en bas — vitesse normale, pas d’ease */
      pinTarget.scrollTop = Math.min(
        maxScrollTop,
        activeSnapshot.startScrollTop + scrolled,
      );

      const bufferPx = viewportHeight * CURTAIN_START_BUFFER_VIEWPORTS;
      const curtainProgress = Math.min(
        Math.max(0, scrolled - bufferPx) / appearScrollDistance,
        1,
      );
      const ready = areCurtainsComplete(curtainProgress);

      /*
        Awards monte dans le flux (sticky) pendant les rideaux.
        Les anims de contenu démarrent une fois le panel collé en haut,
        pour que la montée reste un vrai scroll et non un fade.
      */
      const panelTop =
        awardsPanelRef.current?.getBoundingClientRect().top ?? Infinity;
      const awardsRising = panelTop < viewportHeight;
      const awardsStuck = panelTop <= 12;

      if (awardsStuck) {
        awardsScrollLatchedRef.current = true;
      } else if (panelTop > viewportHeight * 0.92) {
        awardsScrollLatchedRef.current = false;
      }

      /*
        Garder le fond projets derrière les rideaux jusqu’à ce qu’Awards
        couvre l’écran. Sinon visibility:hidden dès ready (~32 %) laisse
        voir le fond crème vide avant l’arrivée d’Awards (~50 %).
      */
      const awardsCover =
        awardsStuck ||
        awardsScrollLatchedRef.current ||
        (awardsRising && panelTop < viewportHeight * 0.35);
      const projectsFade = awardsCover
        ? clamp01((viewportHeight * 0.45 - panelTop) / (viewportHeight * 0.35))
        : 0;

      pinTarget.style.opacity = String(Math.max(0, 1 - projectsFade));
      if (awardsCover && (awardsStuck || projectsFade >= 0.95)) {
        pinTarget.style.visibility = "hidden";
      } else {
        pinTarget.style.visibility = "";
      }

      setAwardsFlowActive(awardsRising || awardsScrollLatchedRef.current);
      setAwardsScrollActive(awardsScrollLatchedRef.current);
      setProgress(curtainProgress);
      setTransitionReady(ready || awardsScrollLatchedRef.current);
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
  }, [lenis, setTransitionReady]);

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
          awardsFlowActive ? "transition-awards-flow--active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div ref={awardsPanelRef} className="transition-awards-panel">
          <section className="awards awards--on-curtains text-white">
            <AwardsScroll
              awards={AWARDS}
              description={AWARDS_DESCRIPTION}
              onCurtains
              scrollActive={awardsScrollActive}
            />
          </section>
        </div>
        <div className="transition-awards-runway" aria-hidden />
      </div>
    </div>
  );
};

export default ProjectsAwardsTransition;
