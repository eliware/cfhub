import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { fileURLToPath } from "node:url";

export default {
  entry: {
    "oauth-picker": "./src/oauth-web/picker.entry.mjs",
    "oauth-result": "./src/oauth-web/result.entry.mjs",
    "oauth-success": "./src/oauth-web/success.entry.mjs",
  },
  output: {
    filename: "[name].mjs",
    path: fileURLToPath(new URL("./src/oauth-web/bundled/", import.meta.url)),
    clean: true,
    library: { type: "module" },
  },
  experiments: { outputModule: true },
  module: {
    rules: [{ test: /\.css$/i, use: [MiniCssExtractPlugin.loader, "css-loader"] }],
  },
  plugins: [new MiniCssExtractPlugin({ filename: "[name].css" })],
  optimization: { minimizer: ["...", new CssMinimizerPlugin()] },
  devtool: false,
};
