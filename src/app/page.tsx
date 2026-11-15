import Link from "next/link";
import { CareerTimeline } from "@/components/CareerTimeline";
import { Column, ExternalLink, LedgerRow, Mark, SectionHeader } from "@/components/ledger";
import { LocalTime } from "@/components/LocalTime";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { EnrollmentForm } from "@/components/specimens/EnrollmentForm";
import { InvoiceTable } from "@/components/specimens/InvoiceTable";
import {
  about,
  archive,
  education,
  intro,
  person,
  projects,
  roles,
  studies,
  toolbox,
  type Project,
} from "@/content/profile";
import { formatMonth, toYearMonth } from "@/lib/months";

function ProjectEntry({ project }: { project: Project }) {
  return (
    <div className="grid gap-2 md:grid-cols-[168px_minmax(0,1fr)] md:gap-0">
      <p className="font-mono text-[12px] leading-[20px] text-muted md:text-[13px] md:leading-[28px]">{project.dates}</p>
      <div className="flex flex-col gap-2.5">
        <h3 className="text-[20px] font-medium leading-[26px] tracking-[-0.3px] md:text-[22px] md:leading-[28px]">
          {project.title}
        </h3>
        <p className="text-[15px] leading-[24px] text-ink-2">{project.description}</p>
        <p className="font-mono text-[12px] leading-[20px] text-muted">
          {project.role} &mdash; {project.stack.map((s) => s.replace(" ", " ")).join(" · ")}
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const buildMonth = toYearMonth(new Date());
  const [workEtax, workDashboard] = projects;

  return (
    <>
      <SiteHeader home />
      <main id="main">
        {/* Intro */}
        <Column className="pt-10 md:pt-24">
          <h1 className="max-w-[700px] text-[26px] leading-[32px] tracking-[-0.4px] md:text-[34px] md:leading-[42px] md:tracking-[-0.6px]">
            {intro.statement}
          </h1>
          <p className="mt-5 max-w-[600px] text-[16px] leading-[25px] text-ink-2 md:mt-6 md:text-[17px] md:leading-[27px]">
            {intro.supporting}
          </p>

          <div className="mt-10 border-b border-hairline md:mt-16">
            <LedgerRow label="Now">
              <Mark>{intro.now}</Mark>
            </LedgerRow>
            <LedgerRow label="Based in" aside={<LocalTime />}>
              {person.location}
            </LedgerRow>
            <LedgerRow label="Studying" aside={<span className="hidden font-mono text-[13px] text-muted tabular md:inline">{intro.studying.years}</span>}>
              {intro.studying.label}
              <span className="whitespace-nowrap font-mono text-[13px] text-muted md:hidden"> · {intro.studying.years}</span>
            </LedgerRow>
            <LedgerRow label="Elsewhere">
              <span className="flex flex-wrap gap-x-6 gap-y-1">
                <ExternalLink href={person.links.github}>GitHub</ExternalLink>
                <ExternalLink href={person.links.linkedin}>LinkedIn</ExternalLink>
                <a href={`mailto:${person.email}`} className="underline decoration-hairline underline-offset-[5px] hover:decoration-ink">
                  {person.email}
                </a>
              </span>
            </LedgerRow>
          </div>
        </Column>

        {/* Selected work */}
        <section id="work" aria-labelledby="work-title" className="pt-[72px] md:pt-[120px]">
          <Column>
            <SectionHeader
              id="work"
              title="Selected work"
              description="Two internal products. Real screens can’t leave the building, so each one is shown as a specimen: the same patterns, rebuilt with dummy data."
            />
            <div className="mt-8 md:mt-10">
              <ProjectEntry project={workEtax} />
              <InvoiceTable />
            </div>
            <div className="mt-14 md:mt-[72px]">
              <ProjectEntry project={workDashboard} />
              <EnrollmentForm />
            </div>

            <div className="-mx-2 mt-10 border-b border-hairline md:mt-[72px]">
              <Link
                href="/archive/"
                className="flex items-center justify-between gap-4 rounded border-t border-hairline px-2 py-3.5 ease-ledger hover:border-transparent hover:bg-selection md:grid md:grid-cols-[168px_minmax(0,1fr)_auto] md:gap-0"
              >
                <span className="flex flex-col gap-[3px] md:contents">
                  <span className="text-[13px] text-muted md:text-[15px]">Archive</span>
                  <span className="text-[15px]">
                    {archive.length === 5 ? "Five" : archive.length} school and internship projects
                    <span className="hidden md:inline">, 2020–2023</span>
                  </span>
                </span>
                <span className="text-[17px] md:text-[15px]">
                  <span className="hidden md:inline">View&ensp;</span>
                  <span aria-hidden="true">&rarr;</span>
                </span>
              </Link>
            </div>
          </Column>
        </section>

        {/* Experience */}
        <section id="experience" aria-labelledby="experience-title" className="pt-[72px] md:pt-[120px]">
          <Column>
            <SectionHeader
              id="experience"
              title="Experience"
              description="Three years at Universitas Terbuka, moving from full-stack to front-end. Drawn to scale."
            />
            <div className="mt-6 md:mt-9">
              <CareerTimeline roles={roles} studies={studies} buildMonth={buildMonth} />
            </div>
          </Column>
        </section>

        {/* Toolbox */}
        <section aria-labelledby="toolbox-title" className="pt-[72px] md:pt-[120px]">
          <Column>
            <SectionHeader id="toolbox" title="Toolbox" description="What I reach for, grouped by layer of the stack." />
            <dl className="mt-5 border-b border-hairline md:mt-7">
              {toolbox.map((t) => (
                <div key={t.label} className="grid gap-[3px] border-t border-hairline py-[11px] md:grid-cols-[168px_minmax(0,1fr)] md:gap-0">
                  <dt className="text-[13px] text-muted md:text-[15px] md:leading-[24px]">{t.label}</dt>
                  <dd className="text-[15px] leading-[23px] md:leading-[24px]">{t.items}</dd>
                </div>
              ))}
            </dl>
          </Column>
        </section>

        {/* Education */}
        <section aria-labelledby="education-title" className="pt-[72px] md:pt-[120px]">
          <Column>
            <SectionHeader id="education" title="Education" description="Studying part-time while working." />
            <dl className="mt-5 border-b border-hairline md:mt-7">
              {education.map((e) => (
                <div key={e.detail} className="grid gap-[3px] border-t border-hairline py-[11px] md:grid-cols-[168px_minmax(0,1fr)_auto] md:gap-0">
                  <dt className="text-[13px] text-muted md:text-[15px] md:leading-[24px]">
                    {e.org}
                    <span className="md:hidden"> · {e.years}</span>
                  </dt>
                  <dd className="text-[15px] leading-[23px] md:leading-[24px]">{e.detail}</dd>
                  <dd className="hidden pl-6 font-mono text-[13px] leading-[24px] text-muted tabular md:block">{e.years}</dd>
                </div>
              ))}
            </dl>
          </Column>
        </section>

        {/* About */}
        <section id="about" aria-labelledby="about-title" className="pt-[72px] md:pt-[120px]">
          <Column>
            <SectionHeader id="about" title="About" />
            <div className="mt-4 flex max-w-[600px] flex-col gap-6 md:mt-6 md:gap-7">
              <p className="text-[16px] leading-[26px] md:text-[17px] md:leading-[28px]">{about.body}</p>
              <figure className="border-l-2 border-ink pl-4 md:pl-5">
                <blockquote lang="id" className="text-[16px] italic leading-[25px] text-ink-2 md:text-[17px] md:leading-[27px]">
                  &ldquo;{about.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-2 text-[13px] text-muted">{about.quoteSource}</figcaption>
              </figure>
            </div>
          </Column>
        </section>
      </main>
      <SiteFooter updated={formatMonth(buildMonth)} />
    </>
  );
}
