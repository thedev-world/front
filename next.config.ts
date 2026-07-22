import type { NextConfig } from "next";

const backendOrigin =
  process.env.BACKEND_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";
const snapshotsOrigin =
  process.env.SNAPSHOTS_ORIGIN?.replace(/\/$/, "") ?? "http://127.0.0.1:9000";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/snapshots/:path*",
        destination: `${snapshotsOrigin}/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
