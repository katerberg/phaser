const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = () => ({
  entry: './src/index.ts',
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      template: './src/index.html',
      bodyHtmlSnippet: '<div class="contents"></div>',
      title: 'Phaser',
    }),
  ],
  output: {
    path: `${__dirname}/public`,
    publicPath: '/',
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader'],
      },
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(eot|otf|ttf|woff|woff2)$/,
        use: 'file-loader',
      },
    ],
  },
  resolve: {
    extensions: ['*', '.tsx', '.ts', '.js'],
  },
  devServer: {
    contentBase: './public',
    historyApiFallback: true,
  },
});
