declare const _exports: {
    mode: string;
    entry: string;
    devtool: string;
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
        filename: string;
        path: any;
    };
    externals: {};
};
export = _exports;
