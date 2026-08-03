"use client";

import { useLenis } from "lenis/react";
import { useEffect, useRef, useState } from "react";
import Contact from "../Contact";
import TransitionCurtains from "../ProjectsAwardsTransition/TransitionCurtains";
import {
  APPEAR_SCROLL_VIEWPORTS,
  CURTAIN_COUNT,
  getCurtainAppear,
} from "../ProjectsAwardsTransition/transition-math";
import { getScrollY, subscribeScrollFrame } from "../scroll-frame";
import "../ProjectsAwardsTransition/projects-awards-transition.css";
import "./services-contact-transition.css";

const PIN_TARGET_SELECTOR = ".services-pin-target";
const ANCHOR_SELECTOR = ".services__transition-anchor";
const PIN_SPACER_CLASS = "services-pin-spacer";
const CURTAIN_START_BUFFER_VIEWPORTS = 2.75;
/** Début du reveal : panel encore sous le viewport */
const CONTACT_REVEAL_START_VIEWPORTS = 1.8;
/** Fin du reveal : dès que Contact est collé en haut */
const CONTACT_REVEAL_END_VIEWPORTS = 0.05;
/** Contact visible dès ~20 % des rideaux (chevauchement avec l’anim rideaux) */
const CONTACT_CURTAIN_REVEAL_START = 0.2;
const CONTACT_CURTAIN_REVEAL_SPAN = 0.45;
const CONTACT_REVEAL_LERP = 0.045;
/**
 * Freinage fin de page (style Lenis / Akaru) :
 * scroll ralenti en continu — pas d’arrêt sec, même en scroll rapide.
 */
const CONTACT_APPROACH_VIEWPORTS = 3;
const CONTACT_APPROACH_SPEED_FAR = 0.16;
const CONTACT_APPROACH_SPEED_NEAR = 0.045;
const CONTACT_APPROACH_MAX_STEP = 5.5;
const CONTACT_END_SOFTEN_VIEWPORTS = 2.6;
const CONTACT_END_SPEED_START = 0.18;
const CONTACT_END_SPEED_END = 0.035;
const CONTACT_END_MAX_STEP = 2.4;
const CONTACT_MAX_VELOCITY = 0.42;
const CONTACT_SOFT_LANDING_DURATION = 1.95;
const CONTACT_SOFT_LANDING_AHEAD_MAX = 0.16;

const easeOutExpo = (time: number) => Math.min(1, 1.001 - 2 ** (-10 * time));

const easeOutQuad = (value: number) => 1 - (1 - value) ** 2;
const easeOutQuint = (value: number) => 1 - (1 - value) ** 5;
const easeOutCubic = (value: number) => 1 - (1 - value) ** 3;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

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
  const contactPanelRef = useRef<HTMLDivElement>(null);
  const pinSnapshotRef = useRef<PinSnapshot | null>(null);
  const spacerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const revealRafRef = useRef<number | null>(null);
  const revealTargetRef = useRef(0);
  const revealCurrentRef = useRef(0);
  const contactActiveRef = useRef(false);
  const lenis = useLenis();
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [contactActive, setContactActive] = useState(false);

  const appears = Array.from({ length: CURTAIN_COUNT }, (_, bottomIndex) =>
    getCurtainAppear(progress, bottomIndex),
  );

  /* Ralentissement progressif : approche Contact + fin de page */
  useEffect(() => {
    if (!lenis) return;

    let softLanding = false;

    const inSlowZone = () => {
      const vh = window.innerHeight;
      const remaining = Math.max(0, lenis.limit - lenis.scroll);
      const panelTop =
        contactPanelRef.current?.getBoundingClientRect().top ?? Infinity;
      const settled = contactActiveRef.current && panelTop <= 12;
      const approaching = panelTop < vh * CONTACT_APPROACH_VIEWPORTS;
      const nearEnd = remaining < vh * CONTACT_END_SOFTEN_VIEWPORTS;
      return approaching || settled || nearEnd;
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
      const remaining = Math.max(0, lenis.limit - lenis.scroll);
      const endZone = vh * CONTACT_END_SOFTEN_VIEWPORTS;
      const approachZone = vh * CONTACT_APPROACH_VIEWPORTS;
      const panelTop =
        contactPanelRef.current?.getBoundingClientRect().top ?? Infinity;
      const settled = contactActiveRef.current && panelTop <= 12;

      let speed: number;
      let maxStep: number;

      if (!settled) {
        const t = clamp01(panelTop / Math.max(approachZone, 1));
        speed =
          CONTACT_APPROACH_SPEED_NEAR +
          (CONTACT_APPROACH_SPEED_FAR - CONTACT_APPROACH_SPEED_NEAR) * t;
        maxStep = CONTACT_APPROACH_MAX_STEP;
      } else {
        const t = clamp01(remaining / Math.max(endZone, 1));
        speed =
          CONTACT_END_SPEED_END +
          (CONTACT_END_SPEED_START - CONTACT_END_SPEED_END) * t;
        maxStep = Math.min(
          CONTACT_END_MAX_STEP,
          Math.max(remaining * 0.05, 1.5),
        );
      }

      data.deltaY = Math.min(data.deltaY * speed, maxStep);
    };

    const onScroll = () => {
      const velocity = lenis.velocity;

      if (velocity < -0.05) {
        softLanding = false;
        return;
      }

      if (!inSlowZone() || softLanding) return;

      if (velocity > CONTACT_MAX_VELOCITY) {
        softLanding = true;
        const vh = window.innerHeight;
        const panelTop =
          contactPanelRef.current?.getBoundingClientRect().top ?? Infinity;
        const remaining = Math.max(0, lenis.limit - lenis.scroll);
        const ahead = Math.min(
          lenis.limit,
          lenis.scroll +
            Math.min(
              vh * CONTACT_SOFT_LANDING_AHEAD_MAX,
              Math.max(panelTop * 0.32, vh * 0.06),
              remaining,
            ),
        );

        lenis.scrollTo(ahead, {
          duration: CONTACT_SOFT_LANDING_DURATION,
          easing: easeOutExpo,
          force: true,
          onComplete: () => {
            softLanding = false;
          },
        });
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
      pinTarget.style.zIndex = "";
    };

    const releasePin = (pinTarget: HTMLElement | null) => {
      pinSnapshotRef.current = null;
      setIsActive(false);
      contactActiveRef.current = false;
      setContactActive(false);

      if (spacerRef.current) {
        spacerRef.current.remove();
        spacerRef.current = null;
      }

      revealTargetRef.current = 0;
      revealCurrentRef.current = 0;
      if (contactPanelRef.current) {
        contactPanelRef.current.style.setProperty("--contact-reveal-opacity", "0");
        contactPanelRef.current.style.setProperty("--contact-reveal-y", "0");
      }

      if (!pinTarget) return;

      clearPinStyles(pinTarget);
      pinTarget.style.opacity = "";
      pinTarget.classList.remove("services-pin-target--pinned");
    };

    const engagePin = (pinTarget: HTMLElement, scrollY: number) => {
      const rect = pinTarget.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      pinSnapshotRef.current = {
        startScroll: scrollY,
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: viewportHeight,
      };

      const spacer = document.createElement("div");
      spacer.className = PIN_SPACER_CLASS;
      spacer.style.height = `${Math.max(pinTarget.offsetHeight, viewportHeight)}px`;
      spacer.setAttribute("aria-hidden", "true");
      pinTarget.parentNode?.insertBefore(spacer, pinTarget);
      spacerRef.current = spacer;

      pinTarget.style.position = "fixed";
      pinTarget.style.top = `${rect.top}px`;
      pinTarget.style.left = `${rect.left}px`;
      pinTarget.style.width = `${rect.width}px`;
      pinTarget.style.height = `${viewportHeight}px`;
      pinTarget.style.zIndex = "10";
      pinTarget.classList.add("services-pin-target--pinned");
      setIsActive(true);
    };

    const syncContactActive = (active: boolean) => {
      if (contactActiveRef.current === active) return;
      contactActiveRef.current = active;
      setContactActive(active);
    };

    const updateContactRevealTarget = () => {
      const panel = contactPanelRef.current;
      if (!panel) return;

      const viewportHeight = window.innerHeight;
      const rect = panel.getBoundingClientRect();
      const start = viewportHeight * CONTACT_REVEAL_START_VIEWPORTS;
      const end = viewportHeight * CONTACT_REVEAL_END_VIEWPORTS;
      let raw = clamp01((start - rect.top) / Math.max(start - end, 1));

      /* Sticky atteint → reveal déjà terminé (évite l’anim SVG en toute fin) */
      if (rect.top <= 8) raw = 1;

      revealTargetRef.current = raw;
    };

    const tickContactReveal = () => {
      const panel = contactPanelRef.current;
      const current = revealCurrentRef.current;
      const target = revealTargetRef.current;
      const next = current + (target - current) * CONTACT_REVEAL_LERP;

      revealCurrentRef.current = Math.abs(target - next) < 0.001 ? target : next;

      if (panel) {
        const eased = revealCurrentRef.current;
        panel.style.setProperty(
          "--contact-reveal-opacity",
          String(easeOutQuint(eased)),
        );
        panel.style.setProperty(
          "--contact-reveal-y",
          String(easeOutCubic(eased)),
        );
      }

      syncContactActive(
        revealTargetRef.current > 0.02 || revealCurrentRef.current > 0.02,
      );

      revealRafRef.current = requestAnimationFrame(tickContactReveal);
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
        setProgress(0);
        revealTargetRef.current = 1;
        revealCurrentRef.current = 1;
        if (contactPanelRef.current) {
          contactPanelRef.current.style.setProperty("--contact-reveal-opacity", "1");
          contactPanelRef.current.style.setProperty("--contact-reveal-y", "1");
        }
        syncContactActive(true);
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
      const servicesFade = Math.max(
        0,
        Math.min(1, (curtainProgress - 0.55) / 0.35),
      );

      pinTarget.style.opacity = String(Math.max(0, 1 - servicesFade));
      setProgress(curtainProgress);
      updateContactRevealTarget();

      const earlyFromCurtains = clamp01(
        (curtainProgress - CONTACT_CURTAIN_REVEAL_START) /
          CONTACT_CURTAIN_REVEAL_SPAN,
      );
      revealTargetRef.current = Math.max(
        revealTargetRef.current,
        earlyFromCurtains * 0.5,
      );
    };

    const scheduleUpdate = () => {
      if (rafRef.current !== null) return;

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        update();
      });
    };

    update();
    revealRafRef.current = requestAnimationFrame(tickContactReveal);
    const unsubscribeScroll = subscribeScrollFrame(scheduleUpdate);
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      unsubscribeScroll();
      window.removeEventListener("resize", scheduleUpdate);

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      if (revealRafRef.current !== null) {
        cancelAnimationFrame(revealRafRef.current);
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
      </div>

      <div
        className={[
          "transition-contact-flow",
          contactActive ? "transition-contact-flow--active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div ref={contactPanelRef} className="transition-contact-panel">
          <div className="transition-contact-panel__reveal">
            <section className="contact contact--on-curtains">
              <Contact />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesContactTransition;
