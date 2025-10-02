const allowedOrigins = ["localhost:3000"];

if (process.env.NEXT_PUBLIC_VERCEL_URL) {
  allowedOrigins.push(process.env.NEXT_PUBLIC_VERCEL_URL);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins
    }
  }
};

module.exports = nextConfig;
