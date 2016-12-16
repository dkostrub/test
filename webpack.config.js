'use strict';

const NODE_ENV = process.env.NODE_ENV || 'development';

const webpack = require('webpack');
const BowerWebpackPlugin = require('bower-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const autoprefixer = require('autoprefixer');
const AssetsPlugin = require('assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
// const Manifest = require('manifest-revision-webpack-plugin');

function addHash(template, hash) {
    return NODE_ENV == 'production' ? template.replace(/\.[^.]+$/, `.[${hash}]$&`) : `${template}?hash=[${hash}]`;
}

module.exports = {
    context: __dirname + '/frontend',

    entry:   {
        main: './main'
    },
    output:  {
        path: __dirname + '/public',
        publicPath: '/public/',
        filename: addHash('[name].js', 'chunkhash'),
        chunkFilename: addHash('[id].js', 'chunkhash'),
        library: '[name]'
    },
    module:  {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: ['es2015'],
                    plugins: ['transform-runtime']
                }
            },
            {
                test:   /\.css$/,
                exclude: /node_modules/,
                loader:ExtractTextPlugin.extract('css?sourceMap!postcss')
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
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
        new HtmlWebpackPlugin({
            title: 'Test Webpack',
            hash: true,
            inject: false,
            filename: 'index.html',
            template: __dirname + '/frontend/tpl/index.tpl.html',
            // chunks: ['common', 'about'],
            // environment: process.env.NODE_ENV

            // Optional
            // appMountId: 'app',
            // baseHref: 'http://example.com/awesome',
            // devServer: 'http://localhost:3000',
            googleAnalytics: {
                trackingId: 'UA-XXXX-XX',
                pageViewOnLoad: true
            },
            meta: {
                description: 'A better default template for html-webpack-plugin.'
            },
            mobile: true,
            links: [
                'https://fonts.googleapis.com/css?family=Roboto',
                {
                    href: '/apple-touch-icon.png',
                    rel: 'apple-touch-icon',
                    sizes: '180x180'
                },
                {
                    href: '/favicon-32x32.png',
                    rel: 'icon',
                    sizes: '32x32',
                    type: 'image/png'
                }
            ],
            // inlineManifestWebpackName: 'webpackManifest', //разобраться почему не работает
            // scripts: [
            //     'http://example.com/somescript.js',
            //     {
            //         src: '/myModule.js',
            //         type: 'module'
            //     }
            // ],
            // window: {
            //     env: {
            //         apiHost: 'http://myapi.com/api/v1'
            //     }
            // }

        }),
        // new HtmlWebpackPlugin ({
        //     files: {
        //         css: [ "main.css" ],
        //         js: [ "public/main.js", "public/common.js"],
        //         chunks: {
        //             head: {
        //                 entry: "assets/head_bundle.js",
        //                 css: [ "main.css" ]
        //             },
        //             main: {
        //                 entry: "assets/main_bundle.js",
        //                 css: []
        //             },
        //         }
        //     }
        // })

    ],

    resolve: {
        modulesDirectories: ['node_modules'],
            extensions: ['', '.js', '.sass', '.scss']
    },

    resolveLoader: {
        modulesDirectories: ['node_modules'],
            moduleTemplates: ['*-loader', '*'],
            extensions: ['', '.js']
    },

    devServer: {
        host: 'localhost',
        port: 3000,
        contentBase: __dirname + '/frontend',
        hot: true
    }
};

if(NODE_ENV == 'production') {
    module.exports.plugins.push(
        new webpack.optimize.DedupePlugin(),
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
        }),
        new CleanPlugin(
            path.join('public', 'webpack'),
            { root: path.join(process.cwd()) }
        ),
        new AssetsPlugin({
            filename: 'production.json',
            path: __dirname + '/public/prodaction',
            prettyPrint: true
        }),
        new webpack.optimize.OccurrenceOrderPlugin() // Надо проверить в необхлжимости
    );
}