"use client";

import { useEffect, useRef, useState } from "react";
import { person } from "@/content/profile";

function useCopyEmail() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(person.email);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (permissions, insecure context): fall back to the mail client.
      window.location.href = `mailto:${person.email}`;
    }
  };

  return { copied, copy };
}

/** The whole footer email row is the copy target (M2 in the design). */
export function CopyEmailRow() {
  const { copied, copy } = useCopyEmail();
  return (
    <div className="border-t border-hairline">
      <button
        type="button"
        onClick={copy}
        className={[
          "group grid w-full cursor-copy gap-1 rounded px-2 py-3 text-left ease-ledger md:grid-cols-[168px_minmax(0,1fr)_auto] md:items-center md:gap-0 md:py-[14px]",
          "hover:bg-selection focus-visible:bg-selection",
          copied ? "bg-selection" : "",
        ].join(" ")}
        aria-label={`Copy email address ${person.email}`}
      >
        <span className="text-[13px] text-muted group-hover:text-ink md:text-[15px]">Email</span>
        <span className="text-[15px] font-medium">{person.email}</span>
        <span
          className={[
            "hidden justify-self-end rounded border px-2 py-[3px] text-[12px] ease-ledger md:inline-block",
            copied
              ? "border-ink bg-ink text-selection"
              : "border-control-strong text-ink-2 group-hover:border-ink group-hover:bg-ink group-hover:text-paper",
          ].join(" ")}
        >
          {copied ? "Copied ✓" : "Copy"}
        </span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Email address copied" : ""}
      </span>
    </div>
  );
}
