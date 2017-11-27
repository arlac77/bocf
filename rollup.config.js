import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';
import json from 'rollup-plugin-json';

export default {
  output: {
    file: pkg.bin.bocf,
    format: 'cjs',
    banner: '#!/usr/bin/env node'
  },
  plugins: [nodeResolve(), commonjs(), json()],
  external: ['config-expander'],
  input: pkg.module
};
