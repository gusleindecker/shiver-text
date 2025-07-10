import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import dts from "rollup-plugin-dts";

const config = [
  // UMD build (for script tags)
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "umd",
      name: "ShiverText",
      sourcemap: true,
      exports: "named",
    },
    plugins: [
      nodeResolve(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false,
        declarationMap: false,
        outDir: "dist",
      }),
      terser({
        format: {
          comments: false,
        },
        compress: {
          drop_console: false,
        },
      }),
    ],
  },
  // ES Module build
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.mjs",
      format: "es",
      sourcemap: true,
    },
    plugins: [
      nodeResolve(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false, // We'll handle declarations separately
        declarationMap: false,
        outDir: "dist",
      }),
      terser({
        format: {
          comments: false, // Remove comments
        },
        compress: {
          drop_console: true,
        },
      }),
    ],
  },
  // TypeScript declarations
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.d.ts",
      format: "es",
    },
    plugins: [dts()],
  },
];

export default config;
