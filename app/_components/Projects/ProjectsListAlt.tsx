"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { ProjectItem } from "./projects-data";
import ProjectCardAlt from "./ProjectCardAlt";
import "./project-card-alt.css";

type ProjectsListAltProps = {
  projects: ProjectItem[];
};

const ProjectsListAlt = ({ projects }: ProjectsListAltProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={listRef}
      className={[
        "projects-list-alt",
        isVisible ? "projects-list-alt--visible" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--project-count": projects.length } as CSSProperties}
    >
      <div className="projects-list-alt__grid">
        <div className="projects-list-alt__lines" aria-hidden>
          <span className="projects-list-alt__line projects-list-alt__line--top" />
          <span className="projects-list-alt__line projects-list-alt__line--middle" />
          <span className="projects-list-alt__line projects-list-alt__line--bottom" />
          <span className="projects-list-alt__line projects-list-alt__line--vertical projects-list-alt__line--vertical-top" />
          <span className="projects-list-alt__line projects-list-alt__line--vertical projects-list-alt__line--vertical-bottom" />
        </div>

        {projects.map((project) => (
          <ProjectCardAlt key={`alt-${project.title}`} {...project} />
        ))}
      </div>
    </div>
  );
};

export default ProjectsListAlt;
