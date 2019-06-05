// webpack配置
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

function resolve (dir) {
    return path.join(__dirname, '.', dir);
}

module.exports = {
    entry: {
        app: './src/index.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.js', '.vue', '.json', '.css', '.scss'],
        alias: {
            '@': resolve('src/views'),
            'core': resolve('src/vue/core'),
            'shared': resolve('src/vue/shared'),
            'web': resolve('src/vue/platforms/web'),
            'weex': resolve('src/vue/platforms/weex'),
            'server': resolve('src/vue/server'),
            'sfc': resolve('src/vue/sfc'),
            'compiler': resolve('src/vue/compiler'),
            'entries': resolve('src/vue/entries')
        }
    },
    devServer: {
        hot: true,
        contentBase: false,
        host: 'localhost',
        port: 4390
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [resolve('src'), resolve('node_modules/webpack-dev-server/client')]
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            inject: true
        })
    ]
};
