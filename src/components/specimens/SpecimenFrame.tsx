import type { ReactNode } from "react";
import { person } from "@/content/profile";
import { ExternalLink } from "../ledger";

/** White card that breaks out of the 720px column to 1040px on wide screens. */
export function SpecimenFrame({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <figure
      aria-label={label}
      className="relative mt-7 rounded-[10px] border border-hairline bg-surface shadow-[0_1px_2px_rgba(18,18,18,0.04)] xl:-mx-40"
    >
      {children}
    </figure>
  );
}

export function SpecimenCaption({
  title,
  note,
  shortTitle,
  shortNote,
  source,
}: {
  title: string;
  note: string;
  shortTitle?: string;
  shortNote?: string;
  /** Repo-relative path of the specimen's source file, linked on GitHub. */
  source?: string;
}) {
  return (
    <figcaption className="flex items-center justify-between gap-4 rounded-t-[10px] border-b border-hairline bg-surface-2 px-3.5 py-2.5 md:px-5 md:py-3">
      <span className="whitespace-nowrap text-[12px] font-medium md:text-[13px]">
        <span className="hidden md:inline">{title}</span>
        <span className="md:hidden">{shortTitle ?? title}</span>
      </span>
      <span className="flex min-w-0 items-baseline gap-1.5 text-[12px] md:text-[13px]">
        {/* On phones the source link takes the note's place: there is no room for both,
            and the section intro already says the data is dummy. */}
        <span className={`truncate text-right text-muted ${source ? "hidden md:block" : ""}`}>
          <span className="hidden md:inline">{note}</span>
          <span className="md:hidden">{shortNote ?? note}</span>
        </span>
        {source ? (
          <>
            <span aria-hidden="true" className="hidden text-muted md:inline">
              ·
            </span>
            <ExternalLink
              href={`${person.links.source}/blob/main/${source}`}
              className="shrink-0 whitespace-nowrap text-ink-2 hover:text-ink"
            >
              Source<span className="sr-only"> code of {title}</span>
            </ExternalLink>
          </>
        ) : null}
      </span>
    </figcaption>
  );
}
