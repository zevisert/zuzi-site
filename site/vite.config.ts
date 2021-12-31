import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

import minifyHTML from "rollup-plugin-minify-html-literals";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: ".build",
    rollupOptions: {
      external: ["https://js.stripe.com/v3/"],
      plugins: [minifyHTML()],
    },
  },
  plugins: [
    VitePWA({
      manifest: {
        name: "Zuzana Riha Art",
        short_name: "Zuzi Art",
        description: "Online store and gallery",
        start_url: "/",
        display: "standalone",
        theme_color: "#3f51b5",
        background_color: "#3f51b5",
        icons: [
          {
            src: "/images/manifest/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/images/manifest/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        importScripts: ["push-listener.js"],
        swDest: ".build/service-worker.js",
        globDirectory: ".",
        globPatterns: [
          "src/components/about/index.js",
          "src/components/cart/index.js",
          "src/components/cart/shop-cart.js",
          "src/components/cart/shop-checkout.js",
          "src/components/gallery/gallery-list-item.js",
          "src/components/gallery/gallery-list.js",
          "src/components/gallery/index.js",
          "src/components/zuzi-app/index.js",
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: "StaleWhileRevalidate",
          },
          {
            urlPattern: "/uploads/(.*)",
            handler: "CacheFirst",
            options: {
              cacheName: "artwork",
            },
          },
          {
            urlPattern: "/api/:version/(.*)",
            handler: "NetworkOnly",
          },
        ],
      },
    }),
  ],
});
