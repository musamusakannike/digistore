import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["images.unsplash.com", "res.cloudinary.com", "blob.vercel-storage.com"],
  },
};

export default nextConfig;
