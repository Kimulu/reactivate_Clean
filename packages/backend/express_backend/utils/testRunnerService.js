const { execSync } = require("child_process");
const fs = require("fs").promises; // async fs for most ops
const fsSync = require("fs"); // sync fs for symlink convenience
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

/**
 * parseJestOutput
 * Robust parser for jest JSON results -> ANSI string summary
 */
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

/**
 * runTests
 * - Creates a per-run temp directory under /tmp
 * - Symlinks /app/node_modules into the tempDir for zero-install speed
 * - Copies minimal config files + mocks
 * - Executes jest with an absolute config path
 * - Waits for jest-results.json to appear (with retries)
 * - Parses results and returns structured result (HTML output)
 *
 * Optimized for speed in containerized environments (Render/Docker).
 */
exports.runTests = async (
  challengeId,
  userSolutionFiles,
  testFileContent,
  colorize = true
) => {
  // Per-run directory (unique)
  const tempRunId = uuidv4();
  const tempDir = path.join("/tmp", "temp_challenge_runs", tempRunId);

  // Shared cache locations
  const jestCacheDir = "/tmp/jest_cache"; // persistent for container lifecycle
  const nodeModulesSrc = "/app/node_modules"; // preinstalled in image

  let result = {
    passed: false,
    output: "Unexpected error during test execution.",
    detailedResults: [],
  };

  try {
    // Ensure shared cache dir exists (fast subsequent runs)
    try {
      await fs.mkdir(jestCacheDir, { recursive: true });
    } catch (e) {
      // non-fatal
      console.warn("Could not ensure jest cache dir:", e.message);
    }

    // 1) create per-run directory
    await fs.mkdir(tempDir, { recursive: true });

    // 2) Write all user-submitted solution files to the temp directory
    for (const filePath in userSolutionFiles) {
      const fullPath = path.join(tempDir, filePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, userSolutionFiles[filePath]);
    }

    // 3) Write the test file (with adjusted imports)
    const adjustedTestContent = testFileContent
      .replace(/from\s+(['"])\.\.\//g, (match, quote) => `from ${quote}./`)
      .replace(/require\((['"])\.\.\//g, "require($1./")
      .replace(/(\.\.\/)+/g, "./");
    const testPath = path.join(tempDir, "solution.test.js");
    await fs.writeFile(testPath, adjustedTestContent);

    // 4) Copy minimal config files into tempDir (babel/jest/setupTests)
    // Use absolute /app paths as source - these exist in the image
    const configFilesToCopy = [
      "babel.config.js",
      "jest.config.js",
      "setupTests.js",
    ];
    for (const file of configFilesToCopy) {
      const srcPath = path.join("/app", file);
      const destPath = path.join(tempDir, file);
      try {
        // Only copy when the source exists
        if (fsSync.existsSync(srcPath)) {
          await fs.copyFile(srcPath, destPath);
        } else {
          console.warn(`Config file missing in image: ${srcPath}`);
        }
      } catch (e) {
        console.warn(`Could not copy config file ${file}: ${e.message}`);
      }
    }

    // Copy __mocks__ if present
    const mocksSrc = path.join("/app", "__mocks__");
    const mocksDest = path.join(tempDir, "__mocks__");
    try {
      if (fsSync.existsSync(mocksSrc)) {
        await fsExtra.copy(mocksSrc, mocksDest);
      }
    } catch (e) {
      console.warn(`Could not copy mocks directory: ${e.message}`);
    }

    // 5) SYMLINK /app/node_modules into the temp run to avoid installs.
    // This is the core speed optimization: zero installs, instant module resolution.
    const nodeModulesDest = path.join(tempDir, "node_modules");
    try {
      if (
        !fsSync.existsSync(nodeModulesDest) &&
        fsSync.existsSync(nodeModulesSrc)
      ) {
        // Use junction on Windows compatibility if needed; sync is OK here
        try {
          fsSync.symlinkSync(nodeModulesSrc, nodeModulesDest, "dir");
        } catch (symlinkErr) {
          // On some restricted environments symlink may fail; fall back to copying small deps if necessary
          console.warn(
            "Symlink failed, attempting fs-extra copy as fallback:",
            symlinkErr.message
          );
          await fsExtra.copy(nodeModulesSrc, nodeModulesDest, {
            dereference: true,
          });
        }
        console.log("✅ Linked /app/node_modules into temp run");
      } else {
        if (!fsSync.existsSync(nodeModulesSrc)) {
          console.warn(
            "⚠️ /app/node_modules not present in image; tests may attempt to install at runtime."
          );
        }
      }
    } catch (err) {
      console.warn(
        "⚠️ node_modules linking step encountered an error:",
        err.message
      );
    }

    // 6) Prepare the jest command and run
    const resultsPath = path.join(tempDir, "jest-results.json");
    const jestConfigPath = path.join(tempDir, "jest.config.js"); // absolute for reliability

    // Ensure any leftover results file is removed
    try {
      if (fsSync.existsSync(resultsPath)) fsSync.unlinkSync(resultsPath);
    } catch (_) {}

    try {
      // Helpful runtime info in logs (keeps logs informative but not too noisy)
      console.log("📁 Running Jest inside:", tempDir);
      console.log("📄 Jest config path:", jestConfigPath);
      console.log("🧪 Files in tempDir before run:", await fs.readdir(tempDir));

      // Build the command with explicit cacheDirectory for speed
      // Use absolute config path to avoid ambiguity
      const jestCommand = [
        "npx",
        "jest",
        `--config=${jestConfigPath}`,
        `--json`,
        `--outputFile=${resultsPath}`,
        `--runInBand`,
        `--cache`,
        `--cacheDirectory=${jestCacheDir}`,
      ].join(" ");

      // Run synchronously and capture output (pipe is slightly faster than inherit for our use)
      // Use a reasonably small timeout so runaway processes don't hang the server forever (optional)
      execSync(jestCommand, {
        cwd: tempDir,
        stdio: "pipe",
        env: {
          ...process.env,
          FORCE_COLOR: "0",
          NODE_ENV: process.env.NODE_ENV || "test",
        },
        // timeout: 60 * 1000 // optional: set if you want a hard kill after X ms
      });
    } catch (error) {
      // Log the complete error object (message + stdout/stderr if available)
      console.error("❗ Jest run error:", error.message || error);
      if (error.stdout) {
        try {
          console.error("Jest stdout:", error.stdout.toString());
        } catch (_) {}
      }
      if (error.stderr) {
        try {
          console.error("Jest stderr:", error.stderr.toString());
        } catch (_) {}
      }
      // Continue to wait for results file — in many cases jest writes results even when exit code != 0
    }

    // Quick listing after run for diagnostics
    try {
      console.log("📂 Files in tempDir after Jest:", await fs.readdir(tempDir));
    } catch (_) {}

    // 7) Wait for jest-results.json to appear (fast retry loop)
    let retries = 0;
    const maxRetries = 30; // increase to be robust but still bounded
    const delay = 150; // ms between retries (short for speed)

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

    // 8) Read & parse results (this is the main output)
    const jsonOutput = await fs.readFile(resultsPath, "utf8");
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
    // 9) Cleanup: remove the run directory asynchronously but don't block response
    // We purposely do not block on cleanup to keep response latency fast.
    (async () => {
      try {
        // Give a tiny grace period for file flush
        await new Promise((r) => setTimeout(r, 250));
        // Remove only the specific run folder
        await fsExtra.remove(tempDir);
      } catch (cleanupError) {
        console.warn("⚠️ Cleanup failed:", cleanupError.message);
      }
    })();
  }

  return result;
};
