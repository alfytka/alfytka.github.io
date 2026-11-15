"use client";

import Link from "next/link";
import { useRef } from "react";
import { person } from "@/content/profile";
import { SECTIONS, SectionIndex, type SectionId } from "./SectionIndex";

/**
 * Page header: name + primary nav (desktop). It scrolls away with the page, and the
 * floating SectionIndex handles navigation: on desktop once the header is off screen,
 * on mobile from the start (mobile has no menu button by design).
 * Off the home page, the "←" before the name is the one back link; `section` is the
 * home section the page belongs to, highlighted in the index.
 */
export function SiteHeader({ home = false, section }: { home?: boolean; section?: SectionId }) {
  const headerRef = useRef<HTMLElement>(null);

  const href = (id: SectionId) => (home ? `#${id}` : `/#${id}`);

  return (
    <>
      <header ref={headerRef} id="top" className="relative z-40">
        <div className="mx-auto flex h-16 w-full max-w-[720px] items-center justify-between px-5 md:h-[72px] md:px-0">
          <Link href="/" className="group relative text-[15px] font-medium">
            {home ? null : <span aria-hidden="true">&larr;&nbsp;</span>}
            <span className="hidden sm:inline">{person.name}</span>
            <span className="sm:hidden">{person.shortName}</span>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-full mt-1.5 whitespace-nowrap rounded bg-ink px-2 py-1 font-mono text-[11px] text-paper opacity-0 ease-ledger group-hover:opacity-100"
            >
              my name, btw
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-[18px] text-[15px]">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={href(s.id)} className="rounded-[2px] px-[5px] py-px text-ink-2 ease-ledger hover:text-ink">
                    {s.label}
                  </a>
                </li>
              ))}
              <li>
                <a href={person.links.cv} className="px-[5px] text-ink">
                  CV<span aria-hidden="true">&nbsp;&#8599;</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <SectionIndex headerRef={headerRef} home={home} parent={section} />
    </>
  );
}
