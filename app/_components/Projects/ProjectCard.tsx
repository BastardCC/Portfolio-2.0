"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import "./project-card.css";

type CurtainState = "above" | "covering" | "below";

type ProjectCardProps = {
  title: string;
  description: string;
  category: string;
  tags: string[];
  image: StaticImageData;
  bgColor: string;
  href: string;
};

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

const ProjectCard = ({
  title,
  description,
  category,
  tags,
  image,
  bgColor,
  href,
}: ProjectCardProps) => {
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

  const setTargetFromEvent = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    targetRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }, []);

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
    (event: React.TransitionEvent<HTMLSpanElement>) => {
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

  const cardStyle = {
    "--project-card-curtain-color": bgColor,
  } as CSSProperties;

  const cardProps = {
    ref: cardRef,
    className: "project-card",
    style: cardStyle,
    onMouseEnter: showCurtain,
    onMouseLeave: hideCurtain,
    onMouseMove: updatePointer,
    onFocus: handleFocus,
    onBlur: hideCurtain,
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
      <header className="project-card__header">
        <div className="project-card__text-reveal">
          <h3 className="project-card__title">{title}</h3>
        </div>
        <div className="project-card__text-reveal project-card__text-reveal--delay">
          <p className="project-card__description">{description}</p>
        </div>
      </header>

      <div className="project-card__media">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="project-card__image"
        />
        <div className="project-card__media-caption">
          <div className="project-card__text-reveal project-card__text-reveal--in">
            <h3 className="project-card__title">{title}</h3>
          </div>
        </div>
      </div>

      <footer className="project-card__footer">
        <p className="text-[12px] font-semibold uppercase">{category}</p>
        <div className="project-card__tags">
          {tags.map((tag) => (
            <span key={tag} className="project-card__tag">
              {tag}
            </span>
          ))}
        </div>
      </footer>
    </>
  );

  if (isExternalHref(href)) {
    return (
      <a
        {...cardProps}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Voir le projet ${title}`}
      >
        {content}
      </a>
    );
  }

  return (
    <Link {...cardProps} href={href} aria-label={`Voir le projet ${title}`}>
      {content}
    </Link>
  );
};

export default ProjectCard;
