 var path = require('path');
 var webpack = require('webpack');

 module.exports = {
     entry: './public/index.js',
     output: {
         path: path.resolve(__dirname, 'public/build'),
         filename: 'index.bundle.js'
     },
     module: {
         loaders: [
             {
                 test: /\.js$/,
                 loader: 'babel-loader',
                 query: {
                     presets: ['es2015', 'react']
                 }
             },
			{
                test: /\.css$/,
                loaders: ['style-loader', 'css-loader']
			},
			{
				test: /\.png$/,
				loader: "url-loader",
				query: { mimetype: "image/png" }
			}
		]
     },
     stats: {
         colors: true
     },
     devtool: 'source-map'
 };