import type { NextConfig } from "next";

// Static export: the whole site is prerendered to `out/` and can be served
// from GitHub Pages (alfytka.github.io) or any static host.
// The scaffold's cacheComponents / partialPrefetching are removed because
// Cache Components requires a Node.js runtime, which a static export lacks.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // Let phones on the LAN load dev assets (JS chunks, HMR) when opening the
  // dev server via the Network URL; without this the page never hydrates there.
  // Only affects `next dev`. Update if the laptop's LAN IP changes.
  // allowedDevOrigins: ["192.168.88.10"],
  allowedDevOrigins: ['172.20.10.5'],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
