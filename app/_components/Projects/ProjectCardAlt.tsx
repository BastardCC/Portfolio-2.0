"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type TransitionEvent,
} from "react";
import type { ProjectItem } from "./projects-data";
import "./project-card.css";
import "./project-card-alt.css";

type CurtainState = "above" | "covering" | "below";

type ProjectCardAltProps = ProjectItem;

const CURSOR_LERP = 0.12;

const isExternalHref = (href: string) => /^https?:\/\//.test(href);

const ProjectCursorIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
    className="project-card__cursor-icon"
  >
    <path
      d="M7 17L17 7M17 7H9M17 7V15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ProjectCardAlt = ({
  title,
  description,
  category,
  tags,
  image,
  bgColor,
  href,
}: ProjectCardAltProps) => {
  const cardRef = useRef<HTMLAnchorElement>(null);
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
    (event: MouseEvent<HTMLAnchorElement>) => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;

      targetRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    },
    [],
  );

  const showCurtain = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
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

  const handleFocus = useCallback(() => {
    setCurtainSnap(false);
    setCurtainState("covering");
    setCursorVisible(true);
    startFollowing();
  }, [startFollowing]);

  const hideCurtain = useCallback(() => {
    setCurtainState((state) => (state === "covering" ? "below" : state));
    setCursorVisible(false);
    stopFollowing();
  }, [stopFollowing]);

  const updatePointer = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      setTargetFromEvent(event);
    },
    [setTargetFromEvent],
  );

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

  const isHovered = curtainState === "covering";

  const curtainClassName = [
    "project-card__curtain",
    `project-card__curtain--${curtainState}`,
    curtainSnap ? "project-card__curtain--snap" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const cursorClassName = [
    "project-card__cursor",
    cursorVisible ? "project-card__cursor--visible" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const cardClassName = [
    "project-card-alt",
    isHovered ? "project-card-alt--hovered" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const cardStyle = {
    "--project-card-curtain-color": bgColor,
  } as CSSProperties;

  const cardProps = {
    ref: cardRef,
    className: cardClassName,
    style: cardStyle,
    onMouseEnter: showCurtain,
    onMouseLeave: hideCurtain,
    onMouseMove: updatePointer,
    onFocus: handleFocus,
    onBlur: hideCurtain,
    "aria-label": `Voir le projet ${title}`,
  };

  const content = (
    <>
      <span
        className={curtainClassName}
        aria-hidden
        onTransitionEnd={handleCurtainTransitionEnd}
      />
      <span ref={cursorRef} className={cursorClassName} aria-hidden>
        <ProjectCursorIcon />
      </span>

      <div className="project-card-alt__media">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 48rem) 40vw, 22vw"
          quality={90}
          className="project-card-alt__image"
        />
      </div>

      <div className="project-card-alt__body">
        <div className="project-card-alt__meta">
          <div className="project-card__tags">
            {tags.map((tag) => (
              <span key={tag} className="project-card__tag">
                {tag}
              </span>
            ))}
          </div>
          <p className="project-card-alt__category text-[12px] font-semibold uppercase">
            {category}
          </p>
        </div>

        <div className="project-card-alt__copy">
          <h3 className="project-card__title">{title}</h3>
          <p className="project-card__description">{description}</p>
        </div>
      </div>
    </>
  );

  if (isExternalHref(href)) {
    return (
      <a
        {...cardProps}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return (
    <Link {...cardProps} href={href}>
      {content}
    </Link>
  );
};

export default ProjectCardAlt;
