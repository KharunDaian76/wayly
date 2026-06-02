/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Shared packages are compiled to dist with tsup, so they need no Next
  // transpilation. Their Tailwind classes are picked up via `content` globs in
  // tailwind.config.ts instead.
  transpilePackages: [],
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
