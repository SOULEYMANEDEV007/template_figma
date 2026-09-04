import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withPWAInit from "next-pwa";

const nextConfig: NextConfig = {
    env: {
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    },
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    images: {
        unoptimized: true,

        remotePatterns: [
            {
                protocol: "http",
                hostname: "127.0.0.1",
                port: "8000",
                pathname: "/**",
            },
            {
                protocol: "http",
                hostname: "localhost",
                port: "3004",
                pathname: "/**",
            },
            {
                protocol: "http",
                hostname: "localhost",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "http",
                hostname: "classroom-backend.test",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "ecole.yeminiservices.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "**.ebene.ci",
                port: "",
                pathname: "/**",
                search: "",
            },
            {
                protocol: "https",
                hostname: "ebene.ci",
                port: "",
                pathname: "/**",
                search: "",
            },
            {
                protocol: "https",
                hostname: "placehold.co",
                port: "",
                pathname: "/**",
                search: "",
            },
            {
                protocol: "https",
                hostname: "api.dicebear.com",
                port: "",
                pathname: "/**",
                search: "",
            },
        ],
    },

    // Enable cookies in development
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "Set-Cookie",
                        value: "SameSite=Lax; Secure",
                    },
                ],
            },
        ];
    },
};

// Configure PWA
const withPWA = withPWAInit({
    dest: "public",
    disable: process.env.NODE_ENV === "development", // Désactivé en dev pour éviter les conflits avec le hot reload
    register: true,
    skipWaiting: true,
    scope: "/",
    sw: "sw.js",
    fallbacks: {
        document: "/offline.html", // Offline fallback page
        image: "",
        audio: "",
        video: "",
        font: "",
    },
    runtimeCaching: [
        {
            // Cache HTML pages (app shell)
            urlPattern: /^https?:\/\/(localhost:3004|ldf\.ci)\/.*$/,
            handler: "NetworkFirst",
            options: {
                cacheName: "pages-cache",
                expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 86400, // 24 hours
                },
                networkTimeoutSeconds: 3, // Quick fallback to cache when offline
            },
        },
        {
            // Cache API calls — LDF backend
            urlPattern:
                /^https?:\/\/localhost:8001\/api\/.*$/,
            handler: "NetworkFirst",
            options: {
                cacheName: "api-cache",
                expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 3600, // 1 hour
                },
                networkTimeoutSeconds: 5, // Quick timeout for offline fallback
                cacheableResponse: {
                    statuses: [0, 200, 404], // Cache successful and 404 responses
                },
            },
        },
        {
            // Cache static assets
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|css|js)$/,
            handler: "CacheFirst",
            options: {
                cacheName: "static-assets",
                expiration: {
                    maxEntries: 200,
                    maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                },
            },
        },
        {
            // Cache fonts
            urlPattern: /^https?:\/\/fonts\.googleapis\.com\/.*$/,
            handler: "CacheFirst",
            options: {
                cacheName: "google-fonts",
                expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
                },
            },
        },
    ],
});

const withNextIntl = createNextIntlPlugin();

// Apply PWA plugin first, then NextIntl
const configWithPWA = withPWA(nextConfig as any);
export default withNextIntl(configWithPWA as any);
