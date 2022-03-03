import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';
import builtins from 'rollup-plugin-node-builtins';

const production = !process.env.ROLLUP_WATCH;

export default [{
    input: './app/app.js',
    output: {
	file: '../../assets/js/bundle.app.js',
	format: 'iife',
	sourcemap: true
    },
    plugins: [
	builtins(),
        resolve(), // tells Rollup how to find in node_modules
        commonjs(), // converts to ES modules
        postcss({minimize:production}),
        production && terser() // minify, but only in production
    ]
}]
