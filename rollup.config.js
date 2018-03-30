import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import pkg from './package.json';

export default [
	{
		input: 'req-json.js',
		output: [
			{
				file: pkg.main,
				format: 'cjs'
			},
			{
				file: pkg.module,
				format: 'es'
			},
			{
				name: 'ReqJSON',
				file: pkg.unpkg,
				format: 'umd'
			}
		],
		plugins: [
			resolve(),
			babel()
		]
	}
];
