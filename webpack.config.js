const webpack = require('webpack');
module.exports = {
  entry: [
    'babel-polyfill',
    './src/index.jsx'
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          "plugins": ["transform-runtime"]
        }
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader" // creates style nodes from JS strings
          },
          {
            loader: "css-loader" // translates CSS into CommonJS
          }
         
        ]},
      { 
        test: /\.(eot|woff|woff2|ttf)$/,  
        loader: 'url-loader?limit=100000'
      },  
      {
        test: /\.(png|jp(e*)g|svg)$/,  
        use: [{
            loader: 'url-loader?limit=8000&name=/js/images/[name].[ext]'
        }]
    }

    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  output: {
    path: __dirname + '/.build/js',
    publicPath: '/search',
    filename: 'bundle.js'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  devServer: {
    contentBase: '.build/js',
    historyApiFallback: true    
  }
};
