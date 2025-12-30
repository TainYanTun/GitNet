Security Analysis
  The application demonstrates a strong security posture for an Electron app.

   * Electron Security Best Practices:
       * ✅ Context Isolation & Node Integration: webPreferences are correctly configured with contextIsolation: true and nodeIntegration: false, preventing renderer
         processes from accessing Node.js primitives directly.
       * ✅ Webview Restrictions: The will-attach-webview event is handled to prevent unauthorized creation of <webview> tags, a common attack vector.
       * ✅ Navigation Control: The will-navigate handler strictly limits navigation to localhost:3000 (in dev) or internal files, preventing the app from being redirected
         to malicious external sites.
       * ✅ Permission Denial: The permissionRequestHandler denies all permission requests (camera, mic, etc.) by default.

   * IPC & Command Injection:
       * ✅ Safe IPC Handlers: open-external validates protocols (http/https) before opening URLs, mitigating URI scheme injection.
       * ✅ Git Command Execution: The GitService uses child_process.spawn with an array of arguments (e.g., ["log", "--all"]) rather than exec with a shell string. This
         effectively prevents shell injection attacks where a filename might contain malicious commands.

   * Recommendations:
       * External Link Hardening: While open-external checks protocols, you could further enhance security by maintaining a whitelist of allowed domains (e.g., github.com,
         gitlab.com) if the application's scope permits.

  Performance Analysis
  There are significant performance bottlenecks, particularly in the renderer's handling of large datasets.

   * Renderer Process (Critical):
       * 🔴 No List Virtualization: The CommitHistory component renders a standard HTML <table> mapping directly over the commits array. While pagination (onLoadMore)
         mitigates initial load times, loading many pages will bloat the DOM, causing significant UI lag and memory usage.
       * Impact: Scrolling through long histories will become jerky; the app may freeze with thousands of DOM nodes.
       * Recommendation: Implement "virtualization" (or "windowing") to only render the rows currently visible on screen. Since react-window or react-virtuoso are not in
         package.json, they should be added.

   * Main Process:
       * ⚠️ Stdout Buffering: The GitService.run method buffers the entire standard output of git commands into a single string in memory (stdout += data).
       * Impact: Operations returning huge datasets (e.g., a diff of a very large file that passes the "lines" check but has huge line lengths, or a massive log output)
         could cause high memory spikes or crash the main process.
       * Mitigation: The code currently limits getHotFiles and logs to 5000 entries, which is a good safeguard.

   * File Tree:
       * ⚠️ Recursive Rendering: FileTree.tsx recursively renders components. For a flat directory with thousands of files, this will be slow.

  Summary of Recommendations
   1. Install `react-window` (or similar) and refactor CommitHistory.tsx to use a virtualized list.
   2. Refactor `GitService` to handle streams for large data operations instead of buffering all output, or enforce stricter limits on buffer sizes.
   3. Consider `antd` Table: Since antd is already installed, check if its Table component (with virtualization enabled if supported by the version) can replace the custom
      HTML table for better performance.
