'use strict'

var path        = require('path');
var webpack     = require('webpack');
var Manifest    = require('manifest-revision-webpack-plugin');
var TextPlugin  = require('extract-text-webpack-plugin');
var HtmlPlugin    = require('html-webpack-plugin');

module.exports = function(_path) {

    //define local variables
    var dependencies  = Object.keys(require(_path + '/package').dependencies);
    var rootAssetPath = _path + 'app';

    return {
        // точки входа
        entry: {
            application: _path + '/app/app.js',
            vendors: dependencies
        },

        // то, что получим на выходе
        output: {
            path: path.join(_path, 'dist'),
            filename: path.join('assets', 'js', '[name].bundle.[chunkhash].js'),
            chunkFilename: '[id].bundle.[chunkhash].js',
            publicPath: '/'
        },

        // Небольшие настройки связанные с тем, где искать сторонние библиотеки
        resolve: {
            extensions: ['', '.js'],
            modulesDirectories: ['node_modules'],
            // Алиасы - очень важный инструмент для определения области видимости ex. require('_modules/test/index')
            alias: {
                _svg:         path.join(_path, 'app', 'assets', 'svg'),
                _data:        path.join(_path, 'app', 'data'),
                _fonts:       path.join(_path, 'app', 'assets', 'fonts'),
                _modules:     path.join(_path, 'app', 'modules'),
                _images:      path.join(_path, 'app', 'assets', 'images'),
                _stylesheets: path.join(_path, 'app', 'assets', 'stylesheets'),
                _templates:   path.join(_path, 'app', 'assets', 'templates')
            }
        },
        // Настройка загрузчиков, они выполняют роль обработчика исходного файла в конечный
        module: {
            loaders: [
                { test: /\.jade$/, loader: 'jade-loader' },
                { test: /\.(css|ttf|eot|woff|woff2|png|ico|jpg|jpeg|gif|svg)$/i, loaders: ['file?context=' + rootAssetPath + '&name=assets/static/[ext]/[name].[hash].[ext]'] },
                { test: /\.styl$/, loader: TextPlugin.extract('style-loader', 'css-loader!autoprefixer-loader?browsers=last 5 version!stylus-loader') }
            ]
        },

        // загружаем плагины
        plugins: [
            new webpack.optimize.CommonsChunkPlugin('vendors', 'assets/js/vendors.[hash].js'),
            new TextPlugin('assets/css/[name].[hash].css'),
            new Manifest(path.join(_path + '/config', 'manifest.json'), {
                rootAssetPath: rootAssetPath
            }),
            // Этот файл будет являться "корневым" index.html
            new HtmlPlugin({
                title: 'Test APP',
                chunks: ['application', 'vendors'],
                filename: 'index.html',
                template: path.join(_path, 'app', 'index.html')
            })
        ]
    }
};