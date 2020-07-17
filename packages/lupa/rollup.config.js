import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
// import typescript from "@rollup/plugin-typescript";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import replace from "@rollup/plugin-replace";

const packageJson = require("./package.json");

const PRETTY = !!process.env.PRETTY;

const modules = [
  {
    input: "index.tsx",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: !PRETTY,
      },
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: !PRETTY,
      },
    ],
    external: ["react"],
    plugins: [
      resolve(),
      commonjs(),
      typescript({ useTsconfigDeclarationDir: true }),
    ],
  },
];

// UMD modules for <script> tags and CommonJS (node)
const globals = [
  {
    input: "index.tsx",
    output: {
      file: packageJson.unpkg.replace("production.min", "development"),
      format: "umd",
      sourcemap: !PRETTY,
      globals: { react: "React" },
      name: "Lupa",
    },
    external: ["react"],
    plugins: [
      typescript({ useTsconfigDeclarationDir: true }),
      resolve(),
      commonjs(),
      replace({ "process.env.NODE_ENV": JSON.stringify("development") }),
    ],
  },
  {
    input: "index.tsx",
    output: {
      file: packageJson.unpkg,
      format: "umd",
      sourcemap: !PRETTY,
      globals: { react: "React" },
      name: "Lupa",
    },
    external: ["react"],
    plugins: [
      typescript({ useTsconfigDeclarationDir: true }),
      resolve(),
      commonjs(),
      replace({ "process.env.NODE_ENV": JSON.stringify("production") }),
      terser(),
    ],
  },
];

export default [...modules, ...globals];
