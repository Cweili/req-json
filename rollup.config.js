import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import pkg from './package.json';

const banner = `/*!
 * req-json by @Cweili - https://github.com/Cweili/req-json
 */`;

const plugins = [
  resolve(),
  babel(),
];

export default [
  {
    input: 'index.js',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        banner,
      },
      {
        file: pkg.module,
        format: 'es',
        banner,
      },
      {
        name: 'ReqJSON',
        file: pkg.unpkg,
        format: 'umd',
        banner,
      },
    ],
    plugins,
  },
  {
    input: 'wx.js',
    output: [
      {
        file: 'dist/req-json.wx.js',
        format: 'cjs',
        banner,
      },
      {
        file: 'dist/req-json.wx.esm.js',
        format: 'es',
        banner,
      },
    ],
    plugins,
  },
];
