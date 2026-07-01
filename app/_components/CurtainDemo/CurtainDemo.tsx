"use client";

import { useEffect, useRef, useState } from "react";
import "./curtain-demo.css";

const CURTAIN_COUNT = 5;
const CURTAIN_STAGGER = 0.16;
const CURTAIN_DURATION = 0.42;
/** Partie du scroll réservée à l'apparition ; au-delà les rideaux restent en place */
const APPEAR_ZONE = 0.4;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const easeOutQuint = (value: number) => 1 - (1 - value) ** 5;

const measureScrollProgress = (
  zoneTop: number,
  zoneHeight: number,
  viewportHeight: number,
) => {
  if (zoneTop > 0) return 0;

  const scrollable = Math.max(zoneHeight - viewportHeight, 1);
  const scrolled = Math.min(Math.max(-zoneTop, 0), scrollable);

  return scrolled / scrollable;
};

/** 0 = caché en bas, 1 = en place — bidirectionnel au scroll */
const getCurtainAppear = (progress: number, bottomIndex: number) => {
  const appearProgress = clamp01(progress / APPEAR_ZONE);
  const start = bottomIndex * CURTAIN_STAGGER;

  return easeOutQuint(clamp01((appearProgress - start) / CURTAIN_DURATION));
};

const CurtainDemo = () => {
  const zoneRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone) return;

    const update = () => {
      const viewportHeight = window.innerHeight;
      const rect = zone.getBoundingClientRect();

      setProgress(
        measureScrollProgress(rect.top, zone.offsetHeight, viewportHeight),
      );
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div ref={zoneRef} className="curtain-demo-zone">
      <div className="curtain-demo-sticky">
        <div className="curtain-demo-stage" aria-hidden />

        <div className="curtain-demo-curtains" aria-hidden>
          {Array.from({ length: CURTAIN_COUNT }, (_, index) => {
            const bottomIndex = CURTAIN_COUNT - 1 - index;
            const appear = getCurtainAppear(progress, bottomIndex);

            return (
              <div key={index} className="curtain-demo-slot">
                <div
                  className="curtain-demo-curtain"
                  style={{
                    transform: `translate3d(0, ${(1 - appear) * 100}%, 0)`,
                  }}
                />
              </div>
            );
          })}
        </div>

        <p className="curtain-demo-debug" aria-hidden>
          {Math.round(progress * 100)}%
        </p>
      </div>
    </div>
  );
};

export default CurtainDemo;
