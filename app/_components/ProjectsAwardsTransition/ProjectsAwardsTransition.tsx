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
const PIN_SPACER_CLASS = "projects-pin-spacer";
const SERVICES_TARGET_SELECTOR = ".services-pin-target";
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
/**
 * Freinage + snap Awards → Services :
 * un scroll vers le bas amène la section Services entière (100dvh) en haut.
 */
const SERVICES_APPROACH_VIEWPORTS = 2.6;
const SERVICES_APPROACH_SPEED_FAR = 0.22;
const SERVICES_APPROACH_SPEED_NEAR = 0.07;
const SERVICES_APPROACH_MAX_STEP = 6.5;
const SERVICES_SNAP_TRIGGER = 0.78;
const SERVICES_SNAP_DURATION = 1.2;

const easeOutExpo = (time: number) => Math.min(1, 1.001 - 2 ** (-10 * time));
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

  /* Ralentissement + snap plein écran vers Services */
  useEffect(() => {
    if (!lenis) return;

    let softLanding = false;
    let hasSnapped = false;

    const getServicesEl = () =>
      document.querySelector<HTMLElement>(SERVICES_TARGET_SELECTOR);

    const getServicesTop = () =>
      getServicesEl()?.getBoundingClientRect().top ?? Infinity;

    const inSlowZone = () => {
      const vh = window.innerHeight;
      const zoneBottom =
        zoneRef.current?.getBoundingClientRect().bottom ?? Infinity;
      const servicesTop = getServicesTop();
      const nearServices = servicesTop < vh * SERVICES_APPROACH_VIEWPORTS;
      const leavingAwards =
        zoneBottom < vh * 1.35 && zoneBottom > -vh * 0.15;
      return nearServices || leavingAwards;
    };

    const snapToServices = () => {
      const el = getServicesEl();
      if (!el || softLanding) return;

      softLanding = true;
      hasSnapped = true;

      lenis.scrollTo(el, {
        offset: 0,
        duration: SERVICES_SNAP_DURATION,
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

      if (!inSlowZone()) return;

      const vh = window.innerHeight;
      const servicesTop = getServicesTop();

      /* Un scroll bas suffit : on aligne toute la section Services */
      if (
        !hasSnapped &&
        !softLanding &&
        servicesTop < vh * SERVICES_SNAP_TRIGGER &&
        servicesTop > 10
      ) {
        data.deltaY = 0;
        snapToServices();
        return;
      }

      const approachZone = vh * SERVICES_APPROACH_VIEWPORTS;
      const t = clamp01(servicesTop / Math.max(approachZone, 1));
      const speed =
        SERVICES_APPROACH_SPEED_NEAR +
        (SERVICES_APPROACH_SPEED_FAR - SERVICES_APPROACH_SPEED_NEAR) * t;

      data.deltaY = Math.min(data.deltaY * speed, SERVICES_APPROACH_MAX_STEP);
    };

    const onScroll = () => {
      const vh = window.innerHeight;
      const servicesTop = getServicesTop();

      if (servicesTop > vh * 1.15) {
        hasSnapped = false;
      }

      if (lenis.velocity < -0.05) {
        softLanding = false;
        return;
      }

      if (
        !hasSnapped &&
        !softLanding &&
        lenis.velocity > 0.08 &&
        servicesTop < vh * SERVICES_SNAP_TRIGGER &&
        servicesTop > 10
      ) {
        snapToServices();
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
        setAwardsFlowActive(ready);
        setAwardsScrollActive(ready);
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
