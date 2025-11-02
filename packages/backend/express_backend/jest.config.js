const path = require("path");

module.exports = {
  // Keep root simple; test runner will pass the config file path as absolute.
  rootDir: ".",

  // Point to the installed jsdom inside the container image (/app/node_modules)
  // This allows tests running from /tmp to resolve the environment correctly.
  testEnvironment: path.resolve("/app/node_modules/jest-environment-jsdom"),

  // Use babel-jest to transform JS/JSX/TS/TSX
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },

  moduleFileExtensions: ["js", "jsx", "json", "node", "ts", "tsx"],

  // Use absolute path for setup file (so it resolves from /tmp too)
  setupFilesAfterEnv: [path.resolve("/app/setupTests.js")],

  // Map CSS imports to the local mock (this file is copied into temp dir)
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "<rootDir>/__mocks__/styleMock.js",
  },

  // Speed-focused settings
  testTimeout: 10000,
  // Make Jest resolve modules in the main image node_modules first.
  modulePaths: ["<rootDir>/node_modules", "/app/node_modules"],

  // Use a cache directory on /tmp — fast and persistent for the container lifecycle
  cacheDirectory: "/tmp/jest_cache",

  // Limit workers to a small number while still being parallel — adjust if you have more CPU
  maxWorkers: "50%",

  // Ignore running tests in heavy folders (safety)
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/build/"],

  // Slightly speed up watchman usage disable in containers
  watchman: false,
};
