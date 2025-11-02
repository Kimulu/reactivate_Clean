// packages/backend/express_backend/utils/testRunnerService.js

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

// ===================================================================
// === parseJestOutput (unchanged, robust parser) ====================
// ===================================================================
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
// === Final Render-Safe Test Runner Function ========================
// ===================================================================
exports.runTests = async (
  challengeId,
  userSolutionFiles,
  testFileContent,
  colorize = true
) => {
  // Use /tmp for safer ephemeral writes on Render
  const tempDir = path.join("/tmp", "temp_challenge_runs", uuidv4());
  let result = {
    passed: false,
    output: "Unexpected error during test execution.",
    detailedResults: [],
  };
  let jsonOutput = "";

  try {
    // 1️⃣ Setup temporary directory
    await fs.mkdir(tempDir, { recursive: true });

    // 2️⃣ Write all user files to tempDir
    for (const filePath in userSolutionFiles) {
      const fullPath = path.join(tempDir, filePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, userSolutionFiles[filePath]);
    }

    // 3️⃣ Write the test file (with adjusted imports)
    const adjustedTestContent = testFileContent
      .replace(/from\s+(['"])\.\.\//g, (match, quote) => `from ${quote}./`)
      .replace(/require\((['"])\.\.\//g, "require($1./")
      .replace(/(\.\.\/)+/g, "./");
    const testPath = path.join(tempDir, "solution.test.js");
    await fs.writeFile(testPath, adjustedTestContent);

    // 4️⃣ Copy Jest config + mocks into tempDir
    const configFilesToCopy = [
      "babel.config.js",
      "jest.config.js",
      "setupTests.js",
    ];
    for (const file of configFilesToCopy) {
      const srcPath = path.join("/app", file);
      const destPath = path.join(tempDir, file);
      try {
        await fs.copyFile(srcPath, destPath);
      } catch (e) {
        console.warn(`⚠️ Could not copy ${file}: ${e.message}`);
      }
    }

    const mocksSrc = path.join("/app", "__mocks__");
    const mocksDest = path.join(tempDir, "__mocks__");
    try {
      await fsExtra.copy(mocksSrc, mocksDest);
    } catch (e) {
      console.warn(`⚠️ Could not copy mocks directory: ${e.message}`);
    }

    // 5️⃣ Run Jest inside the tempDir
    const resultsPath = path.join(tempDir, "jest-results.json");
    const jestConfigPath = path.join(tempDir, "jest.config.js");

    try {
      execSync(
        `npx jest --config ${jestConfigPath} --json --outputFile=${resultsPath} --runInBand`,
        {
          cwd: tempDir,
          stdio: "pipe",
          env: { ...process.env, FORCE_COLOR: "0" },
        }
      );
    } catch (error) {
      console.log("Jest finished (some tests may have failed).");
    }

    // 6️⃣ Wait for Jest results file to appear (Render-safe)
    let retries = 0;
    const maxRetries = 10;
    const delay = 300; // ms between retries

    while (retries < maxRetries) {
      try {
        await fs.access(resultsPath);
        break;
      } catch {
        await new Promise((r) => setTimeout(r, delay));
        retries++;
      }
    }

    if (retries === maxRetries) {
      throw new Error("jest-results.json not found after waiting.");
    }

    // 7️⃣ Parse results
    jsonOutput = await fs.readFile(resultsPath, "utf8");
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
    // 8️⃣ Cleanup (delayed to avoid file race)
    try {
      await new Promise((r) => setTimeout(r, 300));
      await fsExtra.remove(tempDir);
    } catch (cleanupError) {
      console.warn("⚠️ Cleanup failed:", cleanupError.message);
    }
  }

  return result;
};
