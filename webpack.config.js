'use strict';

const NODE_ENV = process.env.NODE_ENV || 'development';

const webpack = require('webpack');
const rimraf = require('rimraf');
const BowerWebpackPlugin = require('bower-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const autoprefixer = require('autoprefixer');
const AssetsPlugin = require('assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

function addHash(template, hash) {
    return NODE_ENV == 'production'? template.replace(/\.[^.]+$/, `.[${hash}]$&`) : `${template}?hash=[${hash}]`;
}

module.exports = {
    context: __dirname + '/frontend',

    entry:   {
        main: './main'
    },
    output:  {
        path: __dirname + '/public',
        publicPath: '/',
        filename: addHash('[name].js', 'chunkhash'),
        chunkFilename: addHash('[id].js', 'chunkhash'),
        library: '[name]'
    },
    module:  {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                loader: 'babel',
                query: {
                    presets: ['es2015'],
                    plugins: ['transform-runtime']
                }
            },
            {
                test:   /\.css$/,
                loader:ExtractTextPlugin.extract('css!postcss')
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('css!resolve-url!postcss!sass?sourceMap')
            },

            { test: /\.json$/, loader: 'json' },

            // { test:   /\.jade$/, loader: "jade" },
            // { test: /\.styl$/, loader: 'style!css!autoprefixer?'+ JSON.stringify},

            {
                test: /\.(eot|woff|ttf|svg|png|jpg)$/,
                loader: addHash('url-loader?limit=30000&name=[path][name].[ext]', 'hash:4')
            }
        ]
    },
    postcss: [ autoprefixer({ browsers: ['last 3 versions', '> 1%'] }) ],

    watch: NODE_ENV == 'development',

    watchOptions: {
        aggregateTimeout: 100
    },

    devtool: NODE_ENV == 'development' ? "cheap-inline-module-source-map" : null,

    plugins: [
        new BowerWebpackPlugin({
            modulesDirectories: ['bower_components'],
            manifestFiles: ['bower.json', '.bower.json'],
            includes: /.*/,
            excludes: /.*\.scss$/
        }),
        new webpack.NoErrorsPlugin(),
        new webpack.DefinePlugin({
            NODE_ENV: JSON.stringify(NODE_ENV),
            LANG: JSON.stringify('ru')
        }),
        new ExtractTextPlugin(addHash('css/[name].css', 'contenthash'), {allChunks: true}),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'common',
            minChunks: 2
        }),
        new AssetsPlugin({
           filename: 'public.json',
            path: __dirname + '/public'
        }),
        // new CopyWebpackPlugin([
        //     { from: 'public' }
        // ]),
        // new HtmlWebpackPlugin(), // Generates default index.html
        // new HtmlWebpackPlugin({  // Also generate a test.html
        //     filename: 'test.html',
        //     template: '{}'
        // }),


        {
            apply: (compiler) => {
                rimraf.sync(compiler.options.output.path);
            }
        }
    ],

    resolve: {
        modulesDirectories: ['node_modules'],
            extensions: ['', '.js', '.sass']
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
            beautify: false,
            comments: false,
            compress: {
                sequences   : true,
                booleans    : true,
                loops       : true,
                unused      : true,
                warnings    : false,
                drop_console: true,
                unsafe      : true
            }
        }),
        new webpack.optimize.AggressiveMergingPlugin({
            minSizeReduce: 1.5,
            moveToParents: true
        })
    );
}