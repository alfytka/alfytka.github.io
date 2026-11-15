import { z } from "zod";

// The schema the specimen actually runs. CODE_LINES below shows it verbatim.

export const PROGRAMS = ["information-systems", "data-science", "statistics", "mathematics"] as const;

export const PROGRAM_LABELS: Record<(typeof PROGRAMS)[number], string> = {
  "information-systems": "Information Systems",
  "data-science": "Data Science",
  statistics: "Statistics",
  mathematics: "Mathematics",
};

const between = (min: number, max: number) => `Must be between ${min} and ${max}.`;
const whole = "Use a whole number.";

export const enrollment = z.object({
  studentId: z.string().regex(/^\d{9}$/, "Use the 9-digit student ID."),
  program: z.enum(PROGRAMS),
  semester: z.coerce.number(whole).int(whole).min(1, between(1, 14)).max(14, between(1, 14)),
  credits: z.coerce.number(whole).int(whole).min(1, between(1, 24)).max(24, between(1, 24)),
});

export type EnrollmentInput = z.input<typeof enrollment>;
export type Enrollment = z.output<typeof enrollment>;

export type CodeLine = { text: string; field?: keyof Enrollment };

export const CODE_LINES: CodeLine[] = [
  { text: 'import { z } from "zod"' },
  { text: "" },
  { text: "const between = (min: number, max: number) =>" },
  { text: "  `Must be between ${min} and ${max}.`" },
  { text: 'const whole = "Use a whole number."' },
  { text: "" },
  { text: "export const enrollment = z.object({" },
  { text: "  studentId: z.string()", field: "studentId" },
  { text: '    .regex(/^\\d{9}$/, "Use the 9-digit student ID."),', field: "studentId" },
  { text: "  program: z.enum(PROGRAMS),", field: "program" },
  { text: "  semester: z.coerce.number(whole).int(whole)", field: "semester" },
  { text: "    .min(1, between(1, 14)).max(14, between(1, 14)),", field: "semester" },
  { text: "  credits: z.coerce.number(whole).int(whole)", field: "credits" },
  { text: "    .min(1, between(1, 24)).max(24, between(1, 24)),", field: "credits" },
  { text: "})" },
  { text: "" },
  { text: "export type Enrollment = z.infer<typeof enrollment>" },
];
