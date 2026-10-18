import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

export default {
  context: root,
  mode: "production",
  target: "web",
  entry: {
    "oauth-picker": "./src/oauth-web/oauth/picker.entry.mjs",
    "oauth-result": "./src/oauth-web/oauth/result.entry.mjs",
    "oauth-success": "./src/oauth-web/oauth/success.entry.mjs",
  },
  output: {
    filename: "[name].js",
    path: resolve(root, "dist"),
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
