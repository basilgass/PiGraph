const path = require('path');
/*const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;*/

module.exports = {
    mode: 'production',
    entry: './src/main.ts',
    /*devtool: 'inline-source-map',*/
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
        extensions: ['.tsx','.ts', '.js'],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'pigraphe.js',
        library: 'PiGraphe',
        libraryTarget: "umd"
    },
    optimization: {
        splitChunks: {
            chunks: "all"
        }
    },
    externals: {
        '@svgdotjs/svg.js': '@svgdotjs/svg.js',
        '@svgdotjs/svg.draggable.js': '@svgdotjs/svg.draggable.js'
    },
    /*plugins: [
        new BundleAnalyzerPlugin()
    ]*/
};