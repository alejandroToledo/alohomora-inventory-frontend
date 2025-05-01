import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['*'], // Permite imágenes de cualquier dominio
  },
};

export default nextConfig;
