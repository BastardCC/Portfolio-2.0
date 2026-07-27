import RevealText from "../RevealText";
import { ProjectsAwardsTransition } from "../ProjectsAwardsTransition";
import ProjectsGrid from "./ProjectsGrid";
import ProjectsListAlt from "./ProjectsListAlt";
import { PROJECTS, PROJECTS_DESCRIPTION } from "./projects-data";
import "./projects.css";

const Projects = () => {
  return (
    <div>
      <div className="projects-pin-target">
        <div className="container mb-10">
          <RevealText direction="rise" triggerOnScroll once>
            <h2 className="text-[clamp(4rem,7vw+1rem,7rem)]">Projects</h2>
          </RevealText>
          <RevealText direction="rise" delay={0.15} triggerOnScroll once>
            <p className="text-[clamp(1.25rem,2.5vw+0.75rem,3.75rem)]">
              {PROJECTS_DESCRIPTION}
            </p>
          </RevealText>
        </div>

        <ProjectsGrid projects={PROJECTS} />
        <ProjectsListAlt projects={PROJECTS} />

        {/* Ancre après TOUT le contenu projets — sinon le rideau coupe la liste alt */}
        <div className="projects__transition-anchor" aria-hidden />
      </div>

      <ProjectsAwardsTransition />
    </div>
  );
};

export default Projects;
