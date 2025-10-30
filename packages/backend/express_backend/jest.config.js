// packages/backend/express_backend/jest.config.js
const path = require("path");

module.exports = {
  rootDir: ".",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  moduleFileExtensions: ["js", "jsx", "json", "node", "ts", "tsx"],

  // ✅ Use absolute path for setup file
  setupFilesAfterEnv: [path.resolve("/usr/src/app/setupTests.js")],

  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "<rootDir>/__mocks__/styleMock.js",
  },
  testTimeout: 10000,
  modulePaths: ["<rootDir>/node_modules"],
};
