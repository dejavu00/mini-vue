import typescript from '@rollup/plugin-typescript';
// import pkg from './package.json';
import { readFileSync } from "fs";
const pkg = JSON.parse(readFileSync('package.json', {encoding: 'utf8'}));
export default {
  input: './src/index.ts',
  output: [
    // 1.cj - common.js
    // 2.esm
    {
      format: 'cjs',
      file: pkg.main
    },
    {
      format: 'es',
      file: pkg.module
    }
  ],
  plugins: [typescript()]
};
