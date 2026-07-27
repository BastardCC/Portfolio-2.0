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
        items: ["React", "Next", "Vue", "React Native", "Javascript ES6"],
      },
      {
        title: "Styling & UI",
        items: ["Tailwind", "Material UI", "Framer Motion", "Styled Components", "Chakra UI"],
      },
      {
        title: "Design & Animation",
        items: ["Three.js", "WebGL", "Lenis", "SVG", "Figma"],
      },
    ],
  },
  {
    id: "back-end",
    label: "Back-end",
    groups: [
      {
        title: "Langages & Runtime",
        items: ["Node.js", "TypeScript","Ruby"],
      },
      {
        title: "Bases de données",
        items: ["PostgreSQL", "MongoDB", "Supabase", "Prisma", "Convex"],
      },
      {
        title: "API & Services",
        items: ["REST", "Stripe", "Auth"],
      },
    ],
  },
  {
    id: "automatisation",
    label: "Automatisation",
    groups: [
      {
        title: "CI / CD",
        items: ["GitHub Actions", "Vercel", "Netlify", "Docker"],
      },
      {
        title: "Outils",
        items: ["n8n", "Webhooks"],
      },
      {
        title: "Tests & Qualité",
        items: ["Vitest", "Jest", "ESLint"],
      },
    ],
  },
];

export const SERVICES_DESCRIPTION =
  "Fast, fluid web experiences — front-end to automation, with modern stacks, thoughtful motion, and architecture ready to ship.";
