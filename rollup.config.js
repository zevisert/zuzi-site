import resolve from "@rollup/plugin-node-resolve";
// import { terser } from "rollup-plugin-terser";
import minifyHTML from "rollup-plugin-minify-html-literals";
import externals from "rollup-plugin-node-externals";
import copy from "rollup-plugin-copy";
import { generateSW } from "rollup-plugin-workbox";
import workboxConfig from "./workbox-config.js";

import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import filesize from "rollup-plugin-filesize";

// The main JavaScript bundle for modern browsers that support
// JavaScript modules and other ES2015+ features.
export default [
  // Modern module based build
  {
    input: [
      "src/components/about/index.js",
      "src/components/cart/index.js",
      "src/components/cart/shop-cart.js",
      "src/components/cart/shop-checkout.js",
      "src/components/gallery/gallery-list-item.js",
      "src/components/gallery/gallery-list.js",
      "src/components/gallery/index.js",
      "src/components/zuzi-app/index.js",
    ],
    preserveEntrySignatures: true,
    output: {
      dir: `build/modern/`,
      format: "es",
      preserveModules: true,
    },
    plugins: [
      minifyHTML(),
      copy({
        targets: [
          {
            src: "node_modules/@webcomponents",
            dest: "build/modern/node_modules",
          },
          { src: "images", dest: "build/modern" },
          {
            src: "index.html",
            dest: "build/modern",
            transform: (contents, filename) =>
              contents
                .toString()
                .replace('<base href="/">', '<base href="/modern/">'),
          },
          { src: "manifest.json", dest: "build/modern" },
          { src: "push-manifest.json", dest: "build/modern" },
        ],
      }),
      externals(),
      resolve(),
      // process.env.NODE_ENV !== "development" ? terser() : () => {},
      filesize({
        showGzippedSize: true,
        showBrotliSize: false,
        showMinifiedSize: false,
      }),
    ],
  },

  // Modern build service worker
  {
    input: "service-worker.js",
    output: {
      format: "es",
      dir: "build/modern",
    },
    plugins: [generateSW(workboxConfig)],
  },

  // Legacy browser bundle
  {
    input: [
      "src/components/about/index.js",
      "src/components/cart/index.js",
      "src/components/cart/shop-cart.js",
      "src/components/cart/shop-checkout.js",
      "src/components/gallery/gallery-list-item.js",
      "src/components/gallery/gallery-list.js",
      "src/components/gallery/index.js",
      "src/components/zuzi-app/index.js",
    ],
    preserveEntrySignatures: false,
    output: {
      dir: `build/legacy/`,
      format: "systemjs",
    },
    plugins: [
      minifyHTML(),
      babel({
        babelrc: false,
        ...{
          presets: [
            [
              "@babel/preset-env",
              {
                targets: {
                  ie: "11",
                },
              },
            ],
          ],
        },
      }),
      resolve(),
      copy({
        targets: [
          {
            src: "node_modules/@webcomponents",
            dest: "build/legacy/node_modules",
          },
          {
            src: "node_modules/systemjs/dist/s.min.js",
            dest: "build/legacy/node_modules/systemjs/dist",
          },
          {
            src: "images",
            dest: "build/legacy",
          },
          {
            src: "index-legacy.html",
            dest: "build/legacy",
            rename: "index.html"
          },
          { src: "manifest.json", dest: "build/legacy" },
        ],
      }),
      // process.env.NODE_ENV !== "development" ? terser() : () => {},
      filesize({
        showGzippedSize: true,
        showBrotliSize: false,
        showMinifiedSize: false,
      }),
    ],
  },
  // Babel polyfills for older browsers that don't support ES2015+.
  {
    input: "src/babel-polyfills-nomodule.js",
    output: {
      file: "build/legacy/babel-polyfills-nomodule.js",
      format: "iife",
    },
    plugins: [
      commonjs({
        include: ["node_modules/**"],
      }),
      resolve(),
    ],
  },
];
