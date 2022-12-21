const path = require("path");
const webpack = require('webpack')
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0
module.exports = 
{
  mode: "development",
  entry: "./test_main.js",  
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
    library: "common",	// !!!추가!!!
  },
  
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      }
    ],
  },
  resolve: {
    modules: ['./home/shpark/zulip/mrchaos/zulip-js/node_modules'],
    extensions: ['.js', '.json', '.jsx', '.css','.ts'],
    fallback: {
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer")
  }    
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),    
    // new webpack.DefinePlugin({
    //     'process.env.NODE_ENV': JSON.stringify('development')
    // }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
  }),    
],      
};
