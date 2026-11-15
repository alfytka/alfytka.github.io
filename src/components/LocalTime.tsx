"use client";

import { useSyncExternalStore } from "react";
import { person } from "@/content/profile";

const format = new Intl.DateTimeFormat("en-GB", {
  timeZone: person.timeZone,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const subscribe = (onChange: () => void) => {
  const id = window.setInterval(onChange, 15_000);
  return () => window.clearInterval(id);
};

/** "GMT+7 14:32" — the time is filled in after hydration. */
export function LocalTime() {
  const time = useSyncExternalStore(
    subscribe,
    () => format.format(new Date()),
    () => null,
  );
  return (
    <span className="font-mono text-[13px] text-muted tabular">
      {person.timeZoneLabel}
      {time ? ` ${time}` : ""}
    </span>
  );
}
