const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: './src/main.js',
    module: {
    rules: [
        {
            test: /\.(js|jsx)$/,
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
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ],
    devServer: {
      contentBase: './',
      hot: true
    }
  };