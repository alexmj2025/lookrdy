import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This project sits inside a directory that has its own lockfile; pin the
  // tracing root here so Next doesn't guess the parent.
  outputFileTracingRoot: __dirname,
  // Generated visualizations are returned as data URLs, and catalog imagery is
  // local SVG, so no remote image hosts are configured yet. When you swap in a
  // live affiliate feed with hosted product photos, add its domains here.
  images: { remotePatterns: [] },
};

export default nextConfig;
