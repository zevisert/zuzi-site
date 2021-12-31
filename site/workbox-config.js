/**
 * @license
 * Copyright (c) Zev Isert, All rights reserved
 * This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
 */

export default {
  importScripts: ["./push-listener.js"],
  swDest: ".build/modern/service-worker.js",
  globDirectory: ".",
  globPatterns: [
    "manifest.json",
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
      urlPattern: /\/@webcomponents\/webcomponentsjs\//,
      handler: "StaleWhileRevalidate",
    },
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
};
