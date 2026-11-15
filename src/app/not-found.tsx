import type { Metadata } from "next";
import Link from "next/link";
import { Column } from "@/components/ledger";
import { SiteHeader } from "@/components/SiteHeader";
import { person } from "@/content/profile";

export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false },
};

const rows = [
  { label: "Home", text: "Selected work, experience, toolbox", href: "/" },
  { label: "Archive", text: "School and internship projects", href: "/archive/" },
];

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="pb-24">
        <Column className="pt-16 md:pt-[120px]">
          <p className="font-mono text-[13px] text-muted">404</p>
          <h1 className="mt-3.5 text-[28px] leading-[34px] tracking-[-0.5px] md:text-[34px] md:leading-[42px] md:tracking-[-0.6px]">
            No rows match this address.
          </h1>
          <p className="mt-3.5 max-w-[560px] text-[16px] leading-[25px] text-ink-2 md:text-[17px] md:leading-[27px]">
            The link may be old or mistyped. Nothing else is missing — here’s where everything lives.
          </p>
          <ul className="-mx-2 mt-10 border-b border-hairline">
            {rows.map((r) => (
              <li key={r.label}>
                <Link
                  href={r.href}
                  className="flex items-center justify-between gap-4 rounded border-t border-hairline px-2 py-3.5 ease-ledger hover:border-transparent hover:bg-selection md:grid md:grid-cols-[168px_minmax(0,1fr)_auto] md:gap-0"
                >
                  <span className="flex flex-col gap-[3px] md:contents">
                    <span className="text-[13px] text-muted md:text-[15px]">{r.label}</span>
                    <span className="text-[15px]">{r.text}</span>
                  </span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </li>
            ))}
            <li className="grid gap-1 border-t border-hairline px-2 py-3.5 md:grid-cols-[168px_minmax(0,1fr)] md:gap-0">
              <span className="text-[13px] text-muted md:text-[15px]">Email</span>
              <a href={`mailto:${person.email}`} className="text-[15px] font-medium">
                {person.email}
              </a>
            </li>
          </ul>
        </Column>
      </main>
    </>
  );
}
