const { exec } = require("child_process");
const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const cliProgress = require("cli-progress");
const stripAnsi = require("strip-ansi").default;
const chalk = require("chalk");

// Disable Jest colors and force neutral terminal output
process.env.FORCE_COLOR = "0";

// ---------- Helper to parse and format Jest JSON ----------
const parseJestOutput = async (jsonOutput, colorize = true) => {
  try {
    const data = JSON.parse(jsonOutput);
    let passedCount = 0;
    let failedCount = 0;
    const lines = [];

    const totalTests = data.numTotalTests || 0;

    // Fancy progress bar
    const progressBar = new cliProgress.SingleBar(
      {
        format: `${chalk.cyan("{bar}")} {percentage}% | {value}/{total} tests`,
        hideCursor: true,
        barCompleteChar: "█",
        barIncompleteChar: "░",
      },
      cliProgress.Presets.shades_classic
    );

    progressBar.start(totalTests, 0);

    // Print each test suite
    for (const testFile of data.testResults || []) {
      const fileName = path.basename(testFile.name || "Test");
      const hasFailures = testFile.assertionResults.some(
        (a) => a.status === "failed"
      );
      const headerLabel = hasFailures ? " FAIL " : " PASS ";
      const badge = hasFailures
        ? chalk.bgRed.white.bold(
            `╭──────────╮\n│  ${headerLabel}  │\n╰──────────╯`
          )
        : chalk.bgGreen.black.bold(
            `╭──────────╮\n│  ${headerLabel}  │\n╰──────────╯`
          );

      lines.push(
        colorize
          ? `${badge}  ${chalk.whiteBright(fileName)}`
          : `${hasFailures ? "FAIL" : "PASS"} ${fileName}`
      );

      // Sequential test rendering
      for (const [index, assertion] of testFile.assertionResults.entries()) {
        const passed = assertion.status === "passed";
        const icon = passed ? "✅" : "❌";
        const iconColor = passed ? chalk.greenBright : chalk.redBright;
        const titleColor = passed ? chalk.white : chalk.whiteBright;

        if (passed) passedCount++;
        else failedCount++;

        progressBar.update(passedCount + failedCount);
        await new Promise((r) => setTimeout(r, 60));

        lines.push(
          colorize
            ? `  ${iconColor(icon)} ${titleColor(assertion.fullName)}`
            : `  ${icon} ${assertion.fullName}`
        );

        // Failure snippet
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

      lines.push(""); // spacing between files
    }

    progressBar.stop();

    // Summary section — clean, emoji-enhanced
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
        : `Summary: ${passedCount} passed, ${failedCount} failed\n${summaryBar}\n`);

    return {
      passed: failedCount === 0,
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

// ---------- Main test runner ----------
exports.runTests = async (
  challengeId,
  userSolutionFiles,
  testFileContent,
  colorize = true
) => {
  const tempDir = path.join(__dirname, "..", "temp_challenge_runs", uuidv4());
  let testResults = {
    passed: false,
    output: "An unexpected error occurred.",
    detailedResults: [],
  };
  const backendRoot = path.resolve(__dirname, "..");

  try {
    await fs.mkdir(tempDir, { recursive: true });

    // Write user solution files
    for (const filePath in userSolutionFiles) {
      const fullPath = path.join(tempDir, filePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, userSolutionFiles[filePath]);
    }

    // Symlink node_modules
    const sourceNodeModules = path.join(backendRoot, "node_modules");
    const targetNodeModules = path.join(tempDir, "node_modules");
    try {
      await fs.symlink(sourceNodeModules, targetNodeModules, "junction");
    } catch (symlinkError) {
      console.warn("Symlink failed, skipping:", symlinkError.message);
    }

    // Copy config files
    const configFiles = ["babel.config.js", "jest.config.js", "setupTests.js"];
    for (const file of configFiles) {
      const src = path.join(backendRoot, file);
      const dest = path.join(tempDir, file);
      if (await fs.stat(src).catch(() => false)) {
        await fs.copyFile(src, dest);
      }
    }

    // Copy mocks if present
    const mocksDir = path.join(backendRoot, "__mocks__");
    const mockFile = path.join(mocksDir, "styleMock.js");
    if (await fs.stat(mockFile).catch(() => false)) {
      const targetMocks = path.join(tempDir, "__mocks__");
      await fs.mkdir(targetMocks, { recursive: true });
      await fs.copyFile(mockFile, path.join(targetMocks, "styleMock.js"));
    }

    // Write test file
    const testFileName = "solution.test.js";
    const testFilePath = path.join(tempDir, testFileName);
    const adjustedTestContent = testFileContent.replace(
      /from\s+(['"])\.\.\//g,
      (match, quote) => `from ${quote}./`
    );
    await fs.writeFile(testFilePath, adjustedTestContent);

    // Run Jest
    const jestConfig = path.join(tempDir, "jest.config.js");
    const jestCommand = [
      "npx jest",
      "--json",
      "--colors=false",
      "--silent",
      "--noStackTrace",
      "--verbose=false",
      `--outputFile=jest-results.json`,
      `--testPathPatterns="${testFileName}"`,
      `--config="${jestConfig}"`,
    ].join(" ");

    const { stdout, stderr } = await new Promise((resolve) => {
      exec(
        jestCommand,
        {
          cwd: tempDir,
          timeout: 15000,
          env: { ...process.env, FORCE_COLOR: "0" },
        },
        (error, stdout, stderr) => {
          resolve({ stdout, stderr });
        }
      );
    });

    // --- FIX 1: Delay and retry reading jest-results.json ---
    const jestResultsPath = path.join(tempDir, "jest-results.json");
    let rawJson = "";
    try {
      await new Promise((r) => setTimeout(r, 300)); // Wait a bit for Jest to finish writing
      rawJson = await fs.readFile(jestResultsPath, "utf8");
    } catch (e1) {
      console.warn("Jest results not ready, retrying...");
      await new Promise((r) => setTimeout(r, 300));
      try {
        rawJson = await fs.readFile(jestResultsPath, "utf8");
      } catch (e2) {
        console.error("Failed to read Jest results after retry:", e2.message);
      }
    }

    const cleanedStdout = stripAnsi(stdout || ""); // 🧹 remove ANSI junk
    const parsed = await parseJestOutput(rawJson || "{}", colorize);

    // Always clean parsed output too
    testResults.output = stripAnsi(parsed.output + "\n" + cleanedStdout.trim());
    testResults.passed = parsed.passed;
    testResults.detailedResults = parsed.detailedResults;
  } catch (error) {
    console.error("Error during custom test execution:", error);
    testResults = {
      passed: false,
      output: `Test runner internal error: ${error.message}`,
      detailedResults: [
        {
          title: "Internal test runner error",
          status: "failed",
          message: error.message,
        },
      ],
    };
  } finally {
    // --- FIX 2: Delay before cleanup to avoid EBUSY ---
    try {
      await new Promise((r) => setTimeout(r, 500));
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.warn("Cleanup failed (locked resource):", cleanupError.message);
    }
  }

  return testResults;
};
