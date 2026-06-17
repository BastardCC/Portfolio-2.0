"use client";

import Image, { type StaticImageData } from "next/image";
import { useCallback, useRef, useState, type CSSProperties } from "react";
import "./project-card.css";

type CurtainState = "above" | "covering" | "below";

type ProjectCardProps = {
  title: string;
  description: string;
  category: string;
  tags: string[];
  image: StaticImageData;
  bgColor: string;
};

const ProjectCard = ({
  title,
  description,
  category,
  tags,
  image,
  bgColor,
}: ProjectCardProps) => {
  const [curtainState, setCurtainState] = useState<CurtainState>("above");
  const [curtainSnap, setCurtainSnap] = useState(false);
  const curtainStateRef = useRef<CurtainState>("above");
  curtainStateRef.current = curtainState;

  const showCurtain = useCallback(() => {
    setCurtainSnap(false);
    setCurtainState("covering");
  }, []);

  const hideCurtain = useCallback(() => {
    setCurtainState((state) => (state === "covering" ? "below" : state));
  }, []);

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

  const curtainClassName = [
    "project-card__curtain",
    `project-card__curtain--${curtainState}`,
    curtainSnap ? "project-card__curtain--snap" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      className="project-card"
      style={{ "--project-card-curtain-color": bgColor } as CSSProperties}
      tabIndex={0}
      onMouseEnter={showCurtain}
      onMouseLeave={hideCurtain}
      onFocus={showCurtain}
      onBlur={hideCurtain}
    >
      <span
        className={curtainClassName}
        aria-hidden
        onTransitionEnd={handleCurtainTransitionEnd}
      />
      <header className="project-card__header">
        <div className="project-card__text-reveal">
          <h3 className="text-4xl">{title}</h3>
        </div>
        <div className="project-card__text-reveal project-card__text-reveal--delay">
          <p>{description}</p>
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
            <h3 className="text-4xl">{title}</h3>
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
    </article>
  );
};

export default ProjectCard;
