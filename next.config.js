const allowedOrigins = ["localhost:3000"];

if (process.env.NEXT_PUBLIC_VERCEL_URL) {
  allowedOrigins.push(process.env.NEXT_PUBLIC_VERCEL_URL);
}

const isDevelopment = process.env.NODE_ENV !== "production";

const scriptSrc = ["'self'", "'unsafe-inline'", "'wasm-unsafe-eval'", "'inline-speculation-rules'"];
const styleSrc = ["'self'", "'unsafe-inline'"];

if (isDevelopment) {
  scriptSrc.push("'unsafe-eval'");
}

const cspDirectives = [
  "default-src 'self'",
  `script-src ${scriptSrc.join(' ')}`,
  `style-src ${styleSrc.join(' ')}`,
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://plausible.io https://*.plausible.io",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "manifest-src 'self'"
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins
    }
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspDirectives
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=()'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
