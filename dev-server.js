let webpack = require('webpack');
let WebpackDevServer = require('webpack-dev-server');
let config = require('./webpack.config.js');
let devServer = new WebpackDevServer(
    webpack(config),
    {
        contentBase: __dirname,
        publicPath: '/public/'
    }
).listen(3000, 'localhost');