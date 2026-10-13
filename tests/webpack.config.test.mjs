import config from "../src/webpack.config.mjs";
test("webpack config defines all browser entries", () => {
  expect(Object.keys(config.entry)).toEqual(["oauth-picker", "oauth-result", "oauth-success"]);
});
