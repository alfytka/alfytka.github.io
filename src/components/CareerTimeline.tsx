"use client";

import { useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import type { Role, Study, YearMonth } from "@/content/profile";
import { formatDuration, formatRange, monthIndex, monthsBetween, toYearMonth } from "@/lib/months";

const AXIS_START: YearMonth = "2022-01";

// "Now" is computed in the browser, so durations stay correct without a rebuild.
// The server snapshot is the build month, which keeps hydration consistent.
const subscribe = (onChange: () => void) => {
  const id = window.setInterval(onChange, 60 * 60 * 1000);
  return () => window.clearInterval(id);
};

function useNowMonth(buildMonth: YearMonth): YearMonth {
  return useSyncExternalStore(
    subscribe,
    () => toYearMonth(new Date()),
    () => buildMonth,
  );
}

export function CareerTimeline({
  roles,
  studies,
  buildMonth,
}: {
  roles: Role[];
  studies: Study[];
  buildMonth: YearMonth;
}) {
  const now = useNowMonth(buildMonth);
  const [active, setActive] = useState<string | null>(null);
  const axisRef = useRef<HTMLDivElement>(null);

  const startIdx = monthIndex(AXIS_START);
  const endYear = Number(now.split("-")[0]);
  const endIdx = monthIndex(`${endYear}-12` as YearMonth) + 1;
  const span = endIdx - startIdx;
  const pct = (ym: YearMonth) => ((Math.min(Math.max(monthIndex(ym), startIdx), endIdx) - startIdx) / span) * 100;
  const widthPct = (start: YearMonth, end: YearMonth) => {
    const s = Math.max(monthIndex(start), startIdx);
    const e = Math.min(monthIndex(end) + 1, endIdx);
    return ((e - s) / span) * 100;
  };
  const years = Array.from({ length: endYear - 2022 + 1 }, (_, i) => 2022 + i);
  const nowPct = ((monthIndex(now) + 0.5 - startIdx) / span) * 100;

  return (
    <div>
      {/* Axis */}
      <div className="grid md:grid-cols-[168px_minmax(0,1fr)]" role="img" aria-label="Career timeline from 2022 to now, drawn to scale. Details follow in the list below.">
        <div aria-hidden="true" className="hidden flex-col pt-[14px] text-[13px] text-muted md:flex">
          <span className="leading-[22px]">Work</span>
          <span className="mt-[14px] leading-[22px]">Study</span>
        </div>
        <div ref={axisRef} aria-hidden="true" className="relative h-[112px]">
          {years.map((y) => (
            <div key={y} className="absolute top-0 h-[84px] border-l border-hairline" style={{ left: `${pct(`${y}-1` as YearMonth)}%` }}>
              <span className="absolute left-0 top-[92px] font-mono text-[10px] text-muted md:text-[11px]">{y}</span>
            </div>
          ))}

          {roles.map((r) => {
            const end = r.end ?? now;
            const months = monthsBetween(r.start, end);
            const isActive = active === r.id;
            const tone =
              r.tone === "current"
                ? "bg-selection border border-ink text-ink"
                : r.tone === "past"
                  ? isActive
                    ? "bg-ink text-paper"
                    : "bg-ink-2 text-paper"
                  : isActive
                    ? "bg-ink"
                    : "bg-[#8a8a84]";
            return (
              <div
                key={r.id}
                onMouseEnter={() => setActive(r.id)}
                onMouseLeave={() => setActive(null)}
                className={`absolute top-[14px] flex h-[22px] items-center overflow-visible rounded-[3px] px-1.5 ease-ledger ${tone}`}
                style={{ left: `${pct(r.start)}%`, width: `${widthPct(r.start, end)}%` }}
              >
                {r.tone === "early" ? (
                  <span className="absolute left-[calc(100%+6px)] whitespace-nowrap text-[11px] text-ink-2">
                    {r.axisLabel} · {formatDuration(months)}
                  </span>
                ) : (
                  <span className="truncate text-[10px] font-medium md:text-[11px]">
                    <span className="hidden md:inline">
                      {r.axisLabel}
                      {r.tone === "past" ? ` · ${months} mo` : ""}
                    </span>
                    <span className="md:hidden">
                      {r.tone === "current" ? `${r.axisShort} · ${months}` : `${r.axisShort} · ${months} mo`}
                    </span>
                  </span>
                )}
                {isActive ? (
                  <BarTooltip boundsRef={axisRef}>
                    <span className="block text-[12px] font-medium text-paper">{r.title}</span>
                    <span className="block font-mono text-[11px] text-[#bdbdb7]">
                      {formatRange(r.start, r.end)} · {formatDuration(months)}
                    </span>
                  </BarTooltip>
                ) : null}
              </div>
            );
          })}

          {studies.map((s) => {
            const clippedStart = monthIndex(s.start) < startIdx;
            const clippedEnd = monthIndex(s.end) + 1 > endIdx;
            return (
              <div
                key={s.id}
                className={[
                  "absolute top-[50px] flex h-[22px] items-center border border-control-strong bg-surface px-1.5 text-[10px] text-ink-2 md:text-[11px]",
                  clippedStart ? "rounded-r-[3px]" : clippedEnd ? "rounded-l-[3px]" : "rounded-[3px]",
                ].join(" ")}
                style={{ left: `${pct(s.start)}%`, width: `${widthPct(s.start, s.end)}%` }}
              >
                <span className="truncate">
                  {clippedStart ? "← " : ""}
                  <span className="hidden md:inline">{s.label}</span>
                  <span className="md:hidden">{s.short}</span>
                  {clippedEnd ? ` → ${s.end.split("-")[0]}` : ""}
                </span>
              </div>
            );
          })}

          <div className="absolute top-0 h-[88px] border-l border-dashed border-ink" style={{ left: `${nowPct}%` }}>
            <span className="absolute right-0 top-[92px] translate-x-1/2 font-mono text-[10px] text-ink md:text-[11px]">now</span>
          </div>
        </div>
      </div>

      {/* Rows */}
      <ol className="-mx-2 mt-8 border-b border-hairline">
        {roles.map((r) => {
          const months = monthsBetween(r.start, r.end ?? now);
          const isActive = active === r.id;
          return (
            <li
              key={r.id}
              onMouseEnter={() => setActive(r.id)}
              onMouseLeave={() => setActive(null)}
              className={[
                "grid gap-1 rounded border-t px-2 py-3 ease-ledger md:grid-cols-[168px_minmax(0,1fr)_110px] md:gap-0 md:py-4",
                isActive ? "border-transparent bg-selection" : "border-hairline",
              ].join(" ")}
            >
              <span className={`font-mono text-[12px] leading-[24px] md:text-[13px] ${isActive ? "text-ink" : "text-muted"}`}>
                {formatRange(r.start, r.end)}
                <span className="md:hidden"> · {formatDuration(months)}</span>
              </span>
              <span>
                <span className="block text-[15px] font-medium leading-[24px]">{r.title}</span>
                <span className={`block text-[15px] leading-[24px] ${isActive ? "text-ink" : "text-ink-2"}`}>{r.context}</span>
              </span>
              <span className="hidden text-right font-mono text-[13px] leading-[24px] tabular md:block">{formatDuration(months)}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * Sits centred above its bar, but never past the edges of the timeline axis: bars at
 * either end (the earliest role, the current one) would otherwise push it off-screen
 * on phones, or over the Work/Study labels on desktop. Measured before paint.
 */
function BarTooltip({ boundsRef, children }: { boundsRef: RefObject<HTMLElement | null>; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const tip = ref.current;
    const bounds = boundsRef.current;
    const bar = tip?.parentElement;
    if (!tip || !bounds || !bar) return;
    const b = bar.getBoundingClientRect();
    const area = bounds.getBoundingClientRect();
    const width = tip.offsetWidth;
    const centred = b.left + b.width / 2 - width / 2;
    const left = Math.max(area.left, Math.min(centred, area.right - width));
    tip.style.translate = "none"; // Tailwind v4 -translate-x-* uses the `translate` property
    tip.style.left = `${left - b.left - bar.clientLeft}px`; // offsets start inside the bar border
  }, [boundsRef]);
  return (
    <span
      ref={ref}
      className="absolute bottom-[calc(100%+8px)] left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2.5 py-1.5 text-left"
    >
      {children}
    </span>
  );
}
