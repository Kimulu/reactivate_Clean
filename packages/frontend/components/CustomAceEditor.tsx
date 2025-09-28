import { useActiveCode, useSandpack } from "@codesandbox/sandpack-react";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/ext-language_tools";

const CustomAceEditor = () => {
  const { code, updateCode } = useActiveCode();
  const { sandpack } = useSandpack();
  const { activeFile } = sandpack;

  const mode = activeFile.endsWith(".css")
    ? "css"
    : activeFile.endsWith(".html")
    ? "html"
    : "javascript";

  return (
    <AceEditor
      mode={mode}
      theme="dracula"
      value={code}
      onChange={updateCode}
      name="custom-ace-editor"
      fontSize={14}
      width="100%"
      height="300px"
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: true,
        showLineNumbers: true,
        tabSize: 2,
      }}
      editorProps={{ $blockScrolling: true }}
    />
  );
};

export default CustomAceEditor;
