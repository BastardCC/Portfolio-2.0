import type { StaticImageData } from "next/image";
import Doonation from "./assets/doonation.webp";
import Eni from "./assets/eni.webp";
import Etafa from "./assets/etafa.webp";
import Faliana from "./assets/faliana.webp";
import mTomady from "./assets/mtomady.webp";
import SupportFlow from "./assets/support-flow.webp";
import CodeReviewBot from "./assets/code-review-bot.webp";
import FrontendAwards from "./assets/fa.webp";
import Mianava from "./assets/mianava.png";

export type ProjectItem = {
  title: string;
  description: string;
  category: string;
  tags: string[];
  bgColor: string;
  href: string;
  image: StaticImageData;
};

export const PROJECTS_DESCRIPTION =
  "A selection of projects shaped through code, detail, and collaboration.";

export const PROJECTS: ProjectItem[] = [
  {
    title: "mTomady",
    description:
      "Beneficiary management platform with billing and data interoperability",
    category: "Web application",
    tags: ["VueJs", "Ruby on Rails", "Tailwind", "PostgreSQL"],
    bgColor: "#798e7b",
    href: "https://www.mtomady.com/",
    image: mTomady,
  },
  {
    title: "ENI",
    description: "Official website of ENI's entrance exam",
    category: "Web application",
    tags: ["React", "Node", "Laravel", "PostgreSQL"],
    bgColor: "#B692A1",
    href: "https://concours.eni.mg/",
    image: Eni,
  },
  {
    title: "Client Portfolio",
    description: "Portfolio website for a client",
    category: "Portfolio website",
    tags: ["Next", "Tailwind", "Chakra UI"],
    bgColor: "#E49366",
    href: "https://nomenafaliana.com",
    image: Faliana,
  },
  {
    title: "Etafa",
    description: "Mentoring platform connecting mentors and mentees",
    category: "Web application",
    tags: ["Next", "TypeScript", "Tailwind", "Chakra UI"],
    bgColor: "#798e7b",
    href: "#",
    image: Etafa,
  },
];

export const PROJECTS_ALT: ProjectItem[] = [
  {
    title: "SupportFlow",
    description: "Automated support ticket system",
    category: "Web Application",
    tags: ["Next", "n8n", "Convex", "OpenRouter"],
    bgColor: "#798e7b",
    href: "https://github.com/BastardCC/support-flow",
    image: SupportFlow,
  },
  {
    title: "CodeReviewBot",
    description: "Github bot for code reviews",
    category: "Web Application",
    tags: ["Next", "Convex", "OpenRouter", "Github Webhooks"],
    bgColor: "#B692A1",
    href: "https://github.com/BastardCC/code-review-bot",
    image: CodeReviewBot,
  },
  {
    title: "Frontend Awards",
    description: "Website for the Frontend Award competition",
    category: "Web Application",
    tags: ["HTML", "SCSS", "JavaScript"],
    bgColor: "#E49366",
    href: "https://fa-2022-yasai.netlify.app/",
    image: FrontendAwards,
  },
  {
    title: "Mianava",
    description: "E-commerce website for Mianava",
    category: "E-commerce",
    tags: ["Next", "Isomorphic", "Symfony", "PostgreSQL"],
    bgColor: "#798e7b",
    href: "#",
    image: Mianava,
  },
];
