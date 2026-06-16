import type { CSSProperties, ReactNode } from "react";
import "./reveal-text.css";

type RevealTextBaseProps = {
  direction?: "rise" | "descend";
  /** Délai avant le début de l'animation (secondes) */
  delay?: number;
  /** Durée de l'animation (secondes) */
  duration?: number;
  className?: string;
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

const RevealText = ({
  direction = "rise",
  delay,
  duration,
  staggerDelay = 0.18,
  className = "",
  lineClassName = "",
  lines,
  children,
}: RevealTextProps) => {
  if (lines?.length) {
    return (
      <div
        className={`reveal-lines ${className}`.trim()}
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
      className={`reveal-text reveal-text--${direction} ${className}`.trim()}
      style={revealStyle(delay, duration)}
    >
      {children}
    </div>
  );
};

export default RevealText;
