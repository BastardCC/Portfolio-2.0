export const CURTAIN_COUNT = 5;
export const CURTAIN_STAGGER = 0.16;
export const CURTAIN_DURATION = 0.42;
/** Partie du progress scroll réservée à l'apparition (identique à la démo) */
export const CURTAIN_APPEAR_ZONE = 0.4;
/**
 * Distance de scroll (en × viewport) pour progress 0→1.
 * Avec CURTAIN_APPEAR_ZONE, la séquence se termine vers 42 % de cette distance (~1,6 viewport).
 */
export const APPEAR_SCROLL_VIEWPORTS = 3.85;

const easeOutQuint = (value: number) => 1 - (1 - value) ** 5;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

/** bottomIndex 0 = rideau du bas — progress 0→1, 0 = caché, 1 = en place */
export const getCurtainAppear = (progress: number, bottomIndex: number) => {
  const appearProgress = clamp01(progress / CURTAIN_APPEAR_ZONE);
  const start = bottomIndex * CURTAIN_STAGGER;

  return easeOutQuint(clamp01((appearProgress - start) / CURTAIN_DURATION));
};

export const areCurtainsComplete = (progress: number) =>
  Array.from({ length: CURTAIN_COUNT }, (_, bottomIndex) =>
    getCurtainAppear(progress, bottomIndex),
  ).every((appear) => appear >= 0.9);

export const measureTransitionProgress = (
  zoneTop: number,
  zoneHeight: number,
  viewportHeight: number,
) => {
  if (zoneTop > 0) return 0;

  const scrollable = Math.max(zoneHeight - viewportHeight, 1);
  const scrolled = Math.min(Math.max(-zoneTop, 0), scrollable);

  return scrolled / scrollable;
};
