import type { ReactNode } from "react";

/** The 720px reading column. Specimens break out of it on wide screens. */
export function Column({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[720px] px-5 md:px-0 ${className}`}>{children}</div>;
}

/** Stacked section header: title above, description below (same on every breakpoint). */
export function SectionHeader({
  id,
  title,
  description,
  as: Heading = "h2",
}: {
  id?: string;
  title: string;
  description?: string;
  /** h1 when the section title is the page title (e.g. /archive). */
  as?: "h1" | "h2";
}) {
  return (
    <header className="flex flex-col gap-2 md:gap-2.5">
      <Heading
        id={id ? `${id}-title` : undefined}
        className="text-[24px] font-medium leading-[30px] tracking-[-0.4px] md:text-[28px] md:leading-[34px] md:tracking-[-0.5px]"
      >
        {title}
      </Heading>
      {description ? (
        <p className="max-w-[560px] text-[16px] leading-[25px] text-muted">{description}</p>
      ) : null}
    </header>
  );
}

/**
 * A ledger row: label column (168px) + value. On mobile the label sits above the value.
 * `interactive` rows get the selection highlight on hover/focus-within and extend 8px
 * past the column so the highlight has breathing room without shifting the text.
 */
export function LedgerRow({
  label,
  children,
  aside,
  interactive = false,
  labelClassName = "text-muted",
  className = "",
  first = false,
  last = false,
}: {
  label: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
  interactive?: boolean;
  labelClassName?: string;
  className?: string;
  first?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={[
        "relative grid gap-1 py-3 md:grid-cols-[168px_minmax(0,1fr)_auto] md:items-baseline md:gap-0 md:py-[13px]",
        "border-hairline",
        first ? "" : "border-t",
        last ? "border-b" : "",
        interactive
          ? "-mx-2 rounded px-2 ease-ledger hover:border-transparent hover:bg-selection focus-within:bg-selection [&:hover+*]:border-transparent [&:has(:focus-visible)]:border-transparent"
          : "",
        className,
      ].join(" ")}
    >
      <div className={`text-[13px] md:text-[15px] ${labelClassName}`}>{label}</div>
      <div className="min-w-0 text-[15px] leading-[24px]">{children}</div>
      {aside ? <div className="text-[15px] md:pl-6 md:text-right">{aside}</div> : null}
    </div>
  );
}

export function Mark({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`rounded-[2px] bg-selection px-[5px] py-px text-ink ${className}`}>{children}</span>;
}

export function ExternalLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`underline decoration-hairline decoration-1 underline-offset-[5px] ease-ledger hover:decoration-ink ${className}`}
    >
      {children}
      <span aria-hidden="true">&nbsp;&#8599;</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
