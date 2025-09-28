import { useRouter } from "next/router";
import { challenges } from "@/data/challenges";
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

function TestRunner() {
  const { dispatch, listen } = useSandpack();
  const [isRunning, setIsRunning] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [testsPassed, setTestsPassed] = useState(false);
  const [hasRun, setHasRun] = useState(false); // has run tests at least once
  const [dirty, setDirty] = useState(false); // did user edit code after passing?

  const handleRunTests = () => {
    setIsRunning(true);
    setIsOpen(true);
    setHasRun(true);
    setTestsPassed(false);

    dispatch({ type: "refresh" });
    setTimeout(() => {
      dispatch({ type: "run-all-tests" });
    }, 800);
  };

  // Detect code edits → mark as dirty, revert to Attempt
  useEffect(() => {
    const unsubscribe = listen((msg) => {
      if (msg.type != "success") {
        setDirty(true);
        setTestsPassed(false);
      }
    });
    return () => unsubscribe();
  }, [listen]);

  // Listen for test results
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

            if (label.innerText === "PASS") {
              alert("test passed");
              setTestsPassed(true);
              setDirty(false);
            } else if (label.innerText === "FAIL") {
              alert("test failed");
              setTestsPassed(false);
            }
          } else {
            console.log("⚠️ Could not find .sp-test-spec-label element");
          }

          // Reset Run Tests button after result is shown
          setIsRunning(false);
        }, 500);
      }
    });

    return () => unsubscribe();
  }, [listen]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700 px-3 py-1 text-sm bg-gray-800">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Tests</span>

          {/* Run Tests */}
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

          {/* Attempt/Submit button */}
          {hasRun && (
            <button
              onClick={() =>
                testsPassed && !dirty
                  ? alert("✅ user submitted code successfully")
                  : alert("⚠️ Please fix errors and rerun tests")
              }
              className={`px-2 py-1 rounded-md text-white transition-colors duration-200 ${
                testsPassed && !dirty
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-yellow-600 hover:bg-yellow-700"
              }`}
            >
              {testsPassed && !dirty ? "Submit" : "Attempt"}
            </button>
          )}
        </div>

        {/* Toggle button appears only after first run */}
        {hasRun && (
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="px-2 py-1 rounded-md text-gray-300 hover:text-white"
          >
            {isOpen ? "▼ Hide" : "▲ Show"}
          </button>
        )}
      </div>

      {/* Test results panel */}
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
    </div>
  );
}

export default function ChallengeDetail() {
  const router = useRouter();
  const { id } = router.query;

  const challenge = challenges.find((c) => c.id === id);

  if (!challenge) {
    return <div className="p-4 text-red-500">Challenge not found</div>;
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
          {/* Top row */}
          <div className="flex flex-[2] border-b border-gray-700 min-h-0">
            {/* Instructions */}
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

            {/* Editor */}
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

            {/* Preview */}
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

        {/* Bottom row: tests */}
        <div className="flex flex-[1] border-t border-gray-700 min-h-0">
          <div className="flex-1 flex flex-col min-h-0">
            <TestRunner />
          </div>
        </div>
      </SandpackProvider>
    </div>
  );
}
