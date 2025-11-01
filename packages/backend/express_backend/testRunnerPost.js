// testRunnerPost.js
const axios = require("axios"); // Use require since your backend is CommonJS

const testPayload = {
  userSolutionFiles: {
    "/App.js": "export default function App() { return <h1>Hello Test</h1>; }",
  },
  testFileContent: "test('should pass', () => { expect(1).toBe(1); });",
};

async function runLocalTest() {
  console.log("🚀 Sending POST request to the MAIN BACKEND's test endpoint...");
  try {
    // THIS IS THE CORRECT URL for your main backend
    const response = await axios.post(
      "http://localhost:5000/api/challenges/some-local-test-id/run-tests",
      testPayload
    );

    console.log("✅ SUCCESS! The main backend's route is working.");
    console.log("📝 It received a response from the runner service:");
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("❌ FAILED! An error occurred.");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

runLocalTest();
