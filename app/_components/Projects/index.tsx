import RevealText from "../RevealText";
import { ProjectsAwardsTransition } from "../ProjectsAwardsTransition";
import ProjectsGrid from "./ProjectsGrid";
import Doonation from "./assets/doonation.png";
import "./projects.css";

const projects = [
  {
    title: "Doonation",
    description: "Little description of the project",
    category: "Site vitrine",
    tags: ["Next.js", "TypeScript", "Tailwind", "Supabase"],
    bgColor: "#798e7b",
    href: "https://doonation.fr",
  },
  {
    title: "Project 2",
    description: "Little description of the project",
    category: "E-commerce",
    tags: ["React", "Node.js", "Stripe", "PostgreSQL"],
    bgColor: "#B692A1",
    href: "#",
  },
  {
    title: "Project 3",
    description: "Little description of the project",
    category: "Application web",
    tags: ["Vue", "Nuxt", "Prisma", "Docker"],
    bgColor: "#E49366",
    href: "#",
  },
  {
    title: "Project 4",
    description: "Little description of the project",
    category: "Portfolio",
    tags: ["Next.js", "Framer", "GSAP", "Figma"],
    bgColor: "#7397b7",
    href: "#",
  },
];

const Projects = () => {
  return (
    <div>
      <div className="projects-pin-target">
        <div className="container mb-10">
          <h2 className="text-[clamp(4rem,7vw+1rem,7rem)]">Projects</h2>
          <RevealText direction="rise" delay={0}>
            <p className="text-[clamp(1.25rem,2.5vw+0.75rem,3.75rem)]">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
              quos.
            </p>
          </RevealText>
        </div>

        <ProjectsGrid projects={projects} image={Doonation} />
      </div>

      <ProjectsAwardsTransition />
    </div>
  );
};

export default Projects;
