import type { NextConfig } from "next";

/**
 * Baseline security headers for every response.
 *
 * Scripts are not locked down with a nonce-based CSP here: that forces every
 * page to render dynamically, which costs the marketing pages their static
 * output. What IS locked down is everything that does not cost performance —
 * framing, MIME sniffing, referrer leakage, powerful browser features and
 * where forms may post.
 */
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline'" +
        (process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""),
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
    ].join("; "),
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // The back office must never be cached by a shared proxy or indexed.
      {
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
