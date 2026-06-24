"use client";

import type { CSSProperties, ReactNode } from "react";
import "./projects.css";

type ProjectCardRevealProps = {
  index: number;
  children: ReactNode;
};

const ProjectCardReveal = ({ index, children }: ProjectCardRevealProps) => {
  return (
    <div
      className="projects-grid__item"
      style={{ "--item-index": index } as CSSProperties}
    >
      {children}
    </div>
  );
};

export default ProjectCardReveal;
