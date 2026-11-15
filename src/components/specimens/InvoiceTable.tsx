"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  columnFacetingFeature,
  columnFilteringFeature,
  createColumnHelper,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_equalsString,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { DEFAULT_PERIOD, INVOICES, idr, toCsv, type Invoice, type InvoiceStatus } from "./invoices";
import { SpecimenCaption, SpecimenFrame } from "./SpecimenFrame";

// ---- Table definition (module scope keeps features/columns/data stable) ----

const features = tableFeatures({
  rowSortingFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  columnFacetingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  filteredRowModel: createFilteredRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: { basic: sortFn_basic, alphanumeric: sortFn_alphanumeric },
  filterFns: { includesString: filterFn_includesString, equalsString: filterFn_equalsString },
});

const helper = createColumnHelper<typeof features, Invoice>();

const STATUSES: InvoiceStatus[] = ["Paid", "Pending", "Rejected"];

const columns = helper.columns([
  helper.accessor("docNo", { header: "Document no.", sortFn: "alphanumeric" }),
  helper.accessor("vendor", { header: "Vendor", sortFn: "alphanumeric" }),
  helper.accessor("period", {
    header: "Period",
    filterFn: "equalsString",
    enableSorting: false,
    enableGlobalFilter: false,
  }),
  helper.accessor("amount", { header: "Amount (IDR)", sortFn: "basic", enableGlobalFilter: false }),
  helper.accessor("status", {
    header: "Status",
    enableSorting: false,
    enableGlobalFilter: false,
    filterFn: (row, columnId, value: InvoiceStatus[]) =>
      value.length === 0 || value.includes(row.getValue(columnId) as InvoiceStatus),
  }),
]);

const PAGE_SIZES = [6, 12, 24];
const SIMULATED_LATENCY_MS = 400;
const SEARCH_DEBOUNCE_MS = 150;

// ---- Small pieces ----

function Checkbox({
  checked,
  indeterminate = false,
  onChange,
  label,
  className = "",
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  const on = checked || indeterminate;
  return (
    <span className={`relative inline-grid size-4 place-items-center ${className}`}>
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={label}
        className={[
          "peer size-4 cursor-pointer appearance-none rounded-[4px] border ease-ledger",
          on ? "border-ink bg-ink" : "border-control-strong bg-surface hover:border-ink",
        ].join(" ")}
      />
      {on ? (
        <svg aria-hidden="true" viewBox="0 0 16 16" className="pointer-events-none absolute size-4">
          {indeterminate && !checked ? (
            <path d="M4 8h8" stroke="#DFFF4F" strokeWidth="1.75" strokeLinecap="round" />
          ) : (
            <path d="M4 8.2l2.5 2.5L12 5.2" fill="none" stroke="#DFFF4F" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          )}
        </svg>
      ) : null}
    </span>
  );
}

function StatusPill({ status, emphasis = false }: { status: InvoiceStatus; emphasis?: boolean }) {
  const style =
    status === "Paid"
      ? "bg-pill text-ink-2"
      : status === "Rejected"
        ? "bg-error-soft text-error"
        : `border bg-surface text-ink ${emphasis ? "border-ink" : "border-control"}`;
  return (
    <span className={`inline-block rounded-[4px] px-2 py-[3px] text-[12px] font-medium leading-[14px] ${style}`}>
      {status}
    </span>
  );
}

function SortGlyph({ dir }: { dir: false | "asc" | "desc" }) {
  if (!dir) return <span aria-hidden="true" className="opacity-0 group-hover:opacity-40">&darr;</span>;
  return <span aria-hidden="true">{dir === "asc" ? "↑" : "↓"}</span>;
}

function pageItems(current: number, count: number): (number | "gap")[] {
  if (count <= 5) return Array.from({ length: count }, (_, i) => i);
  const set = new Set([0, count - 1, current - 1, current, current + 1].filter((i) => i >= 0 && i < count));
  if (current <= 1) set.add(2);
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push("gap");
    out.push(n);
  });
  return out;
}

function downloadCsv(rows: Invoice[], filename: string) {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  // Revoking in the same tick can cancel the download in Safari/Firefox.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const POPOVER_WIDTH = 232;
const POPOVER_GUTTER = 12;

const chip =
  "inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-md border px-2.5 text-[13px] ease-ledger md:h-9 md:px-3 md:text-[14px]";

// ---- Status popover (S2) ----

function StatusFilter({
  value,
  counts,
  onChange,
}: {
  value: InvoiceStatus[];
  counts: Map<unknown, number>;
  onChange: (next: InvoiceStatus[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Keep the popover on screen. The chip row wraps on phones and the chip grows as
  // statuses are ticked, so re-measure whenever the chip may have moved.
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const wrap = wrapRef.current;
      const panel = panelRef.current;
      if (!wrap || !panel) return;
      const left = wrap.getBoundingClientRect().left;
      const room = document.documentElement.clientWidth - POPOVER_GUTTER;
      const width = Math.min(POPOVER_WIDTH, room - POPOVER_GUTTER);
      panel.style.left = `${Math.max(POPOVER_GUTTER - left, Math.min(0, room - width - left))}px`;
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [open, value]);

  const active = value.length > 0;
  const toggle = (s: InvoiceStatus) =>
    onChange(value.includes(s) ? value.filter((v) => v !== s) : [...value, s]);

  return (
    <div ref={wrapRef} className="relative">
      <div
        className={[
          chip,
          "pr-0",
          active ? "border-control bg-chip text-ink" : "border-dashed border-control bg-surface text-ink-2",
        ].join(" ")}
      >
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className={active ? "" : "pr-3"}
        >
          {active ? `Status: ${value.join(", ")}` : "+ Status"}
        </button>
        {active ? (
          <button
            type="button"
            onClick={() => onChange([])}
            aria-label="Remove status filter"
            className="h-full px-2.5 text-[13px] text-ink-2 hover:text-ink md:px-3"
          >
            &times;
          </button>
        ) : null}
      </div>
      {open ? (
        <div
          id={panelId}
          role="group"
          aria-label="Filter by status"
          ref={panelRef}
          className="absolute left-0 top-[calc(100%+6px)] z-20 w-[232px] max-w-[calc(100vw-24px)] rounded-lg border border-control bg-surface p-1.5 shadow-[0_8px_24px_rgba(18,18,18,0.08),0_1px_3px_rgba(18,18,18,0.06)]"
        >
          <p className="px-2 py-1.5 text-[12px] font-medium text-muted">Filter by status</p>
          {STATUSES.map((s) => (
            <label
              key={s}
              className="flex h-[34px] cursor-pointer items-center gap-2.5 rounded px-2 text-[14px] ease-ledger hover:bg-chip"
            >
              <Checkbox checked={value.includes(s)} onChange={() => toggle(s)} label={s} />
              <span className="flex-1">{s}</span>
              <span className="font-mono text-[12px] text-muted tabular">{counts.get(s) ?? 0}</span>
            </label>
          ))}
          <div className="mt-0.5 border-t border-hairline-soft px-2 pb-1 pt-2">
            <button type="button" onClick={() => onChange([])} className="text-[13px] text-ink-2 underline underline-offset-2">
              Clear filter
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ---- Specimen ----

export function InvoiceTable() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const loadTimer = useRef<number | undefined>(undefined);

  const table = useTable({
    features,
    columns,
    data: INVOICES,
    getRowId: (row) => row.id,
    enableSortingRemoval: false,
    globalFilterFn: "includesString",
    getColumnCanGlobalFilter: (column) => column.id === "docNo" || column.id === "vendor",
    initialState: {
      sorting: [{ id: "amount", desc: true }],
      columnFilters: [{ id: "period", value: DEFAULT_PERIOD }],
      pagination: { pageIndex: 0, pageSize: 6 },
    },
  });

  // Debounced search → global filter.
  useEffect(() => {
    const t = window.setTimeout(() => table.setGlobalFilter(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [search, table]);

  useEffect(() => () => window.clearTimeout(loadTimer.current), []);

  const { pagination, rowSelection, sorting, columnFilters, globalFilter } = table.state;
  const rows = table.getRowModel().rows;
  const filteredCount = table.getFilteredRowModel().rows.length;
  const pageCount = Math.max(table.getPageCount(), 1);
  const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k]);
  const selectedCount = selectedIds.length;
  const bulk = selectedCount >= 2;

  const periodFilter = columnFilters.find((f) => f.id === "period")?.value as string | undefined;
  const statusFilter = (columnFilters.find((f) => f.id === "status")?.value as InvoiceStatus[] | undefined) ?? [];
  const statusCounts = table.getColumn("status")?.getFacetedUniqueValues() ?? new Map<unknown, number>();
  const amountSort = sorting.find((s) => s.id === "amount");

  const firstRow = filteredCount === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const lastRow = Math.min(firstRow + pagination.pageSize - 1, filteredCount);

  const goToPage = (index: number) => {
    if (index === pagination.pageIndex) return;
    table.setPageIndex(index);
    setLoading(true);
    window.clearTimeout(loadTimer.current);
    loadTimer.current = window.setTimeout(() => setLoading(false), SIMULATED_LATENCY_MS);
  };

  const exportRows = () => {
    const source = bulk
      ? INVOICES.filter((r) => rowSelection[r.id])
      : table.getFilteredRowModel().rows.map((r) => r.original);
    downloadCsv(source, bulk ? "invoices-selected.csv" : "invoices.csv");
  };

  const caption = useMemo(() => {
    if (bulk) return `State · ${selectedCount} rows selected`;
    if (loading) return "Loading page… (simulated latency)";
    return "Reconstructed · dummy data · try sorting by Amount";
  }, [bulk, selectedCount, loading]);

  const headers = table.getHeaderGroups()[0].headers;

  return (
    <SpecimenFrame>
      <SpecimenCaption title="Specimen 01 — Filterable data table" shortTitle="Specimen 01 — Data table" note={caption} shortNote="dummy data" />

      {/* Toolbar */}
      <div className="flex flex-col gap-2 px-3.5 py-3 md:flex-row md:items-center md:gap-2 md:px-5 md:py-4">
        {bulk ? (
          <div className="flex h-9 items-center gap-4 text-[14px]">
            <span className="font-medium">{selectedCount} selected</span>
            <button type="button" onClick={() => table.resetRowSelection(true)} className="text-ink-2 underline underline-offset-2">
              Clear selection
            </button>
          </div>
        ) : (
          <>
            <label className="relative flex h-10 items-center md:h-9 md:w-[220px] xl:w-[300px]">
              <span className="sr-only">Search document number or vendor</span>
              <svg aria-hidden="true" viewBox="0 0 16 16" className="pointer-events-none absolute left-3 size-3.5 text-muted">
                <circle cx="7" cy="7" r="4.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search no. or vendor"
                className={[
                  "h-full w-full rounded-md border bg-surface pl-8 pr-8 text-[15px] outline-none ease-ledger md:text-[14px]",
                  "[&::-webkit-search-cancel-button]:hidden",
                  search ? "border-ink" : "border-control focus:border-ink",
                ].join(" ")}
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2 px-1 text-[16px] text-muted hover:text-ink"
                >
                  &times;
                </button>
              ) : null}
            </label>
            <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
              {periodFilter ? (
                <span className={`${chip} border-control bg-chip pr-0 text-ink`}>
                  <span><span className="hidden md:inline">Period: </span>{periodFilter}</span>
                  <button
                    type="button"
                    onClick={() => table.getColumn("period")?.setFilterValue(undefined)}
                    aria-label="Remove period filter"
                    className="h-full px-2.5 text-[13px] text-ink-2 hover:text-ink md:px-3"
                  >
                    &times;
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => table.getColumn("period")?.setFilterValue(DEFAULT_PERIOD)}
                  className={`${chip} border-dashed border-control bg-surface text-ink-2`}
                >
                  +&ensp;Period
                </button>
              )}
              <StatusFilter
                value={statusFilter}
                counts={statusCounts}
                onChange={(next) => table.getColumn("status")?.setFilterValue(next.length ? next : undefined)}
              />
              <button
                type="button"
                onClick={() => table.getColumn("amount")?.toggleSorting(!amountSort?.desc)}
                className={`${chip} border-control bg-surface text-ink md:hidden`}
              >
                Amount {amountSort?.desc ? "↓" : "↑"}
              </button>
            </div>
          </>
        )}
        <button
          type="button"
          onClick={exportRows}
          disabled={filteredCount === 0}
          className="hidden h-9 items-center rounded-md bg-ink px-3.5 text-[14px] font-medium text-paper ease-ledger disabled:bg-disabled disabled:text-placeholder md:ml-auto md:inline-flex"
        >
          {bulk ? `Export ${selectedCount} rows` : "Export CSV"}
        </button>
      </div>

      {/* Desktop / tablet table */}
      <div className="hidden md:block">
        <table className="w-full table-fixed border-collapse text-left">
          <colgroup>
            <col className="w-[52px] xl:w-[56px]" />
            <col className="w-[150px] xl:w-[200px]" />
            <col className="w-[180px] xl:w-[300px]" />
            <col className="w-[88px] xl:w-[120px]" />
            <col className="w-[120px] xl:w-[184px]" />
            <col className="w-[130px] xl:w-[180px]" />
          </colgroup>
          <thead>
            <tr className="h-10 border-y border-hairline bg-surface-2 text-[12px] font-medium text-muted">
              <th scope="col" className="pl-5">
                <Checkbox
                  checked={table.getIsAllPageRowsSelected()}
                  // Mixed only when this page is partly selected or rows elsewhere are; never
                  // together with checked (TanStack's "some" stays true when all are selected).
                  indeterminate={!table.getIsAllPageRowsSelected() && (table.getIsSomePageRowsSelected() || selectedCount > 0)}
                  onChange={table.getToggleAllPageRowsSelectedHandler()}
                  label="Select all rows on this page"
                />
              </th>
              {headers.map((header) => {
                const sortable = header.column.getCanSort();
                const dir = header.column.getIsSorted();
                const isAmount = header.column.id === "amount";
                const isStatus = header.column.id === "status";
                return (
                  <th
                    key={header.id}
                    scope="col"
                    aria-sort={dir ? (dir === "asc" ? "ascending" : "descending") : undefined}
                    className={[
                      "font-medium",
                      isAmount ? "text-right" : "",
                      isStatus ? "pl-6 xl:pl-10" : "",
                      dir ? "text-ink" : "",
                    ].join(" ")}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="group -mx-1.5 inline-flex items-center gap-1.5 rounded px-1.5 py-1 ease-ledger hover:bg-chip"
                      >
                        {String(header.column.columnDef.header)}
                        <SortGlyph dir={dir} />
                      </button>
                    ) : (
                      String(header.column.columnDef.header)
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody aria-busy={loading}>
            {loading
              ? Array.from({ length: pagination.pageSize }, (_, i) => (
                  <tr key={`sk-${i}`} className="h-12 border-b border-hairline-soft" aria-hidden="true">
                    <td className="pl-5"><span className="block size-4 rounded-[4px] bg-pill" /></td>
                    <td><span className="block h-2.5 w-32 rounded-[3px] bg-disabled" /></td>
                    <td><span className="block h-2.5 w-[60%] rounded-[3px] bg-disabled" /></td>
                    <td><span className="block h-2.5 w-14 rounded-[3px] bg-disabled" /></td>
                    <td><span className="ml-auto block h-2.5 w-20 rounded-[3px] bg-disabled" /></td>
                    <td className="pl-6 xl:pl-10"><span className="block h-5 w-14 rounded-[4px] bg-pill" /></td>
                  </tr>
                ))
              : rows.map((row) => {
                  const selected = row.getIsSelected();
                  const r = row.original;
                  return (
                    <tr
                      key={row.id}
                      className={[
                        "h-12 border-b ease-ledger last:border-b-0",
                        selected ? "border-selection-edge bg-selection" : "border-hairline-soft hover:bg-surface-2",
                      ].join(" ")}
                    >
                      <td className="pl-5">
                        <Checkbox
                          checked={selected}
                          onChange={row.getToggleSelectedHandler()}
                          label={`Select ${r.docNo}`}
                        />
                      </td>
                      <td className="font-mono text-[13px] tabular">{r.docNo}</td>
                      <td className="truncate pr-4 text-[14px]" title={r.vendor}>
                        {r.vendor}
                      </td>
                      <td className={`font-mono text-[13px] ${selected ? "text-ink" : "text-ink-2"}`}>{r.period}</td>
                      <td className="text-right font-mono text-[13px] tabular">{idr.format(r.amount)}</td>
                      <td className="pl-6 xl:pl-10">
                        <StatusPill status={r.status} emphasis={selected} />
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked rows */}
      <ul className="md:hidden" aria-busy={loading}>
        {loading
          ? Array.from({ length: 3 }, (_, i) => (
              <li key={`msk-${i}`} aria-hidden="true" className="flex flex-col gap-2 border-t border-hairline-soft px-3.5 py-3.5">
                <span className="block h-2.5 w-28 rounded-[3px] bg-disabled" />
                <span className="block h-3 w-44 rounded-[3px] bg-disabled" />
              </li>
            ))
          : rows.map((row) => {
              const selected = row.getIsSelected();
              const r = row.original;
              return (
                <li key={row.id}>
                  <label
                    className={[
                      "flex cursor-pointer flex-col gap-1 border-t px-3.5 py-3 ease-ledger",
                      selected ? "border-selection-edge bg-selection" : "border-hairline-soft",
                    ].join(" ")}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selected}
                      onChange={row.getToggleSelectedHandler()}
                      aria-label={`Select ${r.docNo}, ${r.vendor}`}
                    />
                    <span className="flex items-center justify-between">
                      <span className={`font-mono text-[12px] ${selected ? "text-ink-2" : "text-muted"}`}>{r.docNo}</span>
                      <StatusPill status={r.status} emphasis={selected} />
                    </span>
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-[15px]">{r.vendor}</span>
                      <span className="font-mono text-[13px] tabular">{idr.format(r.amount)}</span>
                    </span>
                  </label>
                </li>
              );
            })}
      </ul>

      {/* Empty state (S3) */}
      {!loading && filteredCount === 0 ? (
        <div className="flex flex-col items-center gap-2 border-t border-hairline-soft px-6 py-12 text-center md:border-t-0">
          <p className="text-[15px] font-medium">
            {globalFilter ? `No documents match “${globalFilter}”` : "No documents match these filters"}
          </p>
          <p className="text-[14px] text-muted">
            Searched {periodFilter ? INVOICES.filter((r) => r.period === periodFilter).length : INVOICES.length} rows
            {periodFilter ? ` in ${periodFilter}` : ""}. Try another vendor or document number.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              table.setGlobalFilter("");
              table.getColumn("status")?.setFilterValue(undefined);
            }}
            className="mt-2 h-[34px] rounded-md border border-control-strong bg-surface px-3.5 text-[14px] font-medium ease-ledger hover:border-ink"
          >
            Clear search
          </button>
        </div>
      ) : null}

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 rounded-b-[10px] border-t border-hairline bg-surface-2 px-3.5 py-2.5 md:px-5 md:py-3">
        <p className="font-mono text-[12px] text-muted tabular" aria-live="polite">
          {loading
            ? `Loading rows ${firstRow}–${lastRow}…`
            : filteredCount === 0
              ? "0 results"
              : `${selectedCount > 0 ? `${selectedCount} selected · ` : ""}rows ${firstRow}–${lastRow} of ${filteredCount}`}
        </p>
        {filteredCount > 0 ? (
          <nav aria-label="Pagination" className="flex items-center gap-1 font-mono text-[12px] tabular">
            <label className="mr-4 hidden items-center gap-2 text-muted md:flex">
              Rows
              <select
                value={pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="cursor-pointer bg-transparent text-muted"
              >
                {PAGE_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => goToPage(pagination.pageIndex - 1)}
              disabled={!table.getCanPreviousPage()}
              aria-label="Previous page"
              className="grid size-[26px] place-items-center rounded-[5px] hover:bg-chip disabled:opacity-30"
            >
              &lsaquo;
            </button>
            <span className="md:hidden">
              {pagination.pageIndex + 1} / {pageCount}
            </span>
            <span className="hidden items-center gap-1 md:flex">
              {pageItems(pagination.pageIndex, pageCount).map((item, i) =>
                item === "gap" ? (
                  <span key={`gap-${i}`} className="px-1 text-muted">
                    &hellip;
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => goToPage(item)}
                    aria-current={item === pagination.pageIndex ? "page" : undefined}
                    className={[
                      "grid h-[26px] min-w-[26px] place-items-center rounded-[5px] px-1 ease-ledger",
                      item === pagination.pageIndex ? "bg-ink text-paper" : "hover:bg-chip",
                    ].join(" ")}
                  >
                    {item + 1}
                  </button>
                ),
              )}
            </span>
            <button
              type="button"
              onClick={() => goToPage(pagination.pageIndex + 1)}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
              className="grid size-[26px] place-items-center rounded-[5px] hover:bg-chip disabled:opacity-30"
            >
              &rsaquo;
            </button>
          </nav>
        ) : null}
      </div>
    </SpecimenFrame>
  );
}
