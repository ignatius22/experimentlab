/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  webpack: (config) => {
    // BullMQ exposes an optional Valkey Glide adapter; ExperimentLab uses ioredis.
    config.resolve.alias["@valkey/valkey-glide"] = false;
    return config;
  },
};

export default nextConfig;
