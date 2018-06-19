import multiEntry from 'rollup-plugin-multi-entry';

export default {
  input: 'tests/**/*-test.js',
  external: [
    'ava',
    'fs',
    'path',
    'util',
    'stream',
    'buffer',
    'events',
    'constants',
    'tar-stream',
    'pump',
    'expression-expander',
    'pratt-parser'
  ],
  plugins: [multiEntry()],

  output: {
    file: 'build/bundle-test.js',
    format: 'cjs',
    sourcemap: true,
    interop: false
  }
};
