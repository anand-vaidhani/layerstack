import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * This app is fully dynamic (session cookies + database reads on every
   * dashboard render), so cacheComponents / partial prefetching would only
   * force Suspense boundaries and "unstable value" guards without benefit.
   */
  cacheComponents: false,
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
