import type { StaticImageData } from "next/image";
import AiZara from "./assets/ai-zara.webp";
import Doonation from "./assets/doonation.webp";
import Eni from "./assets/eni.webp";
import Etafa from "./assets/etafa.webp";

export type ProjectItem = {
  title: string;
  description: string;
  category: string;
  year: string;
  tags: string[];
  bgColor: string;
  href: string;
  image: StaticImageData;
};

export const PROJECTS_DESCRIPTION =
  "A selection of projects shaped through code, detail, and collaboration.";

export const PROJECTS: ProjectItem[] = [
  {
    title: "Doonation",
    description: "Little description of the project",
    category: "Site vitrine",
    year: "2024",
    tags: ["Next.js", "TypeScript", "Tailwind", "Supabase"],
    bgColor: "#798e7b",
    href: "https://doonation.fr",
    image: Doonation,
  },
  {
    title: "Project 2",
    description: "Little description of the project",
    category: "E-commerce",
    year: "2024",
    tags: ["React", "Node.js", "Stripe", "PostgreSQL"],
    bgColor: "#B692A1",
    href: "#",
    image: Etafa,
  },
  {
    title: "Project 3",
    description: "Little description of the project",
    category: "Application web",
    year: "2023",
    tags: ["Vue", "Nuxt", "Prisma", "Docker"],
    bgColor: "#E49366",
    href: "#",
    image: Eni,
  },
  {
    title: "Project 4",
    description: "Little description of the project",
    category: "Portfolio",
    year: "2023",
    tags: ["Next.js", "Framer", "GSAP", "Figma"],
    bgColor: "#7397b7",
    href: "#",
    image: AiZara,
  },
];
