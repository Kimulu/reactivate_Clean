import styles from "../../styles/TestOutput.module.css";

import { useRouter } from "next/router";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  useSandpack,
} from "@codesandbox/sandpack-react";
import CustomAceEditor from "@/components/CustomAceEditor";
import FileTabs from "@/components/FileTabs";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { apiClient, Challenge } from "@/utils/apiClient";
import { useDispatch } from "react-redux";
import { updateUserTotalPoints } from "@/store/userSlice";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

// NOTE: A lightweight test display component was previously defined here but
// was unused. To reduce bundle size and remove unused-symbol warnings, it
// has been removed. The inline test output UI below is used instead.

type SubmissionPhase =
  | "idle"
  | "confirming_tests"
  | "tests_passed"
  | "tests_failed"
  | "submitting_code"
  | "submission_success"
  | "submission_failed";

interface SandpackFile {
  code?: string;
  hidden?: boolean;
  readOnly?: boolean;
}

type RunTestsResponse = {
  passed?: boolean;
  output?: string;
};

// 1. DEFINE THE PROPS FOR THE COMPONENT
interface TestRunnerProps {
  challenge: Challenge; // It will receive the full challenge object
}

// 2. UPDATE THE FUNCTION SIGNATURE TO ACCEPT THE PROP
function TestRunner({ challenge }: TestRunnerProps) {
  const { listen, sandpack } = useSandpack();
  const router = useRouter();
  const { id: challengeId } = router.query;
  const dispatch = useDispatch();

  const [isRunning, setIsRunning] = useState(false);
  const [testsPassed, setTestsPassed] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [testOutput, setTestOutput] = useState("");
  const [dirty, setDirty] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submissionPhase, setSubmissionPhase] =
    useState<SubmissionPhase>("idle");

  useEffect(() => {
    const unsubscribe = listen((msg) => {
      if (msg.type === "fs/change") {
        setDirty(true);
        setTestsPassed(false);
      }
    });
    return () => unsubscribe();
  }, [listen]);

  const runCustomTests = useCallback(async (): Promise<boolean> => {
    setIsRunning(true);
    setHasRun(true);

    try {
      const userSolutionFiles: Record<string, string> = {};
      for (const filePath in sandpack.files) {
        const file = sandpack.files[filePath] as unknown as SandpackFile;
        if (
          file &&
          typeof file.code === "string" &&
          !file.hidden &&
          !file.readOnly
        ) {
          userSolutionFiles[filePath] = file.code;
        }
      }

      // This assumes you have the 'challenge' object available in this component's scope
      const response = (await apiClient.runUserTests(
        challengeId as string,
        userSolutionFiles,
        challenge.testFileContent // <-- PASS THE TEST CONTENT HERE
      )) as unknown as RunTestsResponse;

      console.log("🧪 Backend Test Response:", response);

      const passed = response?.passed === true;
      setTestOutput(response?.output || "No output received from backend.");

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
    } catch (error: unknown) {
      console.error("❌ Error running tests:", error);
      toast.error("Error running tests");
      setTestsPassed(false);
      const message = error instanceof Error ? error.message : String(error);
      setTestOutput("⚠️ Error running tests: " + message);
      return false;
    } finally {
      setIsRunning(false);
    }
  }, [sandpack.files, challengeId, challenge]);

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
            const file = sandpack.files[filePath] as unknown as SandpackFile;
            if (file && typeof file.code === "string") {
              editedFilesContent[filePath] = file.code;
            }
          }

          const submissionResponse = (await apiClient.submitChallenge(
            challengeId as string,
            editedFilesContent
          )) as unknown as { userPoints?: number };

          if (typeof submissionResponse.userPoints === "number") {
            dispatch(updateUserTotalPoints(submissionResponse.userPoints));
          }
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
        } catch (error: unknown) {
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
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700 px-3 py-1 text-sm bg-gray-800">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">Tests</span>

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
      </div>

      {/* ✅ Always visible test output panel */}
      <div className={styles.testOutputContainer}>
        {/* Render floating PASS/FAIL badge */}
        {hasRun && (
          <div
            className={`${styles.testBadge} ${testsPassed ? styles.pass : ""}`}
          ></div>
        )}

        <div className={styles.testContent}>
          {isRunning ? (
            <div className="flex items-center space-x-2 text-gray-400 p-4">
              <Loader2 className="animate-spin text-[#06ffa5]" size={20} />
              <span>Running tests...</span>
            </div>
          ) : testOutput ? (
            <pre
              className="text-left w-full p-4 text-gray-300 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: testOutput }}
            />
          ) : hasRun ? (
            <p className="p-4">
              {testsPassed
                ? "✅ All tests passed successfully."
                : "❌ Some tests failed. Check your logic."}
            </p>
          ) : (
            <p className="p-4 text-gray-400">Run tests to see output...</p>
          )}
        </div>
      </div>

      {/* Modal stays the same */}
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

export default function ChallengeDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMobileAlert, setShowMobileAlert] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 768) {
      const dismissed = localStorage.getItem("mobileAlertDismissed");
      if (!dismissed) setShowMobileAlert(true);
    }
  }, []);

  const getCurrentUserId = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return null;
      const parsed = JSON.parse(storedUser);
      return parsed.id || parsed._id || null;
    } catch {
      return null;
    }
  };
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
        console.log("CHALLENGE DATA RECEIVED FROM BACKEND:", fetchedChallenge);

        setChallenge(fetchedChallenge);

        const userId = getCurrentUserId();
        console.log("🔍 userId:", userId);

        if (userId) {
          console.log("📡 Fetching submission for", { userId, id });
          try {
            const submission = await apiClient.getUserChallengeSubmission(
              userId,
              id
            );
            console.log("🧩 Submission response:", submission);
            if (submission && submission.submittedCode) {
              const mergedFiles = { ...fetchedChallenge.files };
              for (const path in submission.submittedCode) {
                if (mergedFiles[path]) {
                  mergedFiles[path].code = submission.submittedCode[path];
                }
              }
              setChallenge({ ...fetchedChallenge, files: mergedFiles });
              console.log("✅ Loaded user's previous submission");
            }
          } catch (err: unknown) {
            console.warn("⚠️ Error fetching submission:", err);
          }
        }
      } catch (err: unknown) {
        console.error("Error fetching challenge details:", err);
        const message =
          typeof err === "object" &&
          err !== null &&
          "message" in err &&
          typeof (err as { message?: unknown }).message === "string"
            ? (err as { message: string }).message
            : "Failed to load challenge details.";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchIndividualChallenge();
  }, [id]);

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
              readOnly: fileData.readOnly ?? false,
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

  const activeFile =
    Object.keys(sandpackFiles).find((path) => sandpackFiles[path]?.active) ||
    Object.keys(sandpackFiles)[0];

  return (
    <div className="h-screen flex flex-col bg-[#0f172a] text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 px-4 py-3 border-b border-gray-800 bg-[#0f172a]">
        <button
          onClick={() => router.push("/challenges")}
          className="flex items-center gap-2 text-[#06ffa5] text-sm md:text-base font-semibold hover:underline"
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
          Back to Challenges
        </button>

        <h1 className="text-lg md:text-2xl font-bold text-white text-center md:text-right truncate">
          {challenge.title || "Challenge"}
        </h1>
      </div>{" "}
      {showMobileAlert && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl shadow-xl max-w-sm w-full p-6 text-center border border-gray-700">
            <h2 className="text-xl font-bold mb-3 text-white">
              ⚠️ Desktop Recommended
            </h2>
            <p className="text-gray-300 text-sm mb-6">
              For the best experience, we recommend using a{" "}
              <b>laptop or desktop</b> to complete challenges. You can continue
              on mobile, but some features may be limited.
            </p>
            <button
              onClick={() => {
                localStorage.setItem("mobileAlertDismissed", "true");
                setShowMobileAlert(false);
              }}
              className="bg-[#06ffa5] text-black font-semibold px-4 py-2 rounded-lg hover:bg-[#04cc85] transition"
            >
              Continue Anyway
            </button>
          </div>
        </div>
      )}
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
          autorun: true,
          autoReload: true,
        }}
      >
        <PanelGroup
          direction="vertical"
          style={{ height: "calc(100vh - 140px)" }}
          className="sm:h-[570px]"
        >
          <Panel defaultSize={75} minSize={50}>
            <SandpackLayout className="flex flex-col h-full">
              <div className="hidden md:flex h-full">
                <PanelGroup direction="horizontal">
                  <Panel defaultSize={20} minSize={10}>
                    <div className="border-r border-gray-700 flex flex-col h-full bg-[#0f172a]">
                      <div className="border-b border-gray-700 px-3 py-2 text-sm bg-gray-800 font-semibold">
                        Instructions
                      </div>
                      <div className="flex-1 overflow-auto p-4 text-gray-300 text-sm">
                        <h1 className="text-xl font-bold mb-4">
                          {challenge.title}
                        </h1>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: challenge.instructions,
                          }}
                        />
                      </div>
                    </div>
                  </Panel>

                  <PanelResizeHandle className="w-1 bg-gray-800 hover:bg-[#06ffa5] transition-colors" />

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

                  <Panel defaultSize={40} minSize={25}>
                    <div className="flex flex-col h-full">
                      <div className="border-b border-gray-700 px-3 py-2 text-sm bg-gray-800 font-semibold">
                        Preview
                      </div>
                      <div className="flex-1 overflow-auto bg-white">
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
              </div>

              <div className="flex flex-col md:hidden h-full">
                <div className="flex-1 overflow-auto border-b border-gray-700 bg-[#0f172a]">
                  <div className="px-3 py-2 text-sm bg-gray-800 font-semibold border-b border-gray-700">
                    Instructions
                  </div>
                  <div className="p-3 text-gray-300 text-sm">
                    <h1 className="text-lg font-bold mb-3">
                      {challenge.title}
                    </h1>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: challenge.instructions,
                      }}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-auto border-b border-gray-700 bg-[#0f172a]">
                  <div className="border-b border-gray-700">
                    {Object.keys(sandpackFiles).length > 0 && (
                      <FileTabs
                        allowedFiles={Object.keys(sandpackFiles).filter(
                          (file) => !sandpackFiles[file]?.hidden
                        )}
                      />
                    )}
                  </div>
                  <CustomAceEditor />
                </div>

                <div className="flex-1 overflow-auto bg-white">
                  <div className="px-3 py-2 text-sm bg-gray-800 text-white font-semibold border-b border-gray-700">
                    Preview
                  </div>
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
            </SandpackLayout>
          </Panel>

          <PanelResizeHandle className="h-2 bg-gray-800 hover:bg-[#06ffa5] transition-colors cursor-row-resize" />

          <Panel defaultSize={205} minSize={20}>
            {challenge && <TestRunner challenge={challenge} />}
          </Panel>
        </PanelGroup>
      </SandpackProvider>
    </div>
  );
}
