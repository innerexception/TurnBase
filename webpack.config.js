var webpack = require('webpack');
module.exports = {
    entry: [
        "./index.js"
    ],
    output: {
        path: './src/build',
        filename: "bundle.js"
    },
    devtool: 'source-map',
    module: {
        loaders: [
            { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel', query: {presets:['react','es2015']}},
            { test: /\.css$/, loader: "style!css" },
            {
                test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url?limit=10000&mimetype=application/font-woff"
            }, {
                test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url?limit=10000&mimetype=application/font-woff"
            }, {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url?limit=10000&mimetype=application/octet-stream"
            }, {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                loader: "file"
            }, {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url?limit=10000&mimetype=image/svg+xml"
            }, {
                test: /\.png$/,
                loader: "url-loader?mimetype=image/png"
            }, {
                test: /\.jpg/,
                loader: "url-loader?mimetype=image/jpg"
            }
        ]
    },
    plugins: [
        new webpack.NoErrorsPlugin()
    ]

};