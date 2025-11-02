const path = require("path");

module.exports = {
  presets: [
    path.resolve("/app/node_modules/@babel/preset-env"),
    path.resolve("/app/node_modules/@babel/preset-react"),
  ],
};
