const path = require('path');
const webpack = require('webpack');
require('dotenv').config();

module.exports = {
  entry: {
    app: './js/app.js',
    survey: './js/survey.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: './js/[name].js',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.APPS_SCRIPT_URL': JSON.stringify(process.env.APPS_SCRIPT_URL || ''),
    }),
  ],
};
