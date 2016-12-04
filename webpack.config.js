'use strict';

const NODE_ENV = process.env.NODE_ENV || 'development';

const webpack = require('webpack');
const rimraf = require('rimraf');
const BowerWebpackPlugin = require('bower-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const autoprefixer = require('autoprefixer');

const autoprefixerOptions = {
    browsers: [
        'last 2 versions',
        'iOS >= 7',
        'Android >= 4',
        'Explorer >= 10',
        'ExplorerMobile >= 11'
    ],
    cascade: false
};

module.exports = {
    context: __dirname + '/dev',

    entry:   "js/main.js",
    output:  {
        path: __dirname + '/prod/build',
        publicPath: "/prod/",
        filename: 'js/[name].js',
        library: '[name]'
    },
    module:  {
        loaders: [
            {
                test:   /\.css$/,
                loader: "style-loader!css-loader!postcss-loader"
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('style', 'css!autoprefixer?'+ JSON.stringify(autoprefixerOptions) +'!sass?resolve url')
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel',
                query: {
                    presets: ['es2015'],
                    plugins: ['transform-runtime']
                }
            },
            { test: /\.json$/, loader: 'json' },
            // { test:   /\.jade$/, loader: "jade" },
            // { test: /\.styl$/, loader: 'style!css!autoprefixer?'+ JSON.stringify(autoprefixerOptions) },

            {
                test: /\.(eot|woff|ttf|svg|png|jpg)$/,
                loader: 'url-loader?limit=30000&name=[path][name]-[hash].[ext]'
            }
        ]
    },
    postcss: [ autoprefixer({ browsers: ['last 2 versions'] }) ],

    watch: NODE_ENV == 'development',

    devtool: NODE_ENV == 'development' ? 'source-map' : null,

    plugins: [
        new BowerWebpackPlugin({
            modulesDirectories: ['bower_components'],
            manifestFiles: ['bower.json', '.bower.json'],
            includes: /.*/,
            excludes: /.*\.less$/
        }),
        new webpack.NoErrorsPlugin(),
        new webpack.DefinePlugin({
            NODE_ENV: JSON.stringify( NODE_ENV )
        }),
        new ExtractTextPlugin('css/[name].css?[hash]', {allChunks: true}),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'common',
            minChunks: 2
        }),
        new CopyWebpackPlugin([
            { from: 'static' }
        ])
    ],

    resolve: {
        modulesDirectories: ['node_modules'],
            extensions: ['', '.js']
    },

    resolveLoader: {
        modulesDirectories: ['node_modules'],
            moduleTemplates: ['*-loader', '*'],
            extensions: ['', '.js']
    }
};

if(NODE_ENV == 'production') {
    module.exports.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                drop_console: true,
                unsafe: true
            }
        })
    );
}