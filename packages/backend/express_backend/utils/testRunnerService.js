// packages/backend/express_backend/utils/testRunnerService.js

// NEW: Import execSync to run commands directly
const { execSync } = require("child_process");
const fs = require("fs").promises;
const path = require("path");
const fsExtra = require("fs-extra");
const { v4: uuidv4 } = require("uuid");
const cliProgress = require("cli-progress");
const chalk = require("chalk");
const AnsiToHtml = require("ansi-to-html");

const converter = new AnsiToHtml({
  newline: true,
  escapeXML: true,
  fg: "#FFF",
  bg: "#1e1e1e",
});

// The parseJestOutput function is excellent and remains unchanged.
const parseJestOutput = async (jsonOutput, colorize = true) => {
  try {
    const data = JSON.parse(jsonOutput);
    let passedCount = 0;
    let failedCount = 0;
    const lines = [];
    const totalTests = data.numTotalTests || 0;

    const progressBar = new cliProgress.SingleBar(
      {
        format: `${chalk.cyan("{bar}")} {percentage}% | {value}/{total} tests`,
        hideCursor: true,
        barCompleteChar: "█",
        barIncompleteChar: "░",
      },
      cliProgress.Presets.shades_classic
    );

    if (totalTests > 0 && colorize && process.stdout.isTTY) {
      progressBar.start(totalTests, 0);
    }

    for (const testFile of data.testResults || []) {
      const fileName = path.basename(testFile.name || "Test File");
      const hasFailures = testFile.assertionResults.some(
        (a) => a.status === "failed"
      );
      const headerLabel = hasFailures ? " FAIL " : " PASS ";
      const badge = hasFailures
        ? chalk.bgRed.white.bold(` FAIL `)
        : chalk.bgGreen.black.bold(` PASS `);

      lines.push(
        colorize
          ? `${badge}  ${chalk.whiteBright(fileName)}`
          : `${hasFailures ? "FAIL" : "PASS"} ${fileName}`
      );

      for (const assertion of testFile.assertionResults) {
        const passed = assertion.status === "passed";
        const icon = passed ? "✅" : "❌";
        const iconColor = passed ? chalk.greenBright : chalk.redBright;
        const titleColor = passed ? chalk.white : chalk.whiteBright;

        if (passed) passedCount++;
        else failedCount++;

        if (totalTests > 0 && colorize && process.stdout.isTTY) {
          progressBar.update(passedCount + failedCount);
          await new Promise((r) => setTimeout(r, 60));
        }

        lines.push(
          colorize
            ? `  ${iconColor(icon)} ${titleColor(assertion.fullName)}`
            : `  ${icon} ${assertion.fullName}`
        );

        if (!passed && assertion.failureMessages?.length > 0) {
          const message = assertion.failureMessages
            .join("\n")
            .replace(/\n\s*at\s.*$/gm, "")
            .trim()
            .split("\n")
            .slice(0, 3)
            .join("\n");
          lines.push(chalk.gray(`      ${message.replace(/^/gm, "      ")}`));
        }
      }
      lines.push("");
    }

    if (totalTests > 0 && colorize && process.stdout.isTTY) {
      progressBar.stop();
    }

    const total = passedCount + failedCount;
    const greenBar = chalk.green("▰".repeat(passedCount));
    const redBar = chalk.red("▱".repeat(failedCount));
    const summaryBar = `${greenBar}${redBar}  ${chalk.bold(
      `${passedCount}/${total} passed`
    )}`;

    const summary =
      "\n" +
      (colorize
        ? `${chalk.bold.yellow("📊 Summary:")} ${chalk.greenBright(
            `${passedCount} passed`
          )}, ${chalk.redBright(`${failedCount} failed`)}\n${summaryBar}\n`
        : `Summary: ${passedCount} passed, ${failedCount} failed\n`);

    return {
      passed: failedCount === 0 && totalTests > 0 && data.success === true,
      output: lines.join("\n") + summary,
      detailedResults: [],
    };
  } catch (err) {
    return {
      passed: false,
      output: `❌ Failed to parse Jest output: ${err.message}\nRaw output: ${jsonOutput}`,
      detailedResults: [],
    };
  }
};

// ===================================================================
// === THIS IS THE REWRITTEN FUNCTION FOR THE RENDER DEPLOYMENT ===
// ===================================================================
exports.runTests = async (
  challengeId,
  userSolutionFiles,
  testFileContent,
  colorize = true
) => {
  // Create a unique temporary directory for this test run
  const tempDir = path.join(__dirname, "..", "temp_challenge_runs", uuidv4());
  let result = {
    passed: false,
    output: "Unexpected error during test execution.",
    detailedResults: [],
  };
  let jsonOutput = "";

  try {
    // 1. Set up the temporary directory with user files and test files
    await fs.mkdir(tempDir, { recursive: true });

    for (const filePath in userSolutionFiles) {
      const fullPath = path.join(tempDir, filePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, userSolutionFiles[filePath]);
    }

    const adjustedTestContent = testFileContent
      .replace(/from\s+(['"])\.\.\//g, (match, quote) => `from ${quote}./`)
      .replace(/require\(['"]\.\.\//g, "require('./")
      .replace(/(\.\.\/)+/g, "./");

    const testPath = path.join(tempDir, "solution.test.js");
    await fs.writeFile(testPath, adjustedTestContent);

    // 2. Define the path for Jest's JSON results
    const resultsPath = path.join(tempDir, "jest-results.json");

    // 3. Execute Jest directly using a child process. NO MORE DOCKER!
    try {
      // We run jest from within the temp directory (using `cwd`)
      // This makes all the file imports like `require('./component.js')` work correctly.
      execSync(
        `npx jest solution.test.js --json --outputFile=${resultsPath} --runInBand`,
        { cwd: tempDir, stdio: "pipe" }
      );
    } catch (error) {
      // execSync throws an error if the command returns a non-zero exit code.
      // For Jest, this happens when tests fail, which is normal.
      // We can safely ignore the error here because we will read the results
      // from the JSON file regardless of whether the tests passed or failed.
      console.log("Jest finished with failed tests, which is expected.");
    }

    // 4. Read the results file that Jest created
    jsonOutput = await fs.readFile(resultsPath, "utf8");

    // 5. Parse the JSON output and convert to HTML
    const parsed = await parseJestOutput(jsonOutput, colorize);
    result = {
      passed: parsed.passed,
      output: converter.toHtml(parsed.output),
      detailedResults: parsed.detailedResults,
    };
  } catch (error) {
    console.error("💥 Error during test execution:", error);
    result = {
      passed: false,
      output: converter.toHtml(
        `Test runner internal error: ${
          error.message
        }\n\nSTDOUT:\n${error.stdout?.toString()}\n\nSTDERR:\n${error.stderr?.toString()}`
      ),
      detailedResults: [],
    };
  } finally {
    // 6. Clean up the temporary directory
    try {
      await fsExtra.remove(tempDir);
    } catch (cleanupError) {
      console.warn("⚠️ Cleanup failed:", cleanupError.message);
    }
  }

  return result;
};
