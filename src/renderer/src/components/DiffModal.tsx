import React from "react";
import { Modal } from "antd";
import {
  CopyOutlined,
  FileTextOutlined,
  CheckOutlined,
} from "@ant-design/icons";

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
  const [copied, setCopied] = React.useState(false);

  const handleCopyDiff = () => {
    navigator.clipboard.writeText(diffContent);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500); // Show copied state for 1.5 seconds
  };

  return (
    <Modal
      title={null}
      footer={null}
      open={visible}
      onCancel={onClose}
      width="80%"
      style={{ top: 20 }}
      closeIcon={
        <div className="text-zed-muted dark:text-zed-dark-muted hover:text-zed-text dark:hover:text-zed-dark-text p-1 rounded transition-colors duration-200">
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
      }
      classNames={{
        content:
          "bg-zed-surface dark:bg-zed-dark-surface rounded-lg shadow-soft",
        mask: "bg-black bg-opacity-50",
      }}
      styles={{
        body: { height: "90vh", overflow: "hidden", padding: "0" },
      }}
    >
      <div className="flex flex-col h-full">
        {/* Custom Header */}
        <div className="flex items-center justify-between text-zed-text dark:text-zed-dark-text py-2 px-4 border-b border-zed-border dark:border-zed-dark-border">
          <div className="flex items-center gap-2">
            <FileTextOutlined className="h-5 w-5 mr-2" />
            <span className="font-medium truncate">{filePath}</span>
            <button
              onClick={handleCopyDiff}
              className="group flex items-center gap-1 text-xs text-zed-muted dark:text-zed-dark-muted hover:text-zed-text dark:hover:text-zed-dark-text px-2 py-1 rounded transition-colors duration-200"
            >
              {copied ? <CheckOutlined /> : <CopyOutlined />}
            </button>
          </div>
        </div>
        {/* Diff Content */}
        <div className="flex-grow overflow-y-auto text-xs font-mono bg-zed-bg dark:bg-zed-dark-bg text-zed-text dark:text-zed-dark-text leading-relaxed">
          {diffLines.map((diffLine) => (
            <div
              key={diffLine.key}
              className={`flex group ${
                diffLine.type === "addition"
                  ? "bg-green-500/10"
                  : diffLine.type === "deletion"
                    ? "bg-red-500/10"
                    : diffLine.type === "info" || diffLine.type === "hunk"
                      ? "bg-zed-element dark:bg-zed-dark-element text-zed-muted dark:text-zed-dark-muted"
                      : "hover:bg-zed-element/5 dark:hover:bg-zed-dark-element/5"
              }`}
            >
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
              <pre
                className={`flex-grow px-4 whitespace-pre-wrap ${
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
      </div>
    </Modal>
  );
};
