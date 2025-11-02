const path = require("path");

module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: { node: "current" },
        modules: "commonjs",
      },
    ],
    [
      "@babel/preset-react",
      {
        runtime: "automatic",
        development: process.env.NODE_ENV !== "production",
      },
    ],
  ],
  plugins: [],
  ignore: ["node_modules"],
};
