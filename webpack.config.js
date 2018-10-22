const path = require('path');
const env = process.env.NODE_ENV === 'production';

module.exports = {
  entry: [ './src/js/app.js', './src/sass/style.scss' ],
  output: {
    filename: 'js/main.js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: env ? 'production' : 'development',
  optimization: {
    minimize: env
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },

      // https://florianbrinkmann.com/en/4240/sass-webpack/
      {
        test: /\.scss$/, use: [
          { loader: 'file-loader',
            options: {
              name: 'css/style.css'
            }
          },
          {
            loader: 'extract-loader'
          },
          {
            loader: 'css-loader?-url'
          },
          {
            loader: 'postcss-loader'
          },
          {
            loader: 'sass-loader'
          }
        ]
      }
    ]
  }
};
