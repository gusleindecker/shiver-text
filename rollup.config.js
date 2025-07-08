import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import dts from "rollup-plugin-dts";

const config = [
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
    ],
  },
  // CommonJS build
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "cjs",
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
