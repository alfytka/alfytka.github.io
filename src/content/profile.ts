// Single source of truth for everything the site says about Alfitka.
// Source: CV supplied on 2026-11-13. Verify before publishing.

export type YearMonth = `${number}-${number}`; // "2026-02"

export const person = {
  name: "Alfitka Haerul Kurniawan",
  shortName: "Alfitka H. Kurniawan",
  role: "Front-End Developer",
  location: "Tangerang Selatan, Indonesia",
  timeZone: "Asia/Jakarta",
  timeZoneLabel: "GMT+7",
  email: "alfytka@gmail.com",
  site: "https://alfytka.github.io",
  links: {
    github: "https://github.com/alfytka",
    githubLabel: "alfytka",
    linkedin: "https://www.linkedin.com/in/alfitka-haerul-kurniawan",
    linkedinLabel: "in/alfitka-haerul-kurniawan",
    // This site's own repository; specimens link to their source files in it.
    source: "https://github.com/alfytka/alfytka.github.io",
    cv: "/cv-alfitka-haerul-kurniawan.pdf",
  },
} as const;

export const intro = {
  statement:
    "Front-end developer at Universitas Terbuka. I build the data-heavy internal tools behind its administrative and academic work — tables, forms and dashboards.",
  supporting:
    "Three years in, after starting full-stack with Laravel and PostgreSQL. These days I work in React, Next.js and TypeScript, and I care most about the parts of an interface people touch all day: a filter that remembers, an error that explains itself, a table that stays readable when the data doesn’t fit.",
  now: "E-Tax Management, Universitas Terbuka",
  openTo: "Remote front-end roles, in Indonesia or abroad",
  studying: { label: "Information Systems, Universitas Terbuka", years: "2024–2028" },
} as const;

export type Project = {
  id: string;
  title: string;
  dates: string;
  role: string;
  stack: string[];
  description: string;
};

export const projects: Project[] = [
  {
    id: "e-tax",
    title: "E-Tax Management",
    dates: "2026 — now",
    role: "Front-End Developer",
    stack: ["Next.js", "TypeScript", "Zustand", "Zod", "TanStack Query", "TanStack Table"],
    description:
      "An internal app for the university’s tax administration. I build the client side with the team: data tables with server-side filtering, sorting and pagination, forms validated with Zod before anything reaches the API, and shared state kept small with Zustand.",
  },
  {
    id: "academic-dashboard",
    title: "Academic Data Dashboard",
    dates: "2023 — 2026",
    role: "Full-Stack Developer",
    stack: ["React", "TypeScript", "Laravel", "PostgreSQL", "TanStack Query", "Zod"],
    description:
      "An internal dashboard for academic operations, built and maintained with the team. I worked end to end: React and TypeScript on the client, REST APIs in Laravel, and the PostgreSQL schema behind them. Zod kept what the forms accepted in step with what the server expected.",
  },
];

export type Role = {
  id: string;
  title: string;
  org: string;
  context: string;
  start: YearMonth;
  end: YearMonth | null; // null = current
  axisLabel: string;
  axisShort: string;
  tone: "current" | "past" | "early";
};

export const roles: Role[] = [
  {
    id: "front-end",
    title: "Front-End Developer",
    org: "Universitas Terbuka",
    context: "Universitas Terbuka — E-Tax Management",
    start: "2026-02",
    end: null,
    axisLabel: "Front-End",
    axisShort: "FE",
    tone: "current",
  },
  {
    id: "full-stack",
    title: "Full-Stack Developer",
    org: "Universitas Terbuka",
    context: "Universitas Terbuka — Academic Data Dashboard",
    start: "2023-10",
    end: "2026-01",
    axisLabel: "Full-Stack",
    axisShort: "Full-Stack",
    tone: "past",
  },
  {
    id: "intern",
    title: "Software Developer Intern",
    org: "CV. Access Media",
    context:
      "CV. Access Media — built SIPWKS, tested web apps in development, wrote user guides and recorded video tutorials. Final score 91/100.",
    start: "2022-02",
    end: "2022-04",
    axisLabel: "Intern",
    axisShort: "",
    tone: "early",
  },
];

export type Study = {
  id: string;
  label: string;
  short: string;
  start: YearMonth;
  end: YearMonth;
};

// Month precision is approximate: the CV lists years only.
export const studies: Study[] = [
  { id: "smk", label: "SMKN 3 Banjar", short: "SMK", start: "2020-07", end: "2023-06" },
  {
    id: "ut",
    label: "Information Systems, Universitas Terbuka",
    short: "Information Systems",
    start: "2024-01",
    end: "2028-12",
  },
];

export const toolbox: { label: string; items: string }[] = [
  { label: "Languages", items: "TypeScript, JavaScript, PHP" },
  { label: "Interface", items: "React, Next.js, Vue, React Router, Vue Router" },
  { label: "Data & state", items: "TanStack Query, TanStack Table, Zustand, Pinia, Context" },
  { label: "Forms", items: "React Hook Form, Zod, VeeValidate" },
  { label: "Styling", items: "Tailwind CSS, shadcn/ui, Bootstrap, CSS" },
  { label: "Back-end", items: "Laravel, Node.js, Express" },
  { label: "Databases", items: "PostgreSQL, MySQL, MongoDB, Supabase" },
  { label: "Tools", items: "GitHub, GitLab, Playwright, Bruno, Postman, DBeaver, Zed, VS Code, Claude" },
];

export const education: { org: string; detail: string; years: string }[] = [
  { org: "Universitas Terbuka", detail: "Bachelor’s, Information Systems", years: "2024 — 2028" },
  { org: "SMK Negeri 3 Banjar", detail: "Software Engineering", years: "2020 — 2023" },
  { org: "Microsoft", detail: "Data Engineering on Microsoft Azure", years: "2025" },
  {
    org: "LKS SMK Jawa Barat",
    detail: "IT Software Solution for Business — provincial competitor",
    years: "2022",
  },
];

export const about = {
  body: "I first built for the web in a software engineering class at SMKN 3 Banjar, West Java. It changed how I thought about technology: I wanted to know how an application is actually made, and that question still drives most of what I do. I’ve since moved to Tangerang Selatan, and I’m finishing a degree in Information Systems alongside work.",
  quote: "Kejar apa yang ingin kau kejar, tapi jangan lupa apa yang mesti kau jaga.",
  quoteSource: "@riskiathaillah — the line I come back to",
} as const;

export type ArchiveProject = {
  name: string;
  description: string;
  stack: string;
  link?: { href: string; label: string };
  year?: string;
};

export const archive: ArchiveProject[] = [
  {
    name: "Sidumasari",
    description: "Public complaint system for residents of Langensari district. I built the front end.",
    stack: "Laravel · Tailwind CSS · JavaScript",
    link: { href: "https://sidumasari.com", label: "sidumasari.com" },
  },
  {
    name: "SMKN 3 Banjar",
    description: "Redesign of my school’s website interface.",
    stack: "HTML · Tailwind CSS",
    link: { href: "https://www.smkn3-banjar.sch.id", label: "smkn3-banjar.sch.id" },
  },
  {
    name: "rplone-webkelas",
    description: "A static site by the RPL 1 class team, marking three years together at SMKN 3 Banjar.",
    stack: "Tailwind CSS · team project",
    link: { href: "https://rplone-smkn3banjar.github.io", label: "github.io" },
  },
  {
    name: "pembayaran-spp",
    description: "School fee payment app, built for the 2023 software engineering competency exam (UKK).",
    stack: "Laravel · Bootstrap",
    year: "2023",
  },
  {
    name: "SIPWKS",
    description:
      "School cooperative kiosk management system. A desktop app and my main project as an intern at CV. Access Media.",
    stack: "Visual Basic · Microsoft Access",
    year: "2022",
  },
];
