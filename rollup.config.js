import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

const config = [
  {
    input: "src/index.ts",
    output: [
      {
        // ES modules for browsers
        file: "dist/index.esm.js",
        format: "es",
        sourcemap: true,
      },
      {
        // CommonJS for Node.js
        file: "dist/index.cjs.js",
        format: "cjs",
        sourcemap: true,
      },
      {
        // Universal format for browsers via script tags
        file: "dist/index.js",
        format: "umd",
        name: "ShiverTextLib",
        sourcemap: true,
      },
    ],
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: true,
        declarationDir: "dist",
        rootDir: "src",
      }),
    ],
    external: [],
  },
  // Bundle type definitions
  {
    input: "dist/index.d.ts",
    output: {
      file: "dist/index.d.ts",
      format: "esm",
    },
    plugins: [dts()],
  },
];

export default config;
