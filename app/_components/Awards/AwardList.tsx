"use client";

import type { StaticImageData } from "next/image";
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
    >
      {awards.map((award, index) => (
        <AwardItem
          key={award.title}
          award={award}
          index={index}
          lineProgress={lineProgress[index] ?? 0}
        />
      ))}
    </div>
  );
};

export default AwardList;
