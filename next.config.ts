import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // no StrictMode: the three.js engine is a single long-lived instance bound to one canvas
  reactStrictMode: false,
};

export default nextConfig;
