"use client";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
} from "@codesandbox/sandpack-react";

const SandpackDemo = ({ files, template }: { files: any; template: any }) => (
  <SandpackProvider
    template={template}
    files={files}
    customSetup={{
      dependencies: {
        "react-dom": "latest",
        react: "latest",
      },
      entry: "/index.js",
    }}
  >
    <SandpackLayout style={{ height: "600px", width: "800px" }}>
      <SandpackCodeEditor style={{ height: "600px", width: "700px" }} />
      <SandpackPreview style={{ height: "600px", width: "200px" }} />
    </SandpackLayout>
  </SandpackProvider>
);

export default SandpackDemo;
