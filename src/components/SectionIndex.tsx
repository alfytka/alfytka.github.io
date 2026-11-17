"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { person } from "@/content/profile";

export const SECTIONS = [
  { id: "work", label: "Work", num: "01" },
  { id: "experience", label: "Experience", num: "02" },
  { id: "about", label: "About", num: "03" },
] as const;

// The highlight grows in from, and shrinks back to, this size.
const HIDDEN_SCALE = "scale(0.8)";

export type SectionId = (typeof SECTIONS)[number]["id"];

/**
 * Floating section index, on every page.
 * - Home: items scroll to their section; the highlight follows the reading position.
 * - Other pages (archive, 404): items link to the home sections; `parent` marks the
 *   section the page belongs to (archive → Work), so tapping it returns there.
 * - Desktop: top-centre, fades in once the (non-sticky) header has scrolled away.
 * - Mobile: bottom-centre under the thumb, always visible; it is the only navigation
 *   on mobile. The back-to-top button grows in once the header is gone.
 * The current section gets the chartreuse selection, drawn as one layer that slides
 * between items.
 */
export function SectionIndex({
  headerRef,
  home,
  parent = null,
}: {
  headerRef: RefObject<HTMLElement | null>;
  home: boolean;
  parent?: SectionId | null;
}) {
  const [pastHeader, setPastHeader] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const [active, setActive] = useState<SectionId | null>(home ? null : parent);
  const listRef = useRef<HTMLUListElement>(null);
  const indicatorRef = useRef<HTMLLIElement>(null);
  const shownRef = useRef(false);
  // Last translateX of the highlight, so it can shrink away where it stands.
  const xRef = useRef("");
  // After a click, the section the page is scrolling to. Scroll tracking pauses until
  // the scroll settles, so the highlight glides straight there instead of stopping at
  // every section it passes.
  const targetRef = useRef<SectionId | null>(null);
  const settleRef = useRef(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const header = headerRef.current;
      setPastHeader(header ? header.getBoundingClientRect().bottom <= 0 : window.scrollY > 72);
      if (!home) return;

      // Current section = the last one whose top has crossed 40% of the viewport.
      const line = window.innerHeight * 0.4;
      let current: SectionId | null = null;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      }
      // About is short: at the very bottom of the page, mark it as current.
      const doc = document.documentElement;
      if (window.innerHeight + window.scrollY >= doc.scrollHeight - 8) current = "about";
      if (!targetRef.current) setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
      if (targetRef.current) {
        window.clearTimeout(settleRef.current);
        settleRef.current = window.setTimeout(() => {
          targetRef.current = null;
          update();
        }, 150);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settleRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [headerRef, home]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 48rem)");
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Move the highlight layer onto the active link. It slides between links, grows in on
  // the spot when it first appears (nothing to slide from), shrinks away when no section
  // is current, and jumps without a transition when only the layout changes.
  useLayoutEffect(() => {
    const list = listRef.current;
    const indicator = indicatorRef.current;
    if (!list || !indicator) return;

    const place = (animate: boolean) => {
      const link = active ? list.querySelector<HTMLElement>(`[data-section="${active}"]`) : null;
      if (!link) {
        if (shownRef.current) indicator.style.transform = `${xRef.current} ${HIDDEN_SCALE}`;
        indicator.style.opacity = "0";
        shownRef.current = false;
        return;
      }
      const x = `translateX(${link.offsetLeft}px)`;
      const entering = !shownRef.current;
      const box = () => {
        indicator.style.top = `${link.offsetTop}px`;
        indicator.style.width = `${link.offsetWidth}px`;
        indicator.style.height = `${link.offsetHeight}px`;
      };
      if (entering || !animate) {
        // Set the starting state without a transition: in place, and small and clear
        // when entering. Then commit it so the change below animates from there.
        indicator.style.transition = "none";
        box();
        indicator.style.transform = entering ? `${x} ${HIDDEN_SCALE}` : x;
        if (entering) indicator.style.opacity = "0";
        void indicator.offsetWidth;
        indicator.style.transition = "";
      }
      box();
      indicator.style.transform = x;
      indicator.style.opacity = "1";
      xRef.current = x;
      shownRef.current = true;
    };

    place(true);
    let stale = false;
    const reflow = () => {
      if (!stale) place(false);
    };
    window.addEventListener("resize", reflow);
    // Web fonts swapping in change the link widths; re-measure once they land.
    if (document.fonts && document.fonts.status !== "loaded") document.fonts.ready.then(reflow);
    return () => {
      stale = true;
      window.removeEventListener("resize", reflow);
    };
  }, [active]);

  const goTo = (id: SectionId) => {
    targetRef.current = id;
    setActive(id);
    // If the page is already there no scroll event fires, so release the lock anyway.
    window.clearTimeout(settleRef.current);
    settleRef.current = window.setTimeout(() => (targetRef.current = null), 1000);
  };

  const itemClass = (current: boolean) =>
    [
      "relative flex items-baseline gap-1.5 whitespace-nowrap rounded-full px-2 py-1.5 min-[22.5rem]:px-2.5 text-[14px] leading-[20px] ease-ledger md:px-3",
      current ? "text-ink" : "text-ink-2 hover:bg-chip hover:text-ink",
    ].join(" ");

  // Desktop: the pill and its edge fade appear together once the header has gone.
  const desktopHidden = pastHeader ? "" : "md:pointer-events-none md:opacity-0";

  return (
    <>
      {/* Edge fade behind the pill: bottom on mobile (always, like the pill), top on
          desktop (only once the header has gone, so it never washes over the name). */}
      <div
        aria-hidden="true"
        className={[
          "edge-fade-up pointer-events-none fixed inset-x-0 bottom-0 z-30 h-[calc(96px+env(safe-area-inset-bottom))]",
          "transition-opacity duration-[120ms] ease-out md:edge-fade-down md:bottom-auto md:top-0 md:h-24",
          desktopHidden,
        ].join(" ")}
      />
      <nav
        aria-label="Sections"
        inert={desktop && !pastHeader}
        className="pointer-events-none fixed inset-x-0 bottom-[calc(16px+env(safe-area-inset-bottom))] z-40 flex justify-center px-2 min-[22.5rem]:px-4 md:bottom-auto md:top-4"
      >
        <ul
          ref={listRef}
          className={[
            "relative flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full border border-hairline bg-surface/90 p-1",
            "shadow-[0_1px_2px_rgba(18,18,18,0.04),0_8px_24px_-6px_rgba(18,18,18,0.12)] backdrop-blur-md ease-ledger",
            "pointer-events-auto opacity-100",
            desktopHidden,
          ].join(" ")}
        >
          <li
            ref={indicatorRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 rounded-full bg-selection opacity-0 transition-[transform,width,opacity] duration-[260ms] ease-[cubic-bezier(0.2,0,0,1)]"
          />
          {SECTIONS.map((s) => {
            const current = active === s.id;
            const inner = (
              <>
                <span
                  aria-hidden="true"
                  className={`hidden font-mono text-[11px] md:inline ${current ? "text-ink/60" : "text-muted"}`}
                >
                  {s.num}
                </span>
                {s.label}
              </>
            );
            return (
              <li key={s.id}>
                {home ? (
                  <a
                    href={`#${s.id}`}
                    data-section={s.id}
                    aria-current={current ? "location" : undefined}
                    onClick={() => goTo(s.id)}
                    className={itemClass(current)}
                  >
                    {inner}
                  </a>
                ) : (
                  <Link
                    href={`/#${s.id}`}
                    data-section={s.id}
                    aria-current={current ? "true" : undefined}
                    className={itemClass(current)}
                  >
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
          <li aria-hidden="true" className="mx-0.5 h-4 w-px min-[22.5rem]:mx-1 shrink-0 bg-hairline" />
          <li>
            <a
              href={person.links.cv}
              className="block whitespace-nowrap rounded-full px-2 py-1.5 min-[22.5rem]:px-2.5 text-[14px] leading-[20px] text-ink ease-ledger hover:bg-chip md:px-3"
            >
              CV<span aria-hidden="true">&nbsp;&#8599;</span>
            </a>
          </li>
          <li
            inert={!pastHeader}
            className={[
              "shrink-0 overflow-hidden transition-[width,opacity] duration-[260ms] ease-[cubic-bezier(0.2,0,0,1)]",
              pastHeader ? "w-8 opacity-100" : "w-0 opacity-0",
            ].join(" ")}
          >
            <a
              href="#top"
              aria-label="Back to top"
              className="grid size-8 place-items-center rounded-full text-[15px] text-ink-2 ease-ledger hover:bg-chip hover:text-ink"
            >
              <span aria-hidden="true">&uarr;</span>
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
}
