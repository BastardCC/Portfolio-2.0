export const CURTAIN_COUNT = 5;

const easeOutQuint = (value: number) => 1 - (1 - value) ** 5;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

/** bottomIndex 0 = rideau du bas, qui monte en premier */
export const getCurtainLift = (progress: number, bottomIndex: number) => {
  const stagger = 0.14;
  const duration = 0.26;
  const start = bottomIndex * stagger;
  const reveal = easeOutQuint(clamp01((progress - start) / duration));

  return 1 - reveal;
};

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
