"use strict";
const path = require('path');

module.exports = {
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    entry: ['./src/main.js'],
    output: {
        path: path.join(__dirname, "js"),
        filename: "main.js"
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel',
                query: {
                    presets: ['react', 'es2015']
                }
            }
        ]
    }
};