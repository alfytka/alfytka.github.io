import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { person } from "@/content/profile";
import "./globals.css";

const hostGrotesk = localFont({
  src: [
    { path: "../fonts/HostGrotesk-latin-wght.woff2", style: "normal", weight: "300 800" },
    { path: "../fonts/HostGrotesk-latin-wght-italic.woff2", style: "italic", weight: "300 800" },
  ],
  variable: "--font-host-grotesk",
  display: "swap",
});

const fragmentMono = localFont({
  src: "../fonts/FragmentMono-latin-400.woff2",
  weight: "400",
  variable: "--font-fragment-mono",
  display: "swap",
});

const description =
  "Front-end developer at Universitas Terbuka, building data-heavy internal tools: tables, forms and dashboards.";

export const metadata: Metadata = {
  metadataBase: new URL(person.site),
  title: {
    default: `${person.name} — Front-end developer`,
    template: `%s — ${person.name}`,
  },
  description,
  authors: [{ name: person.name, url: person.site }],
  openGraph: {
    type: "website",
    url: "/",
    siteName: person.name,
    title: `${person.name} — Front-end developer`,
    description,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#f6f6f3",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-scroll-behavior: Next 16 keeps route changes (e.g. /archive → /) instant
    // while in-page anchors use the smooth scroll set in globals.css.
    <html lang="en" data-scroll-behavior="smooth" className={`${hostGrotesk.variable} ${fragmentMono.variable}`}>
      <body className="min-h-dvh bg-paper text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-selection focus:px-3 focus:py-2 focus:text-[15px]"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
