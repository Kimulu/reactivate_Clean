import { useActiveCode, useSandpack } from "@codesandbox/sandpack-react";
import AceEditor from "react-ace";
import { useEffect, useState } from "react"; // 💡 NEW: Import useEffect, useState

// Import necessary modes and themes dynamically or explicitly
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/mode-html";
// Import common themes used in settings:
import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-tomorrow_night";

import "ace-builds/src-noconflict/ext-language_tools";

const CustomAceEditor = () => {
  const { code, updateCode } = useActiveCode();
  const { sandpack } = useSandpack();
  const { activeFile } = sandpack;

  // 💡 NEW STATES: To hold editor preferences from localStorage
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState("dracula");
  const [tabSize, setTabSize] = useState(2);

  // 💡 NEW useEffect: Load editor preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setFontSize(parseInt(localStorage.getItem("editorFontSize") || "14", 10));
      setTheme(localStorage.getItem("editorTheme") || "dracula");
      setTabSize(parseInt(localStorage.getItem("editorTabSize") || "2", 10));
    }
    // Listen for storage changes to react to settings updates from other tabs/windows
    const handleStorageChange = () => {
      if (typeof window !== "undefined") {
        setFontSize(
          parseInt(localStorage.getItem("editorFontSize") || "14", 10)
        );
        setTheme(localStorage.getItem("editorTheme") || "dracula");
        setTabSize(parseInt(localStorage.getItem("editorTabSize") || "2", 10));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const mode = activeFile.endsWith(".css")
    ? "css"
    : activeFile.endsWith(".html")
    ? "html"
    : "javascript";

  return (
    <AceEditor
      mode={mode}
      // 💡 MODIFIED: Use dynamic theme
      theme={theme}
      value={code}
      onChange={updateCode}
      name="custom-ace-editor"
      // 💡 MODIFIED: Use dynamic font size
      fontSize={fontSize}
      width="100%"
      height="100%"
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: true,
        showLineNumbers: true,
        // 💡 MODIFIED: Use dynamic tab size
        tabSize: tabSize,
      }}
      editorProps={{ $blockScrolling: true }}
    />
  );
};

export default CustomAceEditor;
