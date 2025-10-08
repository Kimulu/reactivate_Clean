import { useRouter } from "next/router";
// 💡 REMOVED: import { challenges } from "@/data/challenges"; // No longer needed
import {
  SandpackProvider,
  SandpackPreview,
  SandpackTests,
  SandpackLayout,
  useSandpack,
} from "@codesandbox/sandpack-react";
import CustomAceEditor from "@/components/CustomAceEditor";
import FileTabs from "@/components/FileTabs";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
// 💡 NEW: Import apiClient and Challenge interface
import { apiClient, Challenge } from "@/utils/apiClient";
// 💡 NEW IMPORT: useDispatch and updateUserTotalPoints for Redux
import { useDispatch } from "react-redux";
import { updateUserTotalPoints } from "@/store/userSlice";

type SubmissionPhase =
  | "idle"
  | "confirming_tests"
  | "tests_passed"
  | "tests_failed"
  | "submitting_code"
  | "submission_success"
  | "submission_failed";

interface TestRunnerProps {
  challenge: Challenge; // Pass the fetched challenge down
}

function TestRunner({ challenge }: TestRunnerProps) {
  const { dispatch: sandpackDispatch, listen, sandpack } = useSandpack(); // 💡 MODIFIED: Renamed dispatch to sandpackDispatch
  const router = useRouter();
  const { id: challengeId } = router.query;
  const dispatch = useDispatch(); // 💡 NEW: Initialize Redux useDispatch

  const [isRunning, setIsRunning] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [testsPassed, setTestsPassed] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submissionPhase, setSubmissionPhase] =
    useState<SubmissionPhase>("idle");

  const initiateTestRun = (forSubmission: boolean = false) => {
    setIsRunning(true);
    setIsOpen(true);
    setHasRun(true);
    setTestsPassed(false);
    setDirty(false); // Assume code is clean when starting a new test run

    if (forSubmission) {
      setSubmissionPhase("confirming_tests");
      console.log("Submission Phase: confirming_tests");
    }

    sandpackDispatch({ type: "refresh" }); // 💡 MODIFIED: Use sandpackDispatch
    setTimeout(() => {
      sandpackDispatch({ type: "run-all-tests" }); // 💡 MODIFIED: Use sandpackDispatch
    }, 800);
  };

  const handleRunTests = () => initiateTestRun(false);

  const handleRunTestsForSubmission = () => {
    initiateTestRun(true);
  };

  useEffect(() => {
    const unsubscribe = listen((msg) => {
      if (msg.type === "state" && msg.state.files) {
        if (!challenge || !challenge.files) {
          console.warn(
            "Challenge data not available for dirty check in TestRunner."
          );
          return;
        }

        let isCurrentlyDirty = false;
        for (const filePath in sandpack.files) {
          if (Object.prototype.hasOwnProperty.call(sandpack.files, filePath)) {
            const currentFile = sandpack.files[filePath];
            const initialFile = challenge.files[filePath]; // Use challenge prop

            if (
              currentFile &&
              typeof (currentFile as any).code === "string" &&
              initialFile &&
              typeof (initialFile as any).code === "string"
            ) {
              if ((currentFile as any).code !== (initialFile as any).code) {
                isCurrentlyDirty = true;
                break;
              }
            } else if (currentFile && !initialFile) {
              isCurrentlyDirty = true;
              break;
            }
          }
        }

        if (isCurrentlyDirty) {
          setDirty(true);
          setTestsPassed(false);
        } else if (msg.type !== "success" && msg.type !== "start") {
          setDirty(true);
          setTestsPassed(false);
        }
      } else if (msg.type !== "success" && msg.type !== "start") {
        setDirty(true);
        setTestsPassed(false);
      }
    });
    return () => unsubscribe();
  }, [listen, sandpack.files, challenge, testsPassed]);

  useEffect(() => {
    const unsubscribe = listen((msg) => {
      if (msg.type === "test" && msg.event === "total_test_end") {
        console.log("🟡 total_test_end received, waiting for DOM update...");

        setTimeout(() => {
          const label = document.querySelector(
            ".sp-test-spec-label"
          ) as HTMLElement;

          if (label) {
            console.log("🔍 Detected result text:", label.innerText);

            const passed = label.innerText === "PASS";

            if (passed) {
              setTestsPassed(true);
              setDirty(false);
            } else {
              setTestsPassed(false);
            }

            if (submissionPhase === "confirming_tests") {
              if (passed) {
                setSubmissionPhase("tests_passed");
                console.log("Submission Phase: tests_passed");

                setTimeout(async () => {
                  setSubmissionPhase("submitting_code");
                  console.log("Submission Phase: submitting_code");

                  try {
                    const editedFilesContent: { [path: string]: string } = {};

                    if (
                      !sandpack.files ||
                      Object.keys(sandpack.files).length === 0
                    ) {
                      throw new Error(
                        "No files found in Sandpack editor for submission."
                      );
                    }

                    for (const filePath in sandpack.files) {
                      if (
                        Object.prototype.hasOwnProperty.call(
                          sandpack.files,
                          filePath
                        )
                      ) {
                        const file = sandpack.files[filePath];
                        if (file && typeof (file as any).code === "string") {
                          editedFilesContent[filePath] = (file as any).code;
                        }
                      }
                    }

                    if (Object.keys(editedFilesContent).length === 0) {
                      throw new Error(
                        "No editable files with content found for submission."
                      );
                    }

                    console.log(
                      "Submitting challenge",
                      challengeId,
                      "with code:",
                      editedFilesContent
                    );

                    // 💡 MODIFIED: Call apiClient.submitChallenge and get response
                    const submissionResponse = await apiClient.submitChallenge(
                      challengeId as string,
                      editedFilesContent
                    );

                    // 💡 NEW: Dispatch Redux action to update user's total points
                    dispatch(
                      updateUserTotalPoints(submissionResponse.userPoints)
                    );
                    console.log(
                      "Redux: User total points updated to",
                      submissionResponse.userPoints
                    );

                    setSubmissionPhase("submission_success");
                    toast.success("Challenge completed successfully! 🎉");
                    console.log("Submission Phase: submission_success");

                    setTimeout(() => {
                      setIsSubmitModalOpen(false);
                      router.push("/challenges");
                    }, 1000);
                  } catch (error: any) {
                    setSubmissionPhase("submission_failed");
                    toast.error(
                      error.message || "Failed to process submission."
                    );
                    console.error("Submission Phase: submission_failed", error);
                    setIsSubmitModalOpen(false);
                  }
                }, 800);
              } else {
                setSubmissionPhase("tests_failed");
                toast.error(
                  "Submission tests failed. Please refine your code."
                );
                console.log("Submission Phase: tests_failed");
                setIsSubmitModalOpen(false);
              }
            }
          } else {
            console.log(
              "⚠️ Could not find .sp-test-spec-label element after test run."
            );
            if (submissionPhase === "confirming_tests") {
              setSubmissionPhase("tests_failed");
              toast.error("Could not get test results for submission.");
            }
          }

          setIsRunning(false);
        }, 500);
      }
    });

    return () => unsubscribe();
  }, [
    listen,
    submissionPhase,
    sandpack.files,
    challenge,
    router,
    challengeId,
    dispatch,
  ]); // 💡 MODIFIED: Added dispatch to dependencies

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-gray-700 px-3 py-1 text-sm bg-gray-800">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Tests</span>

          <button
            onClick={handleRunTests}
            className={`px-2 py-1 rounded-md text-white transition-colors duration-200 ${
              isRunning &&
              submissionPhase !== "confirming_tests" &&
              submissionPhase !== "submitting_code"
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={
              isRunning &&
              submissionPhase !== "confirming_tests" &&
              submissionPhase !== "submitting_code"
            }
          >
            {isRunning &&
            submissionPhase !== "confirming_tests" &&
            submissionPhase !== "submitting_code"
              ? "Running..."
              : "Run Tests"}
          </button>

          {hasRun && (
            <button
              onClick={() => {
                if (testsPassed && !dirty) {
                  setIsSubmitModalOpen(true);
                  setSubmissionPhase("idle");
                } else {
                  toast.error("⚠️ Please fix errors and rerun tests");
                }
              }}
              className={`px-2 py-1 rounded-md text-white transition-colors duration-200 ${
                testsPassed && !dirty
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-yellow-600 hover:bg-yellow-700"
              }`}
              disabled={isRunning || isSubmitModalOpen}
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
            {isOpen ? "▼ Hide" : "▲ Show"}
          </button>
        )}
      </div>

      <div
        className={`flex-1 min-h-0 overflow-auto transition-all duration-300 ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <SandpackTests
          showVerboseButton={false}
          showWatchButton={false}
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#0f172a",
          }}
        />
      </div>

      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[#1a1a2e] p-8 rounded-lg shadow-2xl text-white max-w-sm w-full border border-[#06ffa5]/20">
            <h2 className="text-xl font-bold mb-6 text-center text-[#06ffa5]">
              {submissionPhase === "submission_success"
                ? "Submission Complete"
                : "Confirm Submission"}
            </h2>

            {submissionPhase === "idle" && (
              <>
                <p className="text-gray-300 mb-6 text-center">
                  Are you sure you want to submit your code? Tests will be
                  re-run to confirm a passing solution.
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

            {(submissionPhase === "confirming_tests" ||
              submissionPhase === "tests_passed" ||
              submissionPhase === "submitting_code") && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  {submissionPhase === "confirming_tests" ? (
                    <Loader2
                      className="animate-spin text-[#06ffa5]"
                      size={20}
                    />
                  ) : submissionPhase === "tests_failed" ? (
                    <XCircle className="text-red-500" size={20} />
                  ) : (
                    <CheckCircle className="text-green-500" size={20} />
                  )}
                  <span
                    className={`font-medium ${
                      submissionPhase === "tests_failed"
                        ? "text-red-400"
                        : "text-gray-300"
                    }`}
                  >
                    Running tests...
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  {submissionPhase === "submitting_code" ? (
                    <Loader2
                      className="animate-spin text-[#06ffa5]"
                      size={20}
                    />
                  ) : submissionPhase === "submission_success" ? (
                    <CheckCircle className="text-green-500" size={20} />
                  ) : (
                    <div className="w-5 h-5 border border-gray-500 rounded-full flex items-center justify-center text-xs text-gray-500"></div>
                  )}
                  <span
                    className={`font-medium ${
                      submissionPhase === "submitting_code"
                        ? "text-gray-200"
                        : "text-gray-400"
                    }`}
                  >
                    Submitting your code...
                  </span>
                </div>
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

  if (!challenge) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0f172a] text-red-500">
        Challenge not found.
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0f172a] text-white">
      <SandpackProvider
        template="react"
        theme="dark"
        files={challenge.files ?? {}}
        customSetup={{
          dependencies: {
            "@testing-library/react": "latest",
            "@testing-library/jest-dom": "latest",
            "@testing-library/dom": "latest",
          },
        }}
      >
        <SandpackLayout>
          <div className="flex flex-[2] border-b border-gray-700 min-h-0">
            <div className="flex-[1] border-r border-gray-700 flex flex-col min-h-0">
              <div className="border-b border-gray-700 px-3 py-1 text-sm bg-gray-800">
                Instructions
              </div>
              <div className="flex-1 overflow-auto p-4">
                <h1 className="text-xl font-bold mb-4">{challenge.title}</h1>
                <div
                  className="text-gray-300"
                  dangerouslySetInnerHTML={{ __html: challenge.instructions }}
                />
              </div>
            </div>

            <div className="flex-[2] border-r border-gray-700 flex flex-col min-h-0">
              <div className="border-b border-gray-700">
                {challenge.files && (
                  <FileTabs allowedFiles={Object.keys(challenge.files)} />
                )}
              </div>
              <div className="flex-1 min-h-0 overflow-auto">
                <CustomAceEditor />
              </div>
            </div>

            <div className="flex-[2] flex flex-col min-h-0">
              <div className="border-b border-gray-700 px-3 py-1 text-sm bg-gray-800">
                Preview
              </div>
              <div className="flex-1 min-h-0 overflow-auto">
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
          </div>
        </SandpackLayout>

        <div className="flex flex-[1] border-t border-gray-700 min-h-0">
          <div className="flex-1 flex flex-col min-h-0">
            <TestRunner challenge={challenge} />
          </div>
        </div>
      </SandpackProvider>
    </div>
  );
}
