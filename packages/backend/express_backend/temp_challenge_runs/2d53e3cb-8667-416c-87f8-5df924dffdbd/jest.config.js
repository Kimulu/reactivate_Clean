// packages/backend/express_backend/jest.config.js
module.exports = {
  // Set rootDir to the current working directory (the temp directory)
  rootDir: ".",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  moduleFileExtensions: ["js", "jsx", "json", "node", "ts", "tsx"],
  setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "<rootDir>/__mocks__/styleMock.js",
  },
  testTimeout: 10000,
  // 💡 NEW: Explicitly tell Jest where to find node_modules
  modulePaths: ["<rootDir>/node_modules"],
};
