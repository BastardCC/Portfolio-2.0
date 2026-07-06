type ScrollFrameListener = () => void;

const scrollFrameListeners = new Set<ScrollFrameListener>();
const SCROLL_FRAME_MS = 1000 / 60;

let trackedScrollY = 0;
let lastNotify = 0;

export const getScrollY = () =>
  typeof window === "undefined" ? 0 : trackedScrollY;

export const syncScrollPosition = (scrollY: number) => {
  trackedScrollY = scrollY;
};

export const subscribeScrollFrame = (listener: ScrollFrameListener) => {
  scrollFrameListeners.add(listener);

  return () => {
    scrollFrameListeners.delete(listener);
  };
};

/** Émet aux abonnés (~60 fps max) — la position est toujours à jour via syncScrollPosition. */
export const notifyScrollFrame = () => {
  if (typeof window === "undefined") return;

  const now = performance.now();
  if (now - lastNotify < SCROLL_FRAME_MS) return;

  lastNotify = now;
  scrollFrameListeners.forEach((listener) => listener());
};

export const shouldEmitVisualFrame = (
  lastEmit: number,
  fps = 60,
): { emit: boolean; now: number } => {
  const now = performance.now();
  const interval = 1000 / fps;

  if (now - lastEmit < interval) {
    return { emit: false, now: lastEmit };
  }

  return { emit: true, now };
};
