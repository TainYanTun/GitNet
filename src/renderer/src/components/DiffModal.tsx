import React from "react";
import { Modal } from "antd";
import { CopyOutlined, FileTextOutlined } from "@ant-design/icons";

interface DiffLine {
  oldLineNumber: number | null;
  newLineNumber: number | null;
  type: "addition" | "deletion" | "context" | "info" | "hunk";
  content: string; // Content without the diff indicator (+, -, or space)
  key: number;
  originalLine: string; // The full line as it appears in the diff
}

interface DiffModalProps {
  diffContent: string;
  filePath: string;
  onClose: () => void;
  visible: boolean;
}

const parseDiff = (diffContent: string): DiffLine[] => {
  if (!diffContent) {
    return [];
  }

  const lines = diffContent.split("\n");
  const parsedLines: DiffLine[] = [];
  let oldLineCounter = 0;
  let newLineCounter = 0;

  lines.forEach((line, index) => {
    let type: DiffLine["type"] = "context";
    let currentOldLine = null;
    let currentNewLine = null;
    let content = line; // Default to full line for content

    if (line.startsWith("--- a/") || line.startsWith("+++ b/")) {
      type = "info";
    } else if (line.startsWith("@@")) {
      type = "hunk";
      const match = line.match(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
      if (match) {
        // Initialize line counters for the hunk
        oldLineCounter = parseInt(match[1], 10) - 1; // Subtract 1 because context lines will increment before use
        newLineCounter = parseInt(match[3], 10) - 1; // Subtract 1 because context lines will increment before use
      }
    } else if (line.startsWith("+")) {
      type = "addition";
      newLineCounter++;
      currentNewLine = newLineCounter;
      content = line.substring(1); // Remove '+'
    } else if (line.startsWith("-")) {
      type = "deletion";
      oldLineCounter++;
      currentOldLine = oldLineCounter;
      content = line.substring(1); // Remove '-'
    } else if (line.startsWith(" ")) {
      // Context line
      type = "context";
      oldLineCounter++;
      newLineCounter++;
      currentOldLine = oldLineCounter;
      currentNewLine = newLineCounter;
      content = line.substring(1); // Remove leading space
    } else {
      // Handle potential non-diff lines that don't fit a standard pattern, treat as info
      type = "info";
    }

    parsedLines.push({
      oldLineNumber: currentOldLine,
      newLineNumber: currentNewLine,
      type,
      content,
      key: index,
      originalLine: line,
    });
  });

  return parsedLines;
};

export const DiffModal: React.FC<DiffModalProps> = ({
  diffContent,
  filePath,
  onClose,
  visible,
}) => {
  const diffLines = parseDiff(diffContent);

  const handleCopyDiff = () => {
    navigator.clipboard.writeText(diffContent);
  };

  return (
    <Modal
      title={
        <div className="flex items-center justify-between text-zed-text dark:text-zed-dark-text py-2 px-4">
          <div className="flex items-center gap-2">
            <FileTextOutlined className="h-5 w-5" />
            <span className="font-medium truncate">{filePath}</span>
          </div>
          <button
            onClick={handleCopyDiff}
            className="flex items-center gap-1 text-xs text-zed-muted dark:text-zed-dark-muted hover:text-zed-text dark:hover:text-zed-dark-text px-2 py-1 rounded transition-colors duration-200"
          >
            <CopyOutlined />
            Copy Diff
          </button>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width="80%"
      style={{ top: 20 }}
      classNames={{
        header:
          "bg-zed-surface dark:bg-zed-dark-surface border-b border-zed-border dark:border-zed-dark-border",
        content: "bg-zed-surface dark:bg-zed-dark-surface",
        mask: "bg-black bg-opacity-50",
      }}
      styles={{
        body: { height: "80vh", overflowY: "auto", padding: "0" },
      }}
    >
      <div className="text-xs font-mono bg-zed-bg dark:bg-zed-dark-bg text-zed-text dark:text-zed-dark-text h-full leading-relaxed">
        {diffLines.map((diffLine) => (
          <div
            key={diffLine.key}
            className={`flex group ${
              diffLine.type === "addition"
                ? "bg-green-500/10" // Tailwind class with opacity
                : diffLine.type === "deletion"
                  ? "bg-red-500/10" // Tailwind class with opacity
                  : diffLine.type === "info" || diffLine.type === "hunk"
                    ? "bg-zed-element dark:bg-zed-dark-element text-zed-muted dark:text-zed-dark-muted"
                    : "hover:bg-zed-element/5 dark:hover:bg-zed-dark-element/5"
            }`}
          >
            {/* Line Numbers */}
            {(diffLine.type === "addition" ||
              diffLine.type === "deletion" ||
              diffLine.type === "context") && (
              <div className="flex-shrink-0 w-20 text-right text-zed-muted dark:text-zed-dark-muted pr-2 select-none">
                <span className="inline-block w-8 text-right">
                  {diffLine.oldLineNumber || ""}
                </span>
                <span className="inline-block w-8 text-right">
                  {diffLine.newLineNumber || ""}
                </span>
              </div>
            )}
            {/* Diff Content */}
            <pre
              className={`flex-grow px-4 whitespace-pre-wrap ${
                // Use pre-wrap to handle long lines
                diffLine.type === "addition"
                  ? "text-green-400"
                  : diffLine.type === "deletion"
                    ? "text-red-400"
                    : ""
              }`}
            >
              {diffLine.originalLine}
            </pre>
          </div>
        ))}
      </div>
    </Modal>
  );
};
