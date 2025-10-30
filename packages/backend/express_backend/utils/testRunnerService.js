const { spawn } = require("child_process");
const fs = require("fs").promises;
const path = require("path");
const fsExtra = require("fs-extra");
const { v4: uuidv4 } = require("uuid");
const cliProgress = require("cli-progress");
const chalk = require("chalk");
// 1. Import the new library
const AnsiToHtml = require("ansi-to-html");

// 2. Create a new converter instance with some sensible defaults
const converter = new AnsiToHtml({
  newline: true, // Use <br/> for newlines
  escapeXML: true, // Escape XML characters
  fg: "#FFF", // Default foreground color
  bg: "#1e1e1e", // Default background color (matches terminal styling)
});

// The parseJestOutput function generates the rich ANSI text string. It is correct as is.
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

    // Note: The progress bar will only appear in the server's console, not the final HTML.
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
        ? chalk.bgRed.white.bold(` FAIL `) // Simple text with spaces for padding
        : chalk.bgGreen.black.bold(` PASS `); // Simple text with spaces for padding

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

// Docker-based Secure Jest Runner
exports.runTests = async (
  challengeId,
  userSolutionFiles,
  testFileContent,
  colorize = true
) => {
  const tempDir = path.join(__dirname, "..", "temp_challenge_runs", uuidv4());
  let result = {
    passed: false,
    output: "Unexpected error.",
    detailedResults: [],
  };

  try {
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

    const dockerResult = await new Promise((resolve, reject) => {
      const isWindows = process.platform === "win32";
      const currentUser = isWindows
        ? {}
        : { user: `${process.getuid()}:${process.getgid()}` };
      const args = [
        "run",
        "--rm",
        ...(isWindows ? [] : ["--user", currentUser.user]),
        "--memory=512m",
        "--cpus=1",
        "--network=none",
        "-v",
        `${tempDir}:/usr/src/app/challenge`,
        "reactivate-jest-runner",
      ];
      const dockerProcess = spawn("docker", args, { shell: true });
      let stdout = "";
      let stderr = "";
      dockerProcess.stdout.on("data", (d) => (stdout += d.toString()));
      dockerProcess.stderr.on("data", (d) => (stderr += d.toString()));
      dockerProcess.on("error", reject);
      dockerProcess.on("close", async (code) => {
        try {
          const resultsPath = path.join(tempDir, "jest-results.json");
          const jsonOutput = await fs.readFile(resultsPath, "utf8");
          resolve({ stdout: jsonOutput, stderr });
        } catch (err) {
          resolve({ stdout, stderr: stderr || err.message });
        }
      });
    });

    // Generate the rich, colorized ANSI output string.
    const parsed = await parseJestOutput(dockerResult.stdout, colorize);

    // 3. THE FINAL STEP: Convert the ANSI string to HTML and prepare the result.
    result = {
      passed: parsed.passed,
      // The output is now the HTML version of the ANSI string.
      output: converter.toHtml(parsed.output),
      detailedResults: parsed.detailedResults,
    };
  } catch (error) {
    console.error("💥 Error during Docker test execution:", error);
    result = {
      passed: false,
      output: `Test runner internal error: ${error.message}`,
      detailedResults: [
        { title: "Runner Error", status: "failed", message: error.message },
      ],
    };
  } finally {
    try {
      await fsExtra.remove(tempDir);
    } catch (cleanupError) {
      console.warn("⚠️ Cleanup failed:", cleanupError.message);
    }
  }

  return result;
};
