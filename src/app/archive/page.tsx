import type { Metadata } from "next";
import { Column, SectionHeader } from "@/components/ledger";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { archive, person } from "@/content/profile";
import { formatMonth, toYearMonth } from "@/lib/months";

const shareImageAlt = `${person.name} — Front-end developer building data-heavy internal tools at Universitas Terbuka.`;
const description = "School and internship projects, 2020–2023. Small, but where it started.";

export const metadata: Metadata = {
  title: "Archive",
  description,
  alternates: { canonical: "/archive/" },
  // A page's openGraph replaces the root one as a whole (no deep merge), so the shared
  // fields are repeated here; otherwise a shared /archive/ link previews as the home page.
  openGraph: {
    type: "website",
    url: "/archive/",
    siteName: person.name,
    title: `Archive — ${person.name}`,
    description,
    locale: "en_US",
    // The file-based image in src/app/ is dropped once this page sets openGraph.
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: shareImageAlt }],
  },
};

export default function ArchivePage() {
  return (
    <>
      <SiteHeader section="work" />
      <main id="main">
        <Column className="pt-8 md:pt-16">
          <SectionHeader
            as="h1"
            title="Archive"
            description="School and internship projects, 2020–2023. Small, but where it started. Kept here for the record, off the home page."
          />
          <ul className="-mx-2 mt-6 border-b border-hairline md:mt-7">
            {archive.map((p) => {
              const content = (
                <>
                  <span className="flex items-baseline justify-between gap-3 md:block">
                    <span className="text-[16px] font-medium md:text-[15px] md:leading-[24px]">{p.name}</span>
                    <span className="text-[14px] md:hidden">
                      {p.link ? (
                        <>
                          {p.link.label}
                          <span aria-hidden="true">&nbsp;&#8599;</span>
                        </>
                      ) : (
                        <span className="font-mono text-[13px] text-muted">{p.year}</span>
                      )}
                    </span>
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-[15px] leading-[23px] text-ink-2 group-hover:text-ink md:leading-[24px]">
                      {p.description}
                    </span>
                    <span className="font-mono text-[12px] leading-[20px] text-muted group-hover:text-ink-2">
                      {p.stack}
                    </span>
                  </span>
                  <span className="hidden text-right text-[14px] leading-[24px] md:block">
                    {p.link ? (
                      <>
                        {p.link.label}
                        <span aria-hidden="true">&nbsp;&#8599;</span>
                      </>
                    ) : (
                      <span className="font-mono text-[13px] text-muted">{p.year}</span>
                    )}
                  </span>
                </>
              );
              const rowClass =
                "group grid gap-1 rounded border-t border-hairline px-2 py-3.5 ease-ledger md:grid-cols-[168px_minmax(0,1fr)_170px] md:gap-0";
              return (
                <li key={p.name}>
                  {p.link ? (
                    <a
                      href={p.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${rowClass} hover:border-transparent hover:bg-selection`}
                    >
                      {content}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    <div className={rowClass}>{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </Column>
      </main>
      <SiteFooter updated={formatMonth(toYearMonth(new Date()))} />
    </>
  );
}
