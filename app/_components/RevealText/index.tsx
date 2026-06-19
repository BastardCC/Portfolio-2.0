"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import "./reveal-text.css";

type RevealTextBaseProps = {
  direction?: "rise" | "descend";
  /** Délai avant le début de l'animation (secondes) */
  delay?: number;
  /** Durée de l'animation (secondes) */
  duration?: number;
  className?: string;
  /** Déclencher l'animation au scroll (Intersection Observer) */
  triggerOnScroll?: boolean;
  /** Ne jouer l'animation qu'une seule fois */
  once?: boolean;
  /** Marge autour du viewport pour déclencher plus tôt / plus tard */
  rootMargin?: string;
};

type RevealTextLinesProps = RevealTextBaseProps & {
  lines: string[];
  lineClassName?: string;
  /** Délai entre chaque ligne (secondes) */
  staggerDelay?: number;
  children?: never;
};

type RevealTextChildProps = RevealTextBaseProps & {
  children: ReactNode;
  lines?: never;
  lineClassName?: never;
  staggerDelay?: never;
};

type RevealTextProps = RevealTextLinesProps | RevealTextChildProps;

const revealStyle = (
  delay?: number,
  duration?: number,
  staggerDelay?: number,
): CSSProperties =>
  ({
    ...(delay !== undefined && { "--reveal-delay": `${delay}s` }),
    ...(duration !== undefined && { "--reveal-duration": `${duration}s` }),
    ...(staggerDelay !== undefined && { "--reveal-stagger": `${staggerDelay}s` }),
  }) as CSSProperties;

const useRevealInView = (
  enabled: boolean,
  once: boolean,
  rootMargin: string,
) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setIsVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setIsVisible(true);
        if (once) observer.disconnect();
      },
      { rootMargin, threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, once, rootMargin]);

  return { ref, isVisible };
};

const RevealText = ({
  direction = "rise",
  delay,
  duration,
  staggerDelay = 0.18,
  className = "",
  lineClassName = "",
  lines,
  children,
  triggerOnScroll = true,
  once = true,
  rootMargin = "0px 0px -8% 0px",
}: RevealTextProps) => {
  const { ref, isVisible } = useRevealInView(triggerOnScroll, once, rootMargin);

  if (lines?.length) {
    return (
      <div
        ref={ref}
        className={[
          "reveal-lines",
          isVisible ? "reveal-lines--visible" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={revealStyle(delay, duration, staggerDelay)}
      >
        {lines.map((line, index) => (
          <div
            key={`${line}-${index}`}
            className={`reveal-text reveal-text--${direction}`}
          >
            <span
              className={`reveal-text__line ${lineClassName}`.trim()}
              style={{ "--line-index": index } as CSSProperties}
            >
              {line}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={[
        "reveal-text",
        `reveal-text--${direction}`,
        isVisible ? "reveal-text--visible" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={revealStyle(delay, duration)}
    >
      {children}
    </div>
  );
};

export default RevealText;
