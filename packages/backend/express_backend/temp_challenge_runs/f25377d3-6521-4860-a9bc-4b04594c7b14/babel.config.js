module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }], // Transpile for the current Node.js version
    ["@babel/preset-react", { runtime: "automatic" }], // Enable JSX transformation (React)
  ],
  // You might need plugins for specific syntax, but presets often cover common cases.
  // plugins: [
  //   '@babel/plugin-proposal-class-properties', // Example
  // ],
};
