import { varlockNextConfigPlugin } from "@varlock/nextjs-integration/plugin";

const withVarlock = varlockNextConfigPlugin();
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sprint hackathon: rendering klasik agar force-dynamic dan cookies() stabil.
  cacheComponents: false,
  typedRoutes: true,
  reactCompiler: true,
  poweredByHeader: false,
};

export default withVarlock(nextConfig);
