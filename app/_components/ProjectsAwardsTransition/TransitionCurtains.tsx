"use client";

import type { CSSProperties } from "react";
import { CURTAIN_COUNT } from "./transition-math";

type TransitionCurtainsProps = {
  lifts: number[];
  visible: boolean;
};

const TransitionCurtains = ({ lifts, visible }: TransitionCurtainsProps) => {
  if (!visible) return null;

  return (
    <div
      className="transition-curtains"
      style={{ "--curtain-count": CURTAIN_COUNT } as CSSProperties}
      aria-hidden
    >
      {lifts.map((lift, bottomIndex) => (
        <span
          key={bottomIndex}
          className="transition-curtain"
          style={
            {
              "--curtain-index": bottomIndex,
              transform: `translate3d(0, calc(${lift} * 100vh), 0)`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
};

export default TransitionCurtains;
