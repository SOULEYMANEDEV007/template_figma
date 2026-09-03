if (!self.define) {
    let e,
        s = {};
    const a = (a, c) => (
        (a = new URL(a + ".js", c).href),
        s[a] ||
            new Promise(s => {
                if ("document" in self) {
                    const e = document.createElement("script");
                    ((e.src = a), (e.onload = s), document.head.appendChild(e));
                } else ((e = a), importScripts(a), s());
            }).then(() => {
                let e = s[a];
                if (!e)
                    throw new Error(`Module ${a} didn’t register its module`);
                return e;
            })
    );
    self.define = (c, i) => {
        const t =
            e ||
            ("document" in self ? document.currentScript.src : "") ||
            location.href;
        if (s[t]) return;
        let n = {};
        const f = e => a(e, t),
            r = { module: { uri: t }, exports: n, require: f };
        s[t] = Promise.all(c.map(e => r[e] || f(e))).then(e => (i(...e), n));
    };
}
define(["./workbox-2185c28b"], function (e) {
    "use strict";
    (importScripts("fallback-zgebrfpL4TGokZT_g_jc6.js"),
        self.skipWaiting(),
        e.clientsClaim(),
        e.precacheAndRoute(
            [
                {
                    url: "/_next/app-build-manifest.json",
                    revision: "0fba20b611e0bb975552fddf3de46042",
                },
                {
                    url: "/_next/static/chunks/1345-a1138170f2eae091.js",
                    revision: "a1138170f2eae091",
                },
                {
                    url: "/_next/static/chunks/2398-befb9551ef05905f.js",
                    revision: "befb9551ef05905f",
                },
                {
                    url: "/_next/static/chunks/2999-f506cd5d40973a18.js",
                    revision: "f506cd5d40973a18",
                },
                {
                    url: "/_next/static/chunks/3106-0e29bb7c042845c6.js",
                    revision: "0e29bb7c042845c6",
                },
                {
                    url: "/_next/static/chunks/3195-cf523a6fae9230da.js",
                    revision: "cf523a6fae9230da",
                },
                {
                    url: "/_next/static/chunks/3785-ff840d2ce6d15be8.js",
                    revision: "ff840d2ce6d15be8",
                },
                {
                    url: "/_next/static/chunks/4-7802b7c3772305f3.js",
                    revision: "7802b7c3772305f3",
                },
                {
                    url: "/_next/static/chunks/413-22c188b82a183dab.js",
                    revision: "22c188b82a183dab",
                },
                {
                    url: "/_next/static/chunks/4255-37b7064e905ee5aa.js",
                    revision: "37b7064e905ee5aa",
                },
                {
                    url: "/_next/static/chunks/4387-ff53932930a4ff6d.js",
                    revision: "ff53932930a4ff6d",
                },
                {
                    url: "/_next/static/chunks/4603-a643c9f20fe5e15b.js",
                    revision: "a643c9f20fe5e15b",
                },
                {
                    url: "/_next/static/chunks/4967.977f2799f062f14c.js",
                    revision: "977f2799f062f14c",
                },
                {
                    url: "/_next/static/chunks/6042-cfed0aaff2316fbf.js",
                    revision: "cfed0aaff2316fbf",
                },
                {
                    url: "/_next/static/chunks/6648-e0b3f85396f898f3.js",
                    revision: "e0b3f85396f898f3",
                },
                {
                    url: "/_next/static/chunks/6713-6650d41f536ad5f4.js",
                    revision: "6650d41f536ad5f4",
                },
                {
                    url: "/_next/static/chunks/6981-4c6d3f391c120853.js",
                    revision: "4c6d3f391c120853",
                },
                {
                    url: "/_next/static/chunks/718-8f53c27899ee7800.js",
                    revision: "8f53c27899ee7800",
                },
                {
                    url: "/_next/static/chunks/7659-8c99001863077669.js",
                    revision: "8c99001863077669",
                },
                {
                    url: "/_next/static/chunks/7713-16b2ee7ed6ea6915.js",
                    revision: "16b2ee7ed6ea6915",
                },
                {
                    url: "/_next/static/chunks/7858-0dd9f3332577a7cf.js",
                    revision: "0dd9f3332577a7cf",
                },
                {
                    url: "/_next/static/chunks/8206.de255bf98d7b6d9e.js",
                    revision: "de255bf98d7b6d9e",
                },
                {
                    url: "/_next/static/chunks/8274-1bc4bbc10ea6f537.js",
                    revision: "1bc4bbc10ea6f537",
                },
                {
                    url: "/_next/static/chunks/8341-73dfed2f1c8f4dbd.js",
                    revision: "73dfed2f1c8f4dbd",
                },
                {
                    url: "/_next/static/chunks/8347-f768fd6096e2ead8.js",
                    revision: "f768fd6096e2ead8",
                },
                {
                    url: "/_next/static/chunks/9373.dfce0e4ad141b1e4.js",
                    revision: "dfce0e4ad141b1e4",
                },
                {
                    url: "/_next/static/chunks/9585-702823fcc128178b.js",
                    revision: "702823fcc128178b",
                },
                {
                    url: "/_next/static/chunks/app/_not-found/page-bcce57f8ee9315e0.js",
                    revision: "bcce57f8ee9315e0",
                },
                {
                    url: "/_next/static/chunks/app/dashboard/attendance/page-03fd4fdfa263a4bc.js",
                    revision: "03fd4fdfa263a4bc",
                },
                {
                    url: "/_next/static/chunks/app/dashboard/classes/%5Bid%5D/page-d7d86fef45e8b00d.js",
                    revision: "d7d86fef45e8b00d",
                },
                {
                    url: "/_next/static/chunks/app/dashboard/classes/page-38d5fc462bb1d8f7.js",
                    revision: "38d5fc462bb1d8f7",
                },
                {
                    url: "/_next/static/chunks/app/dashboard/inspector/attendance/page-86ac159bf084ef4b.js",
                    revision: "86ac159bf084ef4b",
                },
                {
                    url: "/_next/static/chunks/app/dashboard/inspector/page-868a8e91b596661f.js",
                    revision: "868a8e91b596661f",
                },
                {
                    url: "/_next/static/chunks/app/dashboard/inspector/textbooks/%5BschoolId%5D/%5Bid%5D/page-7ea4acc319bb5c31.js",
                    revision: "7ea4acc319bb5c31",
                },
                {
                    url: "/_next/static/chunks/app/dashboard/inspector/textbooks/%5BschoolId%5D/page-d01555499ca41804.js",
                    revision: "d01555499ca41804",
                },
                {
                    url: "/_next/static/chunks/app/dashboard/inspector/textbooks/page-13526fd8a7697a23.js",
                    revision: "13526fd8a7697a23",
                },
                {
                    url: "/_next/static/chunks/app/dashboard/layout-21f3e6e2f553f676.js",
                    revision: "21f3e6e2f553f676",
                },
                {
                    url: "/_next/static/chunks/app/dashboard/page-a221fafd726f6f87.js",
                    revision: "a221fafd726f6f87",
                },
                {
                    url: "/_next/static/chunks/app/dashboard/principal/attendance/page-209732f14a018793.js",
                    revision: "209732f14a018793",
                },
                {
                    url: "/_next/static/chunks/app/dashboard/principal/classes/page-23f307faad2b6cd9.js",
                    revision: "23f307faad2b6cd9",
                },
                {
                    url: "/_next/static/chunks/app/dashboard/principal/page-4002d45ab821b071.js",
                    revision: "4002d45ab821b071",
                },
                {
                    url: "/_next/static/chunks/app/dashboard/principal/textbooks/%5Bid%5D/page-4ca7b8dec1d17a6d.js",
                    revision: "4ca7b8dec1d17a6d",
                },
                {
                    url: "/_next/static/chunks/app/dashboard/principal/textbooks/page-93eafc5dd2b0cca4.js",
                    revision: "93eafc5dd2b0cca4",
                },
                {
                    url: "/_next/static/chunks/app/dashboard/reports/page-03fd4fdfa263a4bc.js",
                    revision: "03fd4fdfa263a4bc",
                },
                {
                    url: "/_next/static/chunks/app/dashboard/settings/page-3a1865a989f26d94.js",
                    revision: "3a1865a989f26d94",
                },
                {
                    url: "/_next/static/chunks/app/dashboard/textbooks/%5Bid%5D/edit/page-f8ce15360990520b.js",
                    revision: "f8ce15360990520b",
                },
                {
                    url: "/_next/static/chunks/app/dashboard/textbooks/%5Bid%5D/page-dbf72710f9e30443.js",
                    revision: "dbf72710f9e30443",
                },
                {
                    url: "/_next/static/chunks/app/dashboard/textbooks/create/page-1c3171e1a89b0287.js",
                    revision: "1c3171e1a89b0287",
                },
                {
                    url: "/_next/static/chunks/app/dashboard/textbooks/page-436af51e43516cd6.js",
                    revision: "436af51e43516cd6",
                },
                {
                    url: "/_next/static/chunks/app/layout-3bcaba92a99323e5.js",
                    revision: "3bcaba92a99323e5",
                },
                {
                    url: "/_next/static/chunks/app/login/page-f3b3ed38a0ba8234.js",
                    revision: "f3b3ed38a0ba8234",
                },
                {
                    url: "/_next/static/chunks/app/page-fb159c2e3228d7db.js",
                    revision: "fb159c2e3228d7db",
                },
                {
                    url: "/_next/static/chunks/d0d48230-ca7498df57a8f579.js",
                    revision: "ca7498df57a8f579",
                },
                {
                    url: "/_next/static/chunks/framework-b132855af43039e5.js",
                    revision: "b132855af43039e5",
                },
                {
                    url: "/_next/static/chunks/main-app-00e23636a2717688.js",
                    revision: "00e23636a2717688",
                },
                {
                    url: "/_next/static/chunks/main-e717133f534dd7eb.js",
                    revision: "e717133f534dd7eb",
                },
                {
                    url: "/_next/static/chunks/pages/_app-474dadaabca347fa.js",
                    revision: "474dadaabca347fa",
                },
                {
                    url: "/_next/static/chunks/pages/_error-3ab81c816bc452f8.js",
                    revision: "3ab81c816bc452f8",
                },
                {
                    url: "/_next/static/chunks/polyfills-42372ed130431b0a.js",
                    revision: "846118c33b2c0e922d7b3a7676f81f6f",
                },
                {
                    url: "/_next/static/chunks/webpack-b9fe33ca9e4f42f3.js",
                    revision: "b9fe33ca9e4f42f3",
                },
                {
                    url: "/_next/static/css/a81c448746786b48.css",
                    revision: "a81c448746786b48",
                },
                {
                    url: "/_next/static/css/deab5e58c231edd6.css",
                    revision: "deab5e58c231edd6",
                },
                {
                    url: "/_next/static/media/2aff15d16238579e-s.woff2",
                    revision: "76daaf69711b5801c6d50b46817e00cf",
                },
                {
                    url: "/_next/static/media/3916ba59bc59a9e6-s.p.woff2",
                    revision: "07d3fb84cd8af9d0f28160e71aaff063",
                },
                {
                    url: "/_next/static/media/39378a05e946b3c7-s.p.woff2",
                    revision: "a2a937c9f7d4347e6985f8afde01dd9c",
                },
                {
                    url: "/_next/static/media/40d40f0f334d7ad1-s.p.woff2",
                    revision: "563bd3dfdb4021fab2835f28c88f7eb7",
                },
                {
                    url: "/_next/static/media/6146a424f10a4bc8-s.p.woff2",
                    revision: "dbfea0947484f82967409bfb794bcfb1",
                },
                {
                    url: "/_next/static/media/6a9c36ea9dc9b36b-s.woff2",
                    revision: "2ff2e1d51f89a9391b6ee71296a62a79",
                },
                {
                    url: "/_next/static/media/81f44dd2e4d3cabf-s.woff2",
                    revision: "faa152e1a04cec4519424ba2116bb747",
                },
                {
                    url: "/_next/static/media/abfec168c8990f67-s.woff2",
                    revision: "f83a932e4390acc2339567f36b215614",
                },
                {
                    url: "/_next/static/media/eeb7fd9c9500fd85-s.woff2",
                    revision: "9a77b98f0bdfb8b48e86668e1f94b1cc",
                },
                {
                    url: "/_next/static/media/f9b6e90e0d3aa02f-s.woff2",
                    revision: "c16df6fbc02f080222a04464c3da1919",
                },
                {
                    url: "/_next/static/zgebrfpL4TGokZT_g_jc6/_buildManifest.js",
                    revision: "8b904d9257f268dc8dc04348b5001c1a",
                },
                {
                    url: "/_next/static/zgebrfpL4TGokZT_g_jc6/_ssgManifest.js",
                    revision: "b6652df95db52feb4daf4eca35380933",
                },
                {
                    url: "/file.svg",
                    revision: "d09f95206c3fa0bb9bd9fefabfd0ea71",
                },
                {
                    url: "/globe.svg",
                    revision: "2aaafa6a49b6563925fe440891e32717",
                },
                {
                    url: "/images/logo_transparent_bg.png",
                    revision: "3a837b317f6990ae4f59f4b5561cea49",
                },
                {
                    url: "/images/logo_white_bg.png",
                    revision: "cf1c18b80768ca75dada9fd3c4c8a3f3",
                },
                {
                    url: "/manifest.json",
                    revision: "ded59ecd403c5c2d25210f878dd3ba51",
                },
                {
                    url: "/next.svg",
                    revision: "8e061864f388b47f33a1c3780831193e",
                },
                {
                    url: "/offline.html",
                    revision: "4b82fc083433fad5965b649965b192af",
                },
                {
                    url: "/simple-offline-test.js",
                    revision: "1e20b1e6e948e09cc03fcc25f12d2fad",
                },
                {
                    url: "/test-offline.js",
                    revision: "f2d9f5d5f935a625de5ccb90a1ee567a",
                },
                {
                    url: "/vercel.svg",
                    revision: "c0af2f507b369b085b35ef4bbe3bcf1e",
                },
                {
                    url: "/window.svg",
                    revision: "a2760511c65806022ad20adf74370ff3",
                },
            ],
            { ignoreURLParametersMatching: [] }
        ),
        e.cleanupOutdatedCaches(),
        e.registerRoute(
            "/",
            new e.NetworkFirst({
                cacheName: "start-url",
                plugins: [
                    {
                        cacheWillUpdate: async ({
                            request: e,
                            response: s,
                            event: a,
                            state: c,
                        }) =>
                            s && "opaqueredirect" === s.type
                                ? new Response(s.body, {
                                      status: 200,
                                      statusText: "OK",
                                      headers: s.headers,
                                  })
                                : s,
                    },
                    {
                        handlerDidError: async ({ request: e }) =>
                            self.fallback(e),
                    },
                ],
            }),
            "GET"
        ),
        e.registerRoute(
            /^https?:\/\/(localhost:3004|ecole\.ebene\.ci)\/.*$/,
            new e.NetworkFirst({
                cacheName: "pages-cache",
                networkTimeoutSeconds: 3,
                plugins: [
                    new e.ExpirationPlugin({
                        maxEntries: 50,
                        maxAgeSeconds: 86400,
                    }),
                    {
                        handlerDidError: async ({ request: e }) =>
                            self.fallback(e),
                    },
                ],
            }),
            "GET"
        ),
        e.registerRoute(
            /^https?:\/\/(ecole\.yeminiservices\.com|localhost:8000)\/api\/.*$/,
            new e.NetworkFirst({
                cacheName: "api-cache",
                networkTimeoutSeconds: 5,
                plugins: [
                    new e.ExpirationPlugin({
                        maxEntries: 100,
                        maxAgeSeconds: 3600,
                    }),
                    new e.CacheableResponsePlugin({ statuses: [0, 200, 404] }),
                    {
                        handlerDidError: async ({ request: e }) =>
                            self.fallback(e),
                    },
                ],
            }),
            "GET"
        ),
        e.registerRoute(
            /\.(?:png|jpg|jpeg|svg|gif|webp|ico|css|js)$/,
            new e.CacheFirst({
                cacheName: "static-assets",
                plugins: [
                    new e.ExpirationPlugin({
                        maxEntries: 200,
                        maxAgeSeconds: 604800,
                    }),
                    {
                        handlerDidError: async ({ request: e }) =>
                            self.fallback(e),
                    },
                ],
            }),
            "GET"
        ),
        e.registerRoute(
            /^https?:\/\/fonts\.googleapis\.com\/.*$/,
            new e.CacheFirst({
                cacheName: "google-fonts",
                plugins: [
                    new e.ExpirationPlugin({
                        maxEntries: 10,
                        maxAgeSeconds: 31536e3,
                    }),
                    {
                        handlerDidError: async ({ request: e }) =>
                            self.fallback(e),
                    },
                ],
            }),
            "GET"
        ));
});
