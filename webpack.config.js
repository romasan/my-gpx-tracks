const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const production = process.env.npm_lifecycle_event === 'build';

const config = {
    entry: './src/index.js',
    module: {
    rules: [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            use: ['babel-loader']
        }
    ]
    },
    resolve: {
        extensions: ['*', '.js']
    },
    output: {
        path: __dirname + '/dist',
        publicPath: '/dist',
        filename: 'bundle.js'
    },
    optimization: {
        minimizer: [
            new UglifyJsPlugin({})
        ]
    },
    plugins: [],
    devServer: {
        contentBase: './',
        hot: true
    }
};

if (!production) {
    config.plugins.push(
        new webpack.HotModuleReplacementPlugin()
    )
}

module.exports = config;