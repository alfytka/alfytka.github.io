// Dummy data for Specimen 01. Deterministic (seeded) so every build renders the
// same rows. None of this is real university data.

export type InvoiceStatus = "Paid" | "Pending" | "Rejected";

export type Invoice = {
  id: string;
  docNo: string;
  vendor: string;
  period: string;
  amount: number;
  status: InvoiceStatus;
};

const VENDORS = [
  "PT Lintas Data Nusantara",
  "CV Sinar Abadi Jaya",
  "PT Karya Mandiri Teknik",
  "Koperasi Pegawai Sejahtera",
  "CV Mitra Cetak Utama",
  "PT Arunika Solusi",
  "PT Bumi Kertas Lestari",
  "CV Teduh Konsultan",
  "PT Nawasena Logistik",
  "CV Garda Elektrik",
  "PT Samudra Integra",
  "CV Pelita Grafika",
  "PT Saka Infra Digital",
  "CV Rimba Furnitur",
  "PT Cahaya Katering",
  "CV Andalan Servis",
];

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function build(): Invoice[] {
  const rand = mulberry32(20261013);
  const rows: Invoice[] = [];
  const periods = [
    { label: "Sep 2026", month: "09", count: 214 },
    { label: "Oct 2026", month: "10", count: 248 },
  ];
  for (const p of periods) {
    for (let i = 1; i <= p.count; i++) {
      const r = rand();
      const status: InvoiceStatus = r < 0.7 ? "Paid" : r < 0.83 ? "Pending" : "Rejected";
      const amount = Math.round((1_200_000 + rand() * 58_000_000) / 500) * 500;
      const docNo = `INV/2026/${p.month}/${String(i).padStart(4, "0")}`;
      rows.push({
        id: docNo,
        docNo,
        vendor: VENDORS[Math.floor(rand() * VENDORS.length)],
        period: p.label,
        amount,
        status,
      });
    }
  }
  return rows;
}

export const INVOICES: Invoice[] = build();
export const DEFAULT_PERIOD = "Oct 2026";

export const idr = new Intl.NumberFormat("id-ID");

/** RFC 4180 quoting, plus a leading ' on text that a spreadsheet would run as a formula. */
export function csvCell(value: string | number): string {
  if (typeof value === "number") return String(value);
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function toCsv(rows: Invoice[]): string {
  const header = ["Document no.", "Vendor", "Period", "Amount (IDR)", "Status"].map(csvCell).join(",");
  const lines = rows.map((r) => [r.docNo, r.vendor, r.period, r.amount, r.status].map(csvCell).join(","));
  return [header, ...lines].join("\r\n");
}
