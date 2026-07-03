"use client";

import { CURTAIN_COUNT } from "./transition-math";

type TransitionCurtainsProps = {
  appears: number[];
};

const TransitionCurtains = ({ appears }: TransitionCurtainsProps) => {
  return (
    <div className="transition-curtains" aria-hidden>
      {Array.from({ length: CURTAIN_COUNT }, (_, index) => {
        const bottomIndex = CURTAIN_COUNT - 1 - index;
        const appear = appears[bottomIndex] ?? 0;

        return (
          <div key={index} className="transition-curtain-slot">
            <div
              className="transition-curtain"
              style={{
                transform: `translate3d(0, ${(1 - appear) * 100}%, 0)`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default TransitionCurtains;
