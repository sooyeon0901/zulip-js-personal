const path = require("path");
// eslint-disable-next-line import/no-extraneous-dependencies
const webpack = require("webpack")  // !!! 추가

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0   // 추가 TLS 무시
module.exports = 
{
  mode: "development",
  entry: "./browser/test_main.js",  
  output: {
    path: path.resolve(__dirname, "./browser/dist"),
    filename: "zulip.cherry.js",
    library: "cw",	// !!!추가!!!  이름은 마음대로
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
    extensions: ['.js', '.json', '.jsx', '.css','.ts'],
    fallback: {
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer")
  }    
  },
  // 아래 추가!!!!
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
