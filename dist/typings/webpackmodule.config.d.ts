declare const _exports: {
    mode: string;
    entry: string;
    module: {
        rules: {
            test: RegExp;
            use: string;
            exclude: RegExp;
        }[];
    };
    resolve: {
        extensions: string[];
    };
    output: {
        path: any;
        filename: string;
        library: string;
        libraryTarget: string;
    };
    optimization: {
        splitChunks: {
            chunks: string;
        };
    };
    externals: {
        '@svgdotjs/svg.js': string;
        '@svgdotjs/svg.draggable.js': string;
        katex: string;
    };
};
export = _exports;
