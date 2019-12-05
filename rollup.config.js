import builtins from "builtin-modules";
import cleanup from "rollup-plugin-cleanup";
import executable from "rollup-plugin-executable";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import pkg from "./package.json";
import json from "rollup-plugin-json";

export default {
  output: {
    file: pkg.bin.bocf,
    format: "cjs",
    banner: "#!/usr/bin/env node",
    interop: false
  },
  plugins: [resolve(), commonjs(), json()],
  external: [
    "config-expander",
    "fs",
    "path",
    "util",
    "stream",
    "buffer",
    "events",
    "constants",
    "tar-stream",
    "pump"
  ],
  input: pkg.module
};
