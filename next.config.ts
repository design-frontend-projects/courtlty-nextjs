import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "teqylszjixmkqkwwumat.supabase.co",
      },
    ],
  },
};

export default nextConfig;
