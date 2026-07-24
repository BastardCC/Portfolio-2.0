"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { getScrollY, shouldEmitVisualFrame, subscribeScrollFrame } from "../scroll-frame";
import { ServicesContactTransition } from "../ServicesContactTransition";
import { SERVICES, SERVICES_DESCRIPTION } from "./services-data";
import "./services.css";

const LINE_LERP = 0.08;
const TEXT_LERP = 0.06;
const TEXT_REVEAL_START = 0.62;
const TEXT_REVEAL_END = 1;
/** Même en scroll rapide, le reveal Services dure au moins ça */
const SERVICES_REVEAL_MIN_MS = 1800;
/** Lignes assez avancées → ouverture de l’accordéon (un peu avant la fin) */
const LINES_READY_THRESHOLD = 0.72;
/** Début du reveal en escalier des titres */
const TITLES_VISIBLE_THRESHOLD = 0.35;

const LINE_COUNT = SERVICES.length + 1;

const easeOutQuint = (value: number) => 1 - (1 - value) ** 5;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const getLineTarget = (progress: number, index: number, count: number) => {
  /* Une ligne après l’autre : peu de chevauchement */
  const slot = 1 / count;
  const start = index * slot;
  const duration = slot * 0.9;
  const raw = (progress - start) / duration;

  return easeOutQuint(clamp01(raw));
};

const getTextTarget = (progress: number) => {
  const raw = (progress - TEXT_REVEAL_START) / (TEXT_REVEAL_END - TEXT_REVEAL_START);

  return easeOutQuint(clamp01(raw));
};

const Services = () => {
  const [openId, setOpenId] = useState<string | null>(null);

  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef(0);
  const visualProgressRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);
  const lineTargetRef = useRef<number[]>(Array.from({ length: LINE_COUNT }, () => 0));
  const lineCurrentRef = useRef<number[]>(Array.from({ length: LINE_COUNT }, () => 0));
  const textTargetRef = useRef(0);
  const textCurrentRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const visualEmitRef = useRef(0);
  const hasAutoOpenedRef = useRef(false);

  const [lineProgress, setLineProgress] = useState<number[]>(() =>
    Array.from({ length: LINE_COUNT }, () => 0),
  );
  const [titlesVisible, setTitlesVisible] = useState(false);

  const toggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const applyText = (value: number) => {
      section.style.setProperty("--services-reveal", String(value));
    };

    const openFirstWhenReady = (lines: number[]) => {
      if (hasAutoOpenedRef.current) return;
      if (!lines.every((value) => value >= LINES_READY_THRESHOLD)) return;

      hasAutoOpenedRef.current = true;
      setOpenId((current) => current ?? SERVICES[0]?.id ?? null);
    };

    if (reducedMotion) {
      lineCurrentRef.current = Array.from({ length: LINE_COUNT }, () => 1);
      setLineProgress(Array.from({ length: LINE_COUNT }, () => 1));
      applyText(1);
      setTitlesVisible(true);
      hasAutoOpenedRef.current = true;
      setOpenId(SERVICES[0]?.id ?? null);
      return;
    }

    const updateScrollProgress = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const start = viewportHeight * 1.05;
      const end = viewportHeight * 0.12;
      const raw = (start - rect.top) / Math.max(start - end, 1);
      scrollProgressRef.current = clamp01(raw);
    };

    const tick = () => {
      const now = performance.now();
      const last = lastTickRef.current ?? now;
      const dt = Math.min(now - last, 48);
      lastTickRef.current = now;

      const scrollTarget = scrollProgressRef.current;
      let visual = visualProgressRef.current;
      const maxStep = dt / SERVICES_REVEAL_MIN_MS;

      if (scrollTarget > visual) {
        /* Cap la vitesse d’avance → entrée toujours fluide */
        visual = Math.min(scrollTarget, visual + maxStep);
      } else if (scrollTarget < visual) {
        /* Retour arrière un peu plus réactif */
        visual = Math.max(scrollTarget, visual - maxStep * 1.75);
      }

      visualProgressRef.current = visual;

      lineTargetRef.current = lineTargetRef.current.map((_, index) =>
        getLineTarget(visual, index, LINE_COUNT),
      );
      textTargetRef.current = getTextTarget(visual);

      const current = lineCurrentRef.current;
      const target = lineTargetRef.current;

      for (let index = 0; index < LINE_COUNT; index += 1) {
        current[index] += (target[index] - current[index]) * LINE_LERP;
      }

      textCurrentRef.current +=
        (textTargetRef.current - textCurrentRef.current) * TEXT_LERP;

      const { emit, now: emitNow } = shouldEmitVisualFrame(visualEmitRef.current);

      if (emit) {
        visualEmitRef.current = emitNow;
        setLineProgress([...current]);
        applyText(textCurrentRef.current);
        /* Latch : une fois visibles, ne se cachent que si on remonte vraiment */
        if (visual >= TITLES_VISIBLE_THRESHOLD) {
          setTitlesVisible(true);
        } else if (visual < TITLES_VISIBLE_THRESHOLD * 0.4) {
          setTitlesVisible(false);
        }
        openFirstWhenReady(current);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    updateScrollProgress();
    rafRef.current = requestAnimationFrame(tick);

    const unsubscribeScroll = subscribeScrollFrame(updateScrollProgress);
    window.addEventListener("resize", updateScrollProgress);

    return () => {
      unsubscribeScroll();
      window.removeEventListener("resize", updateScrollProgress);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const renderLine = (index: number) => (
    <div
      className="services__line"
      aria-hidden
      style={{
        transform: `scaleX(${lineProgress[index] ?? 0})`,
        opacity: (lineProgress[index] ?? 0) > 0.001 ? 1 : 0,
      }}
    />
  );

  return (
    <>
      <div className="services-pin-target">
        <div
          className={[
            "services",
            titlesVisible ? "services--titles-visible" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          ref={sectionRef}
          style={
            {
              "--service-count": String(SERVICES.length),
            } as CSSProperties
          }
        >
          <div className="container services__inner">
            <div className="services__accordion">
              {SERVICES.map((category, index) => {
                const isOpen = openId === category.id;

                return (
                  <div
                    key={category.id}
                    className={[
                      "services__item",
                      isOpen ? "services__item--open" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={
                      {
                        "--content-order": String(index),
                      } as CSSProperties
                    }
                  >
                    {renderLine(index)}
                    <button
                      type="button"
                      className="services__header"
                      onClick={() => toggle(category.id)}
                      aria-expanded={isOpen}
                      aria-controls={`services-panel-${category.id}`}
                    >
                      <div className="services__header-reveal">
                        <div
                          className="services__header-row"
                          style={
                            {
                              "--content-order": String(index),
                              transform: titlesVisible
                                ? "translateY(0%)"
                                : "translateY(100%)",
                              transitionDelay: titlesVisible
                                ? `${index * 0.2}s`
                                : `${(SERVICES.length - 1 - index) * 0.2}s`,
                            } as CSSProperties
                          }
                        >
                          <span className="services__label">{category.label}</span>
                          <span className="services__icon" aria-hidden>
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M10 3.5v13M4.5 11l5.5 5.5L15.5 11"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </button>

                    <div
                      id={`services-panel-${category.id}`}
                      className="services__panel"
                      role="region"
                      aria-hidden={!isOpen}
                    >
                      <div className="services__panel-inner">
                        <div className="services__groups">
                          {category.groups.map((group) => (
                            <div key={group.title} className="services__group">
                              <h4 className="services__group-title">
                                {group.title}
                              </h4>
                              <ul className="services__list">
                                {group.items.map((item) => (
                                  <li key={item} className="services__list-item">
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {renderLine(SERVICES.length)}
            </div>

            <aside className="services__intro">
              <h2 className="services__title">Services</h2>
              <p className="services__description">{SERVICES_DESCRIPTION}</p>
            </aside>
          </div>

          <div className="services__transition-anchor" aria-hidden />
        </div>
      </div>

      <ServicesContactTransition />
    </>
  );
};

export default Services;
