import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
// import { withSentryConfig } from "@sentry/nextjs"; // Sentry vaqtincha o'chirilgan

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongoose"],
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
    proxyClientMaxBodySize: "50mb",
  },
  images: {
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    remotePatterns: [
      // Ruxsat berilgan Contabo mintaqalari
      { protocol: "https", hostname: "*.contabostorage.com", pathname: "/**" },
      // Cloudinary
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      // YouTube thumnails uchun
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/**" },
      { protocol: "https", hostname: "img.youtube.com", pathname: "/**" },
      // Pinterest (test uchun ishlatilishi mumkin)
      { protocol: "https", hostname: "i.pinimg.com", pathname: "/**" },

      { protocol: "http", hostname: "localhost", pathname: "/**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://telegram.org https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com https://browser.sentry-cdn.com https://js.sentry-cdn.com https://va.vercel-scripts.com; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https: http: https://*.contabostorage.com https://res.cloudinary.com https://i.ytimg.com https://img.youtube.com https://i.pinimg.com https://*.google-analytics.com https://www.googletagmanager.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https: http: https://*.contabostorage.com https://api.cloudinary.com https://*.sentry.io https://*.google-analytics.com https://www.googletagmanager.com https://vitals.vercel-insights.com; frame-src 'self' https://www.youtube.com https://youtube.com https://t.me https://telegram.org; media-src 'self' https: http: blob: data: https://*.contabostorage.com https://res.cloudinary.com; object-src 'none'; upgrade-insecure-requests;",
          },
        ],
      },
    ];
  },
};


// Sentry vaqtincha o'chirilgan. Qayta yoqish uchun withSentryConfig ni qaytaring.
export default withNextIntl(nextConfig);

// export default withSentryConfig(
//   withNextIntl(nextConfig),
//   {
//     org: "fergana-media",
//     project: "fm-next-router",
//     silent: !process.env.CI,
//     widenClientFileUpload: true,
//     reactComponentAnnotation: { enabled: true },
//     tunnelRoute: "/monitoring",
//     disableLogger: true,
//     automaticVercelMonitors: true,
//   }
// );
