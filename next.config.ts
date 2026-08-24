import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This project sits inside a directory that has its own lockfile; pin the
  // tracing root here so Next doesn't guess the parent.
  outputFileTracingRoot: __dirname,
  // Generated visualizations are returned as data URLs, and catalog imagery is
  // local SVG, so no remote image hosts are configured yet. When you swap in a
  // live affiliate feed with hosted product photos, add its domains here.
  images: { remotePatterns: [] },

  // The legal documents print their own URLs, and the set they cite is not
  // fully self-consistent. These cover the routes that were live before the
  // rename plus the three one-off spellings that appear inside the documents,
  // so every URL a reader might copy out resolves.
  async redirects() {
    return [
      { source: "/legal/cookies", destination: "/legal/cookie", permanent: true },
      { source: "/legal/ai", destination: "/legal/ai-disclosure", permanent: true },
      { source: "/legal/cookie-policy", destination: "/legal/cookie", permanent: true },
      { source: "/privacy", destination: "/legal/privacy", permanent: true },
      { source: "/terms", destination: "/legal/terms", permanent: true },
      {
        source: "/affiliate-disclosure",
        destination: "/legal/affiliate-disclosure",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
