"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CODE_LINES,
  PROGRAMS,
  PROGRAM_LABELS,
  enrollment,
  type Enrollment,
  type EnrollmentInput,
} from "./enrollment";
import { SpecimenCaption, SpecimenFrame } from "./SpecimenFrame";

const FIELD_ORDER: (keyof Enrollment)[] = ["studentId", "program", "semester", "credits"];

function resultLines(data: Enrollment): string[] {
  return [
    "{",
    "  success: true,",
    "  data: {",
    `    studentId: "${data.studentId}",`,
    `    program:   "${data.program}",`,
    `    semester:  ${data.semester},`,
    `    credits:   ${data.credits},`,
    "  },",
    "}",
    "",
    "// typeof data → Enrollment",
  ];
}

export function EnrollmentForm() {
  const ids = useId();
  const [saved, setSaved] = useState<Enrollment | null>(null);
  const [flash, setFlash] = useState(false);
  const [mobileTab, setMobileTab] = useState<"form" | "schema">("form");
  const flashTimer = useRef<number | undefined>(undefined);

  const {
    register,
    handleSubmit,
    trigger,
    control,
    formState: { errors, touchedFields, dirtyFields },
  } = useForm<EnrollmentInput, unknown, Enrollment>({
    resolver: zodResolver(enrollment),
    mode: "onTouched",
    defaultValues: { studentId: "041832457", program: "information-systems", semester: "5", credits: "27" },
  });

  // Start with the specimen's "hook": validate once so the credits error is visible.
  const [validated, setValidated] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void trigger().then(() => {
      if (!cancelled) setValidated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [trigger]);

  // The result view belongs to the exact values that were saved; any edit hides it.
  const values = useWatch({ control });
  const valuesKey = JSON.stringify(values);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const shownResult = saved && savedKey === valuesKey ? saved : null;

  useEffect(() => () => window.clearTimeout(flashTimer.current), []);

  const onValid = (data: Enrollment) => {
    const result = enrollment.safeParse(data);
    if (!result.success) return;
    setSaved(result.data);
    setSavedKey(valuesKey);
    setFlash(true);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(false), 2000);
  };

  const issueCount = FIELD_ORDER.filter((f) => errors[f]).length;
  const ok = (f: keyof Enrollment) => !errors[f] && (validated || touchedFields[f] || dirtyFields[f]);

  const inputBase =
    "h-10 w-full rounded-md border bg-surface px-3 text-[15px] outline-none ease-ledger md:text-[14px]";
  const inputState = (f: keyof Enrollment) =>
    errors[f]
      ? "border-error border-[1.5px] shadow-[0_0_0_3px_rgba(180,35,24,0.13)]"
      : "border-control focus:border-ink";

  const fieldId = (f: string) => `${ids}-${f}`;

  return (
    <SpecimenFrame>
      <SpecimenCaption
        title="Specimen 02 — Form and the schema behind it"
        shortTitle="Specimen 02 — Validated form"
        shortNote="dummy data"
        note="Reconstructed · type in the form, the schema reacts"
      />
      {/* Mobile only: form and schema share the space as two tabs. */}
      <div role="tablist" aria-label="Specimen view" className="flex gap-1 border-b border-hairline bg-surface-2 p-2 md:hidden">
        {(["form", "schema"] as const).map((tab) => {
          const selected = mobileTab === tab;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${ids}-panel-${tab}`}
              onClick={() => setMobileTab(tab)}
              className={[
                "h-8 flex-1 rounded-md text-[13px] ease-ledger",
                selected ? "border border-control bg-surface font-medium text-ink" : "text-muted",
              ].join(" ")}
            >
              {tab === "form"
                ? "Form"
                : `Schema${issueCount > 0 ? ` · ${issueCount} issue${issueCount > 1 ? "s" : ""}` : ""}`}
            </button>
          );
        })}
      </div>
      {/* grid-cols-1 = minmax(0,1fr): without it the implicit `auto` column grows to the
          longest code line and pushes the whole page sideways on phones and tablets.
          The code panel scrolls horizontally inside itself instead. */}
      <div className="grid grid-cols-1 xl:grid-cols-[500px_minmax(0,1fr)]">
        <form
          id={`${ids}-panel-form`}
          onSubmit={(event) => void handleSubmit(onValid)(event)}
          noValidate
          className={`flex-col gap-[18px] p-4 md:flex md:p-7 ${mobileTab === "form" ? "flex" : "hidden"}`}
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor={fieldId("studentId")} className="text-[13px] font-medium">
              Student ID (NIM)
            </label>
            <div className="relative">
              <input
                id={fieldId("studentId")}
                inputMode="numeric"
                autoComplete="off"
                aria-invalid={!!errors.studentId}
                aria-describedby={errors.studentId ? `${fieldId("studentId")}-err` : undefined}
                className={`${inputBase} ${inputState("studentId")} pr-9 font-mono tabular`}
                {...register("studentId")}
              />
              {ok("studentId") ? <Check /> : null}
            </div>
            <FieldError id={`${fieldId("studentId")}-err`} message={errors.studentId?.message} />
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_96px] gap-3 md:grid-cols-[minmax(0,1fr)_120px]">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={fieldId("program")} className="text-[13px] font-medium">
                Study program
              </label>
              <select
                id={fieldId("program")}
                aria-invalid={!!errors.program}
                className={`${inputBase} ${inputState("program")} cursor-pointer`}
                {...register("program")}
              >
                {PROGRAMS.map((p) => (
                  <option key={p} value={p}>
                    {PROGRAM_LABELS[p]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={fieldId("semester")} className="text-[13px] font-medium">
                Semester
              </label>
              <input
                id={fieldId("semester")}
                inputMode="numeric"
                aria-invalid={!!errors.semester}
                aria-describedby={errors.semester ? `${fieldId("semester")}-err` : undefined}
                className={`${inputBase} ${inputState("semester")} font-mono tabular`}
                {...register("semester")}
              />
            </div>
            {errors.semester ? (
              <div className="col-span-2 -mt-1.5">
                <FieldError id={`${fieldId("semester")}-err`} message={errors.semester.message} />
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={fieldId("credits")} className="text-[13px] font-medium">
              Credits (SKS)
            </label>
            <div className="relative">
              <input
                id={fieldId("credits")}
                inputMode="numeric"
                aria-invalid={!!errors.credits}
                aria-describedby={errors.credits ? `${fieldId("credits")}-err` : undefined}
                className={`${inputBase} ${inputState("credits")} pr-9 font-mono tabular`}
                {...register("credits")}
              />
              {ok("credits") ? <Check /> : null}
            </div>
            <FieldError id={`${fieldId("credits")}-err`} message={errors.credits?.message} />
          </div>

          <div className="flex items-center gap-3.5 pt-2">
            <button
              type="submit"
              disabled={issueCount > 0}
              className={[
                "h-10 shrink-0 rounded-md px-4 text-[14px] font-medium ease-ledger",
                flash
                  ? "bg-selection text-ink"
                  : issueCount > 0
                    ? "cursor-not-allowed bg-disabled text-placeholder"
                    : "bg-ink text-paper",
              ].join(" ")}
            >
              {flash ? "Saved ✓" : "Save enrollment"}
            </button>
            <p className="text-[13px] leading-[18px] text-muted" aria-live="polite">
              {shownResult
                ? "Kept in memory only. This specimen never sends data anywhere."
                : issueCount > 0
                  ? `${issueCount} issue${issueCount > 1 ? "s" : ""} — checked in the browser before any request is sent.`
                  : "0 issues — ready to save."}
            </p>
          </div>
        </form>

        <div id={`${ids}-panel-schema`} className={`md:block ${mobileTab === "schema" ? "block" : "hidden"}`}>
          <CodePanel errors={FIELD_ORDER.filter((f) => errors[f])} saved={shownResult} />
        </div>
      </div>
    </SpecimenFrame>
  );
}

function Check() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[14px] text-muted">
      &#10003;
    </span>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-[13px] text-error">
      {message}
    </p>
  );
}

function CodePanel({ errors, saved }: { errors: (keyof Enrollment)[]; saved: Enrollment | null }) {
  const lines = saved ? resultLines(saved).map((text, i) => ({ text, hit: i === 1 })) : CODE_LINES.map((l) => ({ text: l.text, hit: !!l.field && errors.includes(l.field) }));
  return (
    <div className="h-full overflow-x-auto rounded-b-[10px] bg-code py-5 font-mono text-[12.5px] leading-[22px] text-code-ink md:text-[13px] xl:rounded-b-none xl:rounded-br-[10px]">
      <p className="px-5 pb-4 text-[12px] text-code-muted md:px-7">
        {saved ? "result — enrollment.safeParse(form)" : "enrollment.schema.ts"}
      </p>
      <pre className="min-w-max [font-variant-ligatures:none]">
        <code>
          {lines.map((l, i) => (
            <span
              key={i}
              className={[
                "block border-l-[3px] px-5 md:px-7",
                l.hit ? "border-selection bg-selection/12" : "border-transparent",
              ].join(" ")}
            >
              {l.text || " "}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
