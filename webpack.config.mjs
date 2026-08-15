import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

export default {
  entry: {
    "oauth-picker": "./src/oauth-web/oauth-picker.entry.mjs",
    "oauth-result": "./src/oauth-web/oauth-result.entry.mjs",
    "oauth-success": "./src/oauth-web/oauth-success.entry.mjs",
  },
  output: {
    filename: "[name].mjs",
    path: new URL("./src/oauth-web/bundled/", import.meta.url).pathname,
    clean: true,
  },
  module: {
    rules: [{ test: /\.css$/i, use: [MiniCssExtractPlugin.loader, "css-loader"] }],
  },
  plugins: [new MiniCssExtractPlugin({ filename: "[name].css" })],
  optimization: { minimizer: ["...", new CssMinimizerPlugin()] },
  devtool: false,
};
