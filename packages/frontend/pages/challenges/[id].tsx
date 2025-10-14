import { useRouter } from "next/router";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  useSandpack, // We still need useSandpack to get the current files from the editor
} from "@codesandbox/sandpack-react";
import CustomAceEditor from "@/components/CustomAceEditor"; // Your existing Ace Editor
import FileTabs from "@/components/FileTabs"; // Your existing FileTabs
import { useEffect, useState, useMemo, useCallback } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
// 💡 MODIFIED: Import apiClient and Challenge, and the new TestResult/CustomTestRunResponse interfaces
import {
  apiClient,
  Challenge,
  TestResult,
  CustomTestRunResponse,
} from "@/utils/apiClient";
import { useDispatch } from "react-redux";
import { updateUserTotalPoints } from "@/store/userSlice";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

// --- START CustomTestDisplay Component ---
// This is your custom display for test results, replacing SandpackTests
function CustomTestDisplay({
  testResults,
  testOutput,
  loading,
}: {
  testResults: TestResult[];
  testOutput: string;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0f172a] text-gray-400">
        <Loader2 className="animate-spin mr-2 text-[#06ffa5]" size={20} />{" "}
        Running tests...
      </div>
    );
  }

  if (!testResults.length && !testOutput) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0f172a] text-gray-400">
        Run tests to see results.
      </div>
    );
  }

  return (
    <div className="p-4 bg-[#0f172a] text-gray-200 font-mono text-sm overflow-auto h-full">
      {testOutput && (
        <pre className="whitespace-pre-wrap mb-4 bg-gray-900 p-2 rounded">
          {testOutput}
        </pre>
      )}
      {testResults.length > 0 && (
        <div className="space-y-2">
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`flex flex-col gap-1 p-2 rounded ${
                result.status === "passed"
                  ? "bg-green-900/30 text-green-300"
                  : result.status === "failed"
                  ? "bg-red-900/30 text-red-300"
                  : "bg-gray-800/30 text-gray-400"
              }`}
            >
              <div className="flex items-center gap-2">
                {result.status === "passed" && (
                  <CheckCircle className="text-green-400" size={16} />
                )}
                {result.status === "failed" && (
                  <XCircle className="text-red-400" size={16} />
                )}
                {result.status === "skipped" && (
                  <Loader2 className="text-gray-400" size={16} />
                )}
                <span className="font-semibold">{result.title}</span>
              </div>
              {result.message && result.status === "failed" && (
                <pre className="text-red-300 text-xs mt-1 bg-red-900/20 p-1 rounded whitespace-pre-wrap break-all">
                  {result.message}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// --- END CustomTestDisplay Component ---

type SubmissionPhase =
  | "idle"
  | "confirming_tests"
  | "tests_passed"
  | "tests_failed"
  | "submitting_code"
  | "submission_success"
  | "submission_failed";

interface TestRunnerProps {
  challenge: Challenge;
}

function TestRunner({ challenge }: { challenge: any }) {
  const { dispatch: sandpackDispatch, listen, sandpack } = useSandpack();
  const router = useRouter();
  const { id: challengeId } = router.query;
  const dispatch = useDispatch();

  const [isRunning, setIsRunning] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [testsPassed, setTestsPassed] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [testOutput, setTestOutput] = useState("");
  const [dirty, setDirty] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submissionPhase, setSubmissionPhase] =
    useState<SubmissionPhase>("idle");

  // Detect code edits
  useEffect(() => {
    const unsubscribe = listen((msg) => {
      if (msg.type === "fs/change") {
        setDirty(true);
        setTestsPassed(false);
      }
    });
    return () => unsubscribe();
  }, [sandpack]);

  // --- Run custom backend tests instead of Sandpack tests ---
  const runCustomTests = useCallback(async (): Promise<boolean> => {
    setIsRunning(true);
    setHasRun(true);
    setIsOpen(true);

    try {
      const userSolutionFiles: Record<string, string> = {};
      for (const filePath in sandpack.files) {
        const file = sandpack.files[filePath];
        if (
          file &&
          typeof (file as any).code === "string" &&
          !(file as any).hidden &&
          !(file as any).readOnly
        ) {
          userSolutionFiles[filePath] = (file as any).code;
        }
      }

      const response = await apiClient.runUserTests(
        challengeId as string,
        userSolutionFiles
      );

      console.log("🧪 Backend Test Response:", response);

      const passed = response.passed === true;

      // ✅ Store backend output so frontend shows custom output
      setTestOutput(response.output || "No output received from backend.");

      if (passed) {
        setTestsPassed(true);
        setDirty(false);
        console.log(`✅ User has passed challenge: ${challengeId}`);
      } else {
        setTestsPassed(false);
      }

      toast[passed ? "success" : "error"](
        passed ? "✅ All tests passed!" : "❌ Some tests failed."
      );

      return passed;
    } catch (error: any) {
      console.error("❌ Error running tests:", error);
      toast.error("Error running tests");
      setTestsPassed(false);
      setTestOutput("⚠️ Error running tests: " + error.message);
      return false;
    } finally {
      setIsRunning(false);
    }
  }, [sandpack.files, challengeId]);

  // --- Submission flow ---
  const handleRunTests = () => runCustomTests();

  const handleRunTestsForSubmission = async () => {
    setSubmissionPhase("confirming_tests");
    const passed = await runCustomTests();

    if (passed) {
      setSubmissionPhase("tests_passed");
      setTimeout(async () => {
        try {
          setSubmissionPhase("submitting_code");

          const editedFilesContent: Record<string, string> = {};
          for (const filePath in sandpack.files) {
            const file = sandpack.files[filePath];
            if (file && typeof (file as any).code === "string") {
              editedFilesContent[filePath] = (file as any).code;
            }
          }

          const submissionResponse = await apiClient.submitChallenge(
            challengeId as string,
            editedFilesContent
          );

          dispatch(updateUserTotalPoints(submissionResponse.userPoints));
          console.log(
            "✅ Challenge submitted. User points:",
            submissionResponse.userPoints
          );

          setSubmissionPhase("submission_success");
          toast.success("Challenge submitted successfully!");

          setTimeout(() => {
            setIsSubmitModalOpen(false);
            router.push("/challenges");
          }, 1500);
        } catch (error: any) {
          console.error("Submission error:", error);
          setSubmissionPhase("submission_failed");
          toast.error("Failed to submit challenge.");
        }
      }, 800);
    } else {
      setSubmissionPhase("tests_failed");
      toast.error("Tests failed. Please fix your code before submitting.");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* --- Header --- */}
      <div className="flex items-center justify-between border-b border-gray-700 px-3 py-1 text-sm bg-gray-800">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">Tests</span>

          {/* --- Run Tests --- */}
          <button
            onClick={handleRunTests}
            className={`px-2 py-1 rounded-md text-white transition-colors duration-200 ${
              isRunning
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={isRunning}
          >
            {isRunning ? "Running..." : "Run Tests"}
          </button>

          {/* --- Attempt / Submit --- */}
          {hasRun && (
            <button
              onClick={() => {
                if (testsPassed && !dirty) {
                  setIsSubmitModalOpen(true);
                  setSubmissionPhase("idle");
                } else {
                  toast.error("⚠️ Please fix your code and rerun tests");
                }
              }}
              className={`px-2 py-1 rounded-md text-white border shadow-md transition-colors duration-200 ${
                testsPassed && !dirty
                  ? "bg-green-600 hover:bg-green-700 border-green-400"
                  : "bg-yellow-600 hover:bg-yellow-700 border-yellow-400"
              }`}
              disabled={isRunning}
            >
              {testsPassed && !dirty ? "Submit" : "Attempt"}
            </button>
          )}
        </div>

        {hasRun && (
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="px-2 py-1 rounded-md text-gray-300 hover:text-white"
          >
            {isOpen ? "▼ Hide Output" : "▲ Show Output"}
          </button>
        )}
      </div>

      {/* --- Test Output Placeholder --- */}
      {isOpen && (
        <div className="bg-black text-gray-200 text-sm p-3 rounded-md overflow-x-auto border border-gray-700 h-64 font-mono whitespace-pre-wrap flex items-center justify-center">
          {isRunning ? (
            // Show spinner while tests are running
            <div className="flex items-center space-x-2 text-gray-400">
              <Loader2 className="animate-spin text-[#06ffa5]" size={20} />
              <span>Running tests...</span>
            </div>
          ) : testOutput ? (
            // ✅ When backend test results arrive
            <pre className="text-left w-full">{testOutput}</pre>
          ) : hasRun ? (
            // When tests finished but output is empty (rare case)
            <p>
              {testsPassed
                ? "✅ All tests passed successfully."
                : "❌ Some tests failed. Check your logic."}
            </p>
          ) : (
            // Before user ever runs tests
            <p>Run tests to see output...</p>
          )}
        </div>
      )}

      {/* --- Submission Modal --- */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[#1a1a2e] p-8 rounded-lg shadow-2xl text-white max-w-sm w-full border border-[#06ffa5]/20">
            <h2 className="text-xl font-bold mb-6 text-center text-[#06ffa5]">
              {submissionPhase === "submission_success"
                ? "Submission Complete 🎉"
                : "Confirm Submission"}
            </h2>

            {submissionPhase === "idle" && (
              <>
                <p className="text-gray-300 mb-6 text-center">
                  Are you sure you want to submit your code? Tests will be
                  re-run to confirm your solution.
                </p>
                <div className="flex justify-around space-x-4">
                  <button
                    onClick={handleRunTestsForSubmission}
                    className="flex-1 py-2 px-4 rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
                    disabled={isRunning}
                  >
                    Run Tests & Submit
                  </button>
                  <button
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="flex-1 py-2 px-4 rounded-md bg-gray-600 hover:bg-gray-700 text-white transition-colors duration-200"
                    disabled={isRunning}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {submissionPhase === "confirming_tests" && (
              <div className="flex items-center justify-center space-x-3">
                <Loader2 className="animate-spin text-[#06ffa5]" size={22} />
                <span>Running final tests...</span>
              </div>
            )}

            {submissionPhase === "submission_success" && (
              <div className="text-center">
                <CheckCircle className="text-[#06ffa5] w-16 h-16 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-100">
                  Challenge Submitted Successfully!
                </p>
              </div>
            )}

            {submissionPhase === "submission_failed" && (
              <div className="text-center">
                <XCircle className="text-red-500 w-16 h-16 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-100">
                  Submission Failed!
                </p>
                <button
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="mt-6 py-2 px-6 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// 💡 The new, simplified ChallengeDetail component
export default function ChallengeDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIndividualChallenge = async () => {
      if (!id || typeof id !== "string") {
        setLoading(false);
        setError("Invalid challenge ID.");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fetchedChallenge: Challenge = await apiClient.getChallengeById(
          id
        );
        setChallenge(fetchedChallenge);
      } catch (err: any) {
        console.error("Error fetching challenge details:", err);
        setError(err.message || "Failed to load challenge details.");
        toast.error(err.message || "Failed to load challenge.");
      } finally {
        setLoading(false);
      }
    };

    fetchIndividualChallenge();
  }, [id]);

  // Memoize `files` for SandpackProvider for performance and stability
  const sandpackFiles = useMemo(() => {
    const files: Record<
      string,
      { code: string; hidden?: boolean; active?: boolean; readOnly?: boolean }
    > = {};
    if (challenge && challenge.files) {
      for (const filePath in challenge.files) {
        if (Object.prototype.hasOwnProperty.call(challenge.files, filePath)) {
          const fileData = challenge.files[filePath];
          if (fileData && typeof fileData.code === "string") {
            files[filePath] = {
              code: fileData.code,
              hidden: fileData.hidden ?? false,
              active: fileData.active ?? false,
              readOnly: fileData.readOnly ?? false, // Ensure readOnly is passed
            };
          } else {
            console.warn(
              `Sanitization: Skipping invalid file data for path: ${filePath}`
            );
          }
        }
      }
    }
    return files;
  }, [challenge]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0f172a] text-white">
        <Loader2 className="animate-spin text-[#06ffa5] w-8 h-8 mr-2" /> Loading
        Challenge...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0f172a] text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!challenge || Object.keys(sandpackFiles).length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0f172a] text-red-500">
        Challenge not found or invalid/empty challenge data.
      </div>
    );
  }

  // Determine the active file for Sandpack
  const activeFile =
    Object.keys(sandpackFiles).find((path) => sandpackFiles[path]?.active) ||
    Object.keys(sandpackFiles)[0];

  return (
    <div className="h-full flex flex-col bg-[#0f172a] text-white">
      {/* --- Header Bar --- */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#0f172a]">
        <button
          onClick={() => router.push("/challenges")}
          className="flex items-center gap-2 text-gray-300 hover:text-[#06ffa5] transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          <span className="font-medium">Back to Challenges</span>
        </button>

        <h1 className="text-lg font-semibold text-white">
          {challenge.title || "Challenge"}
        </h1>
      </div>{" "}
      <SandpackProvider
        key={challenge.id}
        template="react"
        theme="dark"
        files={sandpackFiles}
        customSetup={{
          dependencies: {
            "@testing-library/react": "latest",
            "@testing-library/jest-dom": "latest",
            "@testing-library/dom": "latest",
          },
        }}
        options={{
          visibleFiles: Object.keys(sandpackFiles).filter(
            (file) => !sandpackFiles[file]?.hidden
          ),
          activeFile: activeFile,
          initMode: "lazy",
          showDevTools: false,
          autorun: true,
          autoReload: true,
          testRunner: {
            autorun: false,
            showConsole: false,
          },
        }}
      >
        {/* Wrap everything inside a vertical PanelGroup */}
        <PanelGroup direction="vertical" style={{ height: "570px" }}>
          {/* === Main Coding Area === */}
          <Panel defaultSize={75} minSize={50}>
            <SandpackLayout
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <PanelGroup direction="horizontal">
                {/* Instructions */}
                <Panel defaultSize={20} minSize={10}>
                  <div className="border-r border-gray-700 flex flex-col h-full">
                    <div className="border-b border-gray-700 px-3 py-1 text-sm bg-gray-800">
                      Instructions
                    </div>
                    <div className="flex-1 overflow-auto p-4">
                      <h1 className="text-xl font-bold mb-4">
                        {challenge.title}
                      </h1>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: challenge.instructions,
                        }}
                        className="text-gray-300"
                      />
                    </div>
                  </div>
                </Panel>

                {/* Handle */}
                <PanelResizeHandle className="w-1 bg-gray-800 hover:bg-[#06ffa5] transition-colors" />

                {/* Editor */}
                <Panel defaultSize={40} minSize={25}>
                  <div className="border-r border-gray-700 flex flex-col h-full">
                    <div className="border-b border-gray-700">
                      {Object.keys(sandpackFiles).length > 0 && (
                        <FileTabs
                          allowedFiles={Object.keys(sandpackFiles).filter(
                            (file) => !sandpackFiles[file]?.hidden
                          )}
                        />
                      )}
                    </div>
                    <div className="flex-1 overflow-auto">
                      <CustomAceEditor />
                    </div>
                  </div>
                </Panel>

                <PanelResizeHandle className="w-1 bg-gray-800 hover:bg-[#06ffa5] transition-colors" />

                {/* Preview */}
                <Panel defaultSize={40} minSize={25}>
                  <div className="flex flex-col h-full">
                    <div className="border-b border-gray-700 px-3 py-1 text-sm bg-gray-800">
                      Preview
                    </div>
                    <div className="flex-1 overflow-auto">
                      <SandpackPreview
                        showOpenInCodeSandbox={false}
                        showRefreshButton={false}
                        showSandpackErrorOverlay={false}
                        style={{
                          width: "100%",
                          height: "100%",
                          backgroundColor: "white",
                        }}
                      />
                    </div>
                  </div>
                </Panel>
              </PanelGroup>
            </SandpackLayout>
          </Panel>

          {/* Vertical Resize Handle between main and tests */}
          <PanelResizeHandle className="h-2 bg-gray-800 hover:bg-[#06ffa5] transition-colors cursor-row-resize" />

          {/* === Test Runner Section === */}
          <Panel defaultSize={25} minSize={10}>
            <div className="w-full border-t border-gray-700 flex flex-col h-full bg-[#0f172a]">
              <TestRunner challenge={challenge} />
            </div>
          </Panel>
        </PanelGroup>
      </SandpackProvider>
    </div>
  );
}
