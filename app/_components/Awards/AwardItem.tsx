"use client";

import Image, { type StaticImageData } from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type TransitionEvent,
} from "react";

type CurtainState = "above" | "covering" | "below";

type AwardItemProps = {
  award: {
    title: string;
    description: string;
    image: StaticImageData;
  };
  index: number;
  lineProgress: number;
};

const CURSOR_LERP = 0.12;

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

const AwardItem = ({ award, index, lineProgress }: AwardItemProps) => {
  const itemRef = useRef<HTMLElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const isFollowingRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const [curtainState, setCurtainState] = useState<CurtainState>("above");
  const [curtainSnap, setCurtainSnap] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(false);
  const curtainStateRef = useRef<CurtainState>("above");
  curtainStateRef.current = curtainState;

  const setCursorPosition = useCallback((x: number, y: number) => {
    if (!cursorRef.current) return;
    cursorRef.current.style.setProperty("--cursor-x", `${x}px`);
    cursorRef.current.style.setProperty("--cursor-y", `${y}px`);
  }, []);

  const animateCursor = useCallback(() => {
    const current = currentRef.current;
    const target = targetRef.current;

    current.x += (target.x - current.x) * CURSOR_LERP;
    current.y += (target.y - current.y) * CURSOR_LERP;
    setCursorPosition(current.x, current.y);

    if (isFollowingRef.current) {
      rafRef.current = requestAnimationFrame(animateCursor);
    }
  }, [setCursorPosition]);

  const startFollowing = useCallback(() => {
    isFollowingRef.current = true;
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(animateCursor);
    }
  }, [animateCursor]);

  const stopFollowing = useCallback(() => {
    isFollowingRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const setTargetFromEvent = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      const rect = itemRef.current?.getBoundingClientRect();
      if (!rect) return;

      targetRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    },
    [],
  );

  const showCurtain = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      setCurtainSnap(false);
      setCurtainState("covering");
      setTargetFromEvent(event);

      const { x, y } = targetRef.current;
      currentRef.current = { x, y };
      setCursorPosition(x, y);
      setCursorVisible(true);
      startFollowing();
    },
    [setCursorPosition, setTargetFromEvent, startFollowing],
  );

  const hideCurtain = useCallback(() => {
    setCurtainState((state) => (state === "covering" ? "below" : state));
    setCursorVisible(false);
    stopFollowing();
  }, [stopFollowing]);

  const updatePointer = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      setTargetFromEvent(event);
    },
    [setTargetFromEvent],
  );

  const handleFocus = useCallback(() => {
    setCurtainSnap(false);
    setCurtainState("covering");
    setCursorVisible(true);
    startFollowing();
  }, [startFollowing]);

  const handleCurtainTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLSpanElement>) => {
      if (event.propertyName !== "transform") return;
      if (curtainStateRef.current !== "below") return;

      setCurtainSnap(true);
      setCurtainState("above");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setCurtainSnap(false));
      });
    },
    [],
  );

  useEffect(() => () => stopFollowing(), [stopFollowing]);

  const curtainClassName = [
    "awards-item__curtain",
    `awards-item__curtain--${curtainState}`,
    curtainSnap ? "awards-item__curtain--snap" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const cursorClassName = [
    "awards-item__cursor",
    cursorVisible ? "awards-item__cursor--visible" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const isHovered = curtainState === "covering";

  return (
    <article
      ref={itemRef}
      className={[
        "awards-item",
        isHovered ? "awards-item--hovered" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--content-order": index } as CSSProperties}
      onMouseEnter={showCurtain}
      onMouseLeave={hideCurtain}
      onMouseMove={updatePointer}
      onFocus={handleFocus}
      onBlur={hideCurtain}
      tabIndex={0}
    >
      <span ref={cursorRef} className={cursorClassName} aria-hidden>
        <Image
          src={award.image}
          alt=""
          fill
          sizes="120px"
          className="awards-item__cursor-image"
        />
      </span>
      <div className="awards-item__clip">
        <span
          className={curtainClassName}
          aria-hidden
          onTransitionEnd={handleCurtainTransitionEnd}
        />
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
            transform: `scaleX(${lineProgress})`,
            opacity: lineProgress > 0 ? 1 : 0,
          }}
        />
      </div>
    </article>
  );
};

export default AwardItem;
