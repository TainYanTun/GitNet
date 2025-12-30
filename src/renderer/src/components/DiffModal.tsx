import React, { useMemo, useCallback } from "react";
import { Modal } from "antd";
import {
  CopyOutlined,
  FileTextOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { List } from "react-window";
import { AutoSizer } from "react-virtualized-auto-sizer";

interface DiffLine {
  oldLineNumber: number | null;
  newLineNumber: number | null;
  type: "addition" | "deletion" | "context" | "info" | "hunk";
  content: string;
  key: number;
  originalLine: string;
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
    let content = line;

    if (line.startsWith("--- a/") || line.startsWith("+++ b/")) {
      type = "info";
    } else if (line.startsWith("@@")) {
      type = "hunk";
      const match = line.match(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
      if (match) {
        oldLineCounter = parseInt(match[1], 10) - 1;
        newLineCounter = parseInt(match[3], 10) - 1;
      }
    } else if (line.startsWith("+")) {
      type = "addition";
      newLineCounter++;
      currentNewLine = newLineCounter;
      content = line.substring(1);
    } else if (line.startsWith("-")) {
      type = "deletion";
      oldLineCounter++;
      currentOldLine = oldLineCounter;
      content = line.substring(1);
    } else if (line.startsWith(" ")) {
      type = "context";
      oldLineCounter++;
      newLineCounter++;
      currentOldLine = oldLineCounter;
      currentNewLine = newLineCounter;
      content = line.substring(1);
    } else {
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
  // Memoize parsing to prevent re-parsing on every re-render
  const diffLines = useMemo(() => parseDiff(diffContent), [diffContent]);
  const [copied, setCopied] = React.useState(false);

  const handleCopyDiff = () => {
    navigator.clipboard.writeText(diffContent);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  const Row = useCallback(
    ({
      index,
      style,
      ariaAttributes,
    }: {
      index: number;
      style: React.CSSProperties;
      ariaAttributes: {
        "aria-posinset": number;
        "aria-setsize": number;
        role: "listitem";
      };
    }): React.ReactElement => {
      const diffLine = diffLines[index];

      if (!diffLine) return <div style={style} />;

      return (
        <div
          style={style}
          {...ariaAttributes}
          className={`flex group border-b border-transparent ${
            diffLine.type === "addition"
              ? "bg-green-500/10"
              : diffLine.type === "deletion"
                ? "bg-red-500/10"
                : diffLine.type === "info" || diffLine.type === "hunk"
                  ? "bg-zed-element dark:bg-zed-dark-element text-zed-muted dark:text-zed-dark-muted"
                  : "hover:bg-zed-element/5 dark:hover:bg-zed-dark-element/5"
          }`}
        >
          {" "}
          {(diffLine.type === "addition" ||
            diffLine.type === "deletion" ||
            diffLine.type === "context") && (
            <div className="flex-shrink-0 w-20 text-right text-zed-muted dark:text-zed-dark-muted pr-2 select-none font-mono text-[10px] pt-1">
              <span className="inline-block w-8 text-right">
                {diffLine.oldLineNumber || ""}
              </span>
              <span className="inline-block w-8 text-right ml-1">
                {diffLine.newLineNumber || ""}
              </span>
            </div>
          )}
          <pre
            className={`flex-grow px-4 whitespace-pre font-mono text-[12px] leading-6 ${
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
      );
    },
    [diffLines],
  );

  return (
    <Modal
      title={null}
      footer={null}
      open={visible}
      onCancel={onClose}
      width="90%"
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
        body: { height: "85vh", overflow: "hidden", padding: "0" },
      }}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between text-zed-text dark:text-zed-dark-text py-3 px-6 border-b border-zed-border dark:border-zed-dark-border bg-zed-surface dark:bg-zed-dark-surface shrink-0">
          <div className="flex items-center gap-3">
            <FileTextOutlined className="text-zed-accent" />
            <span className="font-semibold text-sm truncate max-w-md">
              {filePath}
            </span>
            <button
              onClick={handleCopyDiff}
              className="group flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-zed-muted hover:text-zed-accent px-2 py-1 transition-all"
            >
              {copied ? (
                <CheckOutlined className="text-green-500" />
              ) : (
                <CopyOutlined />
              )}
              <span>{copied ? "Copied" : "Copy Diff"}</span>
            </button>
          </div>
        </div>

        <div className="flex-grow bg-zed-bg dark:bg-zed-dark-bg overflow-hidden relative">
          <AutoSizer
            Child={({ height, width }) => (
              <List
                style={{ height: height || 0, width: width || 0 }}
                rowCount={diffLines.length}
                rowHeight={24}
                rowComponent={Row}
                rowProps={{}}
                className="custom-scrollbar"
              />
            )}
          />
        </div>
      </div>
    </Modal>
  );
};
