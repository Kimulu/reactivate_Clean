// packages/backend/express_backend/controllers/runnerController.js
const testRunner = require("../utils/testRunnerService");

exports.executeTestsController = async (req, res) => {
  try {
    // The data (files, test content etc.) will be in the request body
    const { challengeId, userSolutionFiles, testFileContent } = req.body;

    if (!userSolutionFiles || !testFileContent) {
      return res.status(400).json({ error: "Missing required test data." });
    }

    // We call the test runner service, which will now run Jest internally
    const result = await testRunner.runTests(
      challengeId,
      userSolutionFiles,
      testFileContent
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in test execution controller:", error);
    res
      .status(500)
      .json({ error: "Failed to run tests.", message: error.message });
  }
};
