"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { StaticImageData } from "next/image";
import ProjectCard from "./ProjectCard";
import ProjectCardReveal from "./ProjectCardReveal";
import "./projects.css";

export type Project = {
  title: string;
  description: string;
  category: string;
  tags: string[];
  bgColor: string;
  href: string;
};

type ProjectsGridProps = {
  projects: Project[];
  image: StaticImageData;
};

const ProjectsGrid = ({ projects, image }: ProjectsGridProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = gridRef.current;
    if (!node) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        requestAnimationFrame(() => {
          setIsVisible(true);
        });

        observer.disconnect();
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const mobileDividerPositions = Array.from(
    { length: Math.max(projects.length - 1, 0) },
    (_, index) => `${((index + 1) / projects.length) * 100}%`,
  );

  const showDesktopMiddle = projects.length > 2;
  const showDesktopVertical = projects.length > 1;

  return (
    <div
      ref={gridRef}
      className={[
        "projects-grid",
        "grid grid-cols-1 md:grid-cols-2",
        isVisible ? "projects-grid--visible" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--project-count": projects.length } as CSSProperties}
    >
      <div className="projects-grid__lines" aria-hidden>
        <span className="projects-grid__line projects-grid__line--edge projects-grid__line--top projects-grid__line--desktop" />
        {showDesktopMiddle ? (
          <span className="projects-grid__line projects-grid__line--edge projects-grid__line--middle projects-grid__line--desktop" />
        ) : null}
        <span className="projects-grid__line projects-grid__line--edge projects-grid__line--bottom projects-grid__line--desktop" />
        {showDesktopVertical ? (
          <>
            <span className="projects-grid__line projects-grid__line--vertical projects-grid__line--vertical-top projects-grid__line--desktop" />
            <span className="projects-grid__line projects-grid__line--vertical projects-grid__line--vertical-bottom projects-grid__line--desktop" />
          </>
        ) : null}

        <span className="projects-grid__line projects-grid__line--edge projects-grid__line--top projects-grid__line--mobile" />
        {mobileDividerPositions.map((position, index) => (
          <span
            key={position}
            className="projects-grid__line projects-grid__line--edge projects-grid__line--mobile"
            style={
              {
                "--line-position": position,
                "--line-index": index + 1,
              } as CSSProperties
            }
          />
        ))}
        <span className="projects-grid__line projects-grid__line--edge projects-grid__line--bottom projects-grid__line--mobile" />
      </div>

      {projects.map((project, index) => (
        <ProjectCardReveal key={project.title} index={index}>
          <ProjectCard {...project} image={image} />
        </ProjectCardReveal>
      ))}
    </div>
  );
};

export default ProjectsGrid;
