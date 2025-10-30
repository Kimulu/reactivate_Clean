// packages/backend/express_backend/utils/run-jest-in-container.js
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

(async () => {
  try {
    const cwd = process.cwd();
    console.log("🧪 Running Jest inside container...");
    console.log("📂 Current directory:", cwd);

    // Show files for debugging
    const files = fs.readdirSync(cwd);
    console.log("📄 Files in challenge folder:", files);

    // Run Jest programmatically
    const jestConfig = path.resolve("/usr/src/app/jest.config.js");
    console.log("⚙️ Using Jest config:", jestConfig);

    // Execute Jest
    execSync(`npx jest --config ${jestConfig} --runInBand --colors`, {
      stdio: "inherit",
      cwd,
    });

    console.log("\n✅ Tests completed successfully!");
  } catch (err) {
    console.error("\n❌ Jest test run failed:");
    console.error(err.message);
    process.exit(1);
  }
})();
