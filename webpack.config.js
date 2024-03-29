const path = require('path');

module.exports = {
	mode: 'development',
	entry: './src/main.ts',
	devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_module/,
			},
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js']
	},
	output: {
		filename: 'pigraph.js',
		path: path.resolve(__dirname, 'distStatic')
	},
	/*plugins: [new BundleAnalyzerPlugin()],*/
	externals: {
		// 'mathjs': 'mathjs',
		// '@svgdotjs/svg.js': '@svgdotjs/svg.js'
	}
};