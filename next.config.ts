import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Sprint hackathon: rendering klasik agar force-dynamic dan cookies() stabil.
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
