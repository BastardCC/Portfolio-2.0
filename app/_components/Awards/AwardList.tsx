"use client";

import type { CSSProperties } from "react";
import "./awards.css";

export type Award = {
  title: string;
  description: string;
};

type AwardListProps = {
  awards: Award[];
  lineProgress: number[];
  contentVisible: boolean;
};

const AwardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M8 14h8l1 6H7l1-6z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const AwardList = ({
  awards,
  lineProgress,
  contentVisible,
}: AwardListProps) => {
  return (
    <div
      className={[
        "awards-list",
        contentVisible ? "awards-list--content-visible" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {awards.map((award, index) => {
        const progress = lineProgress[index] ?? 0;

        return (
          <article
            key={award.title}
            className="awards-item"
            style={{ "--content-order": awards.length - 1 - index } as CSSProperties}
          >
            <div className="awards-item__reveal">
              <div className="awards-item__row">
                <h3 className="awards-item__title">{award.title}</h3>
                <p className="awards-item__description">{award.description}</p>
                <span className="awards-item__icon" aria-hidden>
                  <AwardIcon />
                </span>
              </div>
            </div>
            <div
              className="awards-item__line"
              aria-hidden
              style={{
                transform: `scaleX(${progress})`,
              }}
            />
          </article>
        );
      })}
    </div>
  );
};

export default AwardList;
