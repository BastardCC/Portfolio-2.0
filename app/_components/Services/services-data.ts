export type ServiceGroup = {
  title: string;
  items: string[];
};

export type ServiceCategory = {
  id: string;
  label: string;
  groups: ServiceGroup[];
};

export const SERVICES: ServiceCategory[] = [
  {
    id: "front-end",
    label: "Front-end",
    groups: [
      {
        title: "Frameworks & Libraries",
        items: ["React", "Next", "Vue", "Javascript ES6", "React Native"],
      },
      {
        title: "Styling & UI",
        items: ["Tailwind", "CSS", "Sass", "Framer Motion", "GSAP"],
      },
      {
        title: "Web & Animation",
        items: ["Three.js", "WebGL", "Lenis", "Canvas", "SVG"],
      },
    ],
  },
  {
    id: "back-end",
    label: "Back-end",
    groups: [
      {
        title: "Langages & Runtime",
        items: ["Node.js", "TypeScript", "Python", "PHP"],
      },
      {
        title: "Bases de données",
        items: ["PostgreSQL", "MongoDB", "Supabase", "Prisma"],
      },
      {
        title: "API & Services",
        items: ["REST", "GraphQL", "Stripe", "Auth"],
      },
    ],
  },
  {
    id: "automatisation",
    label: "Automatisation",
    groups: [
      {
        title: "CI / CD",
        items: ["GitHub Actions", "Vercel", "Docker"],
      },
      {
        title: "Outils",
        items: ["n8n", "Zapier", "Webhooks"],
      },
      {
        title: "Tests & Qualité",
        items: ["Vitest", "Playwright", "ESLint"],
      },
    ],
  },
];

export const SERVICES_DESCRIPTION =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
