import RevealText from "../RevealText";
import ProjectCard from "./ProjectCard";
import Doonation from "./assets/doonation.png";

const projects = [
  {
    title: "Doonation",
    description: "Little description of the project",
    category: "Site vitrine",
    tags: ["Next.js", "TypeScript", "Tailwind", "Supabase"],
  },
  {
    title: "Project 2",
    description: "Little description of the project",
    category: "E-commerce",
    tags: ["React", "Node.js", "Stripe", "PostgreSQL"],
  },
  {
    title: "Project 3",
    description: "Little description of the project",
    category: "Application web",
    tags: ["Vue", "Nuxt", "Prisma", "Docker"],
  },
  {
    title: "Project 4",
    description: "Little description of the project",
    category: "Portfolio",
    tags: ["Next.js", "Framer", "GSAP", "Figma"],
  },
];

const Projects = () => {
  return (
    <div>
      <div className="container mb-10">
        <h2 className="text-[clamp(4rem,7vw+1rem,7rem)]">Projects</h2>
        <RevealText direction="rise" delay={0.65}>
          <p className="text-[clamp(1.25rem,2.5vw+0.75rem,3.75rem)]">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
            quos.
          </p>
        </RevealText>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.title} {...project} image={Doonation} />
        ))}
      </div>
    </div>
  );
};

export default Projects;
