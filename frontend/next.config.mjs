/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Reduce EMFILE (too many open files) in dev — fewer watched files
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ignored: ["**/node_modules", "**/.git"],
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  // Prevent 404s: no-store in dev so browser always gets fresh chunk URLs
  async headers() {
    const noStore = "no-store, no-cache, must-revalidate";
    const immutable = "public, max-age=31536000, immutable";
    const isDev = process.env.NODE_ENV === "development";
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: isDev ? noStore : immutable },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "Cache-Control", value: noStore },
        ],
      },
    ];
  },
  // Ensure consistent asset paths (no basePath so assets resolve at root)
  basePath: "",
  assetPrefix: "",
};

export default nextConfig;

