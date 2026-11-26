import { varlockNextConfigPlugin } from "@varlock/nextjs-integration/plugin";

const withVarlock = varlockNextConfigPlugin();
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sprint hackathon: rendering klasik agar force-dynamic dan cookies() stabil.
  cacheComponents: false,
  typedRoutes: true,
  reactCompiler: true,
  // Hilangkan tombol DevTools melayang agar tangkapan layar dan rekaman bersih.
  devIndicators: false,
};

export default withVarlock(nextConfig);
