"use client";

import type { StaticImageData } from "next/image";
import type { CSSProperties } from "react";
import AwardItem from "./AwardItem";
import "./awards.css";

export type Award = {
  title: string;
  description: string;
  image: StaticImageData;
};

type AwardListProps = {
  awards: Award[];
  lineProgress: number[];
  contentVisible: boolean;
};

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
      style={{ "--award-count": awards.length } as CSSProperties}
    >
      <div
        className="awards-item__line awards-list__lead-line"
        aria-hidden
        style={{
          transform: `scaleX(${lineProgress[0] ?? 0})`,
          opacity: (lineProgress[0] ?? 0) > 0.001 ? 1 : 0,
        }}
      />
      {awards.map((award, index) => {
        const progress = lineProgress[index + 1] ?? 0;

        return (
          <AwardItem
            key={award.title}
            award={award}
            index={index}
            lineProgress={progress}
            isInteractive={contentVisible && progress >= 0.92}
          />
        );
      })}
    </div>
  );
};

export default AwardList;
