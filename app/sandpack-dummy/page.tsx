'use client';

import SandpackWrapper from "../SandpackWrapper";

export default function SandpackDummyPage() {
  const reactFiles = {
    '/App.js': `import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  return <h1>Hello, Sandpack (React)!</h1>;
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
`,
  };

  return (
    <div>
      <h1>Sandpack Dummy App</h1>
      <p>This is a simple React app running in Sandpack.</p>
      <SandpackWrapper files={reactFiles} template="react" />
    </div>
  );
}
