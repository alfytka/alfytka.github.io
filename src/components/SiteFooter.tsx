import { person } from "@/content/profile";
import { CopyEmailRow } from "./CopyEmail";
import { Column, ExternalLink } from "./ledger";

export function SiteFooter({ updated }: { updated: string }) {
  return (
    <footer className="pb-28 pt-24 md:pb-24 md:pt-40">
      <Column>
        <h2 className="text-[30px] leading-[36px] tracking-[-0.5px] md:text-[34px] md:leading-[42px] md:tracking-[-0.6px]">
          Hello, world.
        </h2>
        <p className="mt-2 text-[16px] leading-[25px] text-ink-2 md:text-[17px] md:leading-[27px]">
          The best way to reach me is email. I usually reply within a day.
        </p>
        <div className="-mx-2 mt-6 border-b border-hairline md:mt-8">
          <CopyEmailRow />
          {[
            { label: "LinkedIn", href: person.links.linkedin, text: person.links.linkedinLabel, external: true },
            { label: "GitHub", href: person.links.github, text: person.links.githubLabel, external: true },
            { label: "Résumé", href: person.links.cv, text: "CV, PDF", external: false },
          ].map((row) => (
            <div
              key={row.label}
              className="grid gap-1 rounded border-t border-hairline px-2 py-3 ease-ledger has-[a:hover]:border-transparent has-[a:hover]:bg-selection md:grid-cols-[168px_minmax(0,1fr)] md:gap-0 md:py-[14px]"
            >
              <span className="text-[13px] text-muted md:text-[15px]">{row.label}</span>
              {row.external ? (
                <ExternalLink href={row.href} className="justify-self-start text-[15px] no-underline">
                  {row.text}
                </ExternalLink>
              ) : (
                <a href={row.href} className="justify-self-start text-[15px]">
                  {row.text}
                  <span aria-hidden="true">&nbsp;&#8599;</span>
                </a>
              )}
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-1 font-mono text-[12px] text-muted md:mt-10 md:flex-row md:justify-between">
          <span>&copy; {new Date().getFullYear()} {person.name}</span>
          <span>Last updated {updated}</span>
        </div>
      </Column>
    </footer>
  );
}
