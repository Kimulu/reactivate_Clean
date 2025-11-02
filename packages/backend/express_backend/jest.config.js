const path = require("path");

module.exports = {
  rootDir: ".",
  testEnvironment: path.resolve("/app/node_modules/jest-environment-jsdom"),
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  moduleFileExtensions: ["js", "jsx", "json", "node", "ts", "tsx"],
  setupFilesAfterEnv: [path.resolve("/app/setupTests.js")],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "<rootDir>/__mocks__/styleMock.js",
  },
  testTimeout: 10000,
  modulePaths: ["<rootDir>/node_modules", "/app/node_modules"],
};
