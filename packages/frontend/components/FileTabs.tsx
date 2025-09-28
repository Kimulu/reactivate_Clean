import { useSandpack } from "@codesandbox/sandpack-react";

export default function FileTabs({ allowedFiles }: { allowedFiles: string[] }) {
  const { sandpack } = useSandpack();
  const { activeFile, setActiveFile } = sandpack;

  // Filter out test files and hidden files (starting with "/test" or marked .hidden)
  const visibleFiles = allowedFiles.filter(
    (file) => !file.startsWith("/test/") // hide tests and css
  );

  return (
    <div className="flex bg-gray-800 text-gray-200 text-sm">
      {visibleFiles.map((file) => (
        <button
          key={file}
          onClick={() => setActiveFile(file)}
          className={`px-3 py-1 border-b-2 ${
            activeFile === file
              ? "border-blue-500 text-white"
              : "border-transparent hover:border-gray-500"
          }`}
        >
          {file.replace("/", "")}
        </button>
      ))}
    </div>
  );
}
