"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { getScrollY, shouldEmitVisualFrame, subscribeScrollFrame } from "../scroll-frame";
import { SERVICES, SERVICES_DESCRIPTION } from "./services-data";
import "./services.css";

const LINE_LERP = 0.1;
const TEXT_LERP = 0.08;
const TEXT_REVEAL_START = 0.62;
const TEXT_REVEAL_END = 1;

const LINE_COUNT = SERVICES.length + 1;

const easeOutQuint = (value: number) => 1 - (1 - value) ** 5;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const getLineTarget = (progress: number, index: number, count: number) => {
  const spread = 1 / count;
  const start = index * spread * 0.7;
  const duration = spread * 1.45;
  const raw = (progress - start) / duration;

  return easeOutQuint(clamp01(raw));
};

const getTextTarget = (progress: number) => {
  const raw = (progress - TEXT_REVEAL_START) / (TEXT_REVEAL_END - TEXT_REVEAL_START);

  return easeOutQuint(clamp01(raw));
};

const Services = () => {
  const [openId, setOpenId] = useState<string | null>(SERVICES[0]?.id ?? null);

  const sectionRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const lineTargetRef = useRef<number[]>(Array.from({ length: LINE_COUNT }, () => 0));
  const lineCurrentRef = useRef<number[]>(Array.from({ length: LINE_COUNT }, () => 0));
  const textTargetRef = useRef(0);
  const textCurrentRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const visualEmitRef = useRef(0);

  const [lineProgress, setLineProgress] = useState<number[]>(() =>
    Array.from({ length: LINE_COUNT }, () => 0),
  );

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

    if (reducedMotion) {
      lineCurrentRef.current = Array.from({ length: LINE_COUNT }, () => 1);
      setLineProgress(Array.from({ length: LINE_COUNT }, () => 1));
      applyText(1);
      return;
    }

    const updateTarget = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const start = viewportHeight * 0.9;
      const end = viewportHeight * 0.32;
      const raw = (start - rect.top) / Math.max(start - end, 1);
      const progress = clamp01(raw);

      progressRef.current = progress;
      lineTargetRef.current = lineTargetRef.current.map((_, index) =>
        getLineTarget(progress, index, LINE_COUNT),
      );
      textTargetRef.current = getTextTarget(progress);
    };

    const tick = () => {
      const current = lineCurrentRef.current;
      const target = lineTargetRef.current;

      for (let index = 0; index < LINE_COUNT; index += 1) {
        current[index] += (target[index] - current[index]) * LINE_LERP;
      }

      textCurrentRef.current +=
        (textTargetRef.current - textCurrentRef.current) * TEXT_LERP;

      const { emit, now } = shouldEmitVisualFrame(visualEmitRef.current);

      if (emit) {
        visualEmitRef.current = now;
        setLineProgress([...current]);
        applyText(textCurrentRef.current);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    updateTarget();
    rafRef.current = requestAnimationFrame(tick);

    const unsubscribeScroll = subscribeScrollFrame(updateTarget);
    window.addEventListener("resize", updateTarget);

    return () => {
      unsubscribeScroll();
      window.removeEventListener("resize", updateTarget);
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
    <div className="services" ref={sectionRef}>
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
              >
                {renderLine(index)}
                <button
                  type="button"
                  className="services__header"
                  onClick={() => toggle(category.id)}
                  aria-expanded={isOpen}
                  aria-controls={`services-panel-${category.id}`}
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
    </div>
  );
};

export default Services;
