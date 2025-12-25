import React from "react";

interface WelcomeScreenProps {
  onSelectRepository: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectRepository,
}) => {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-zed-bg dark:bg-zed-dark-bg text-zed-text dark:text-zed-dark-text select-none">
      <div className="max-w-sm w-full mx-auto text-center p-8">
        <div className="mb-10 flex flex-col items-center">
          <div className="w-20 h-20 mb-6 text-zed-muted dark:text-zed-dark-muted opacity-80 flex items-center justify-center">
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-medium mb-3 tracking-tight text-zed-text dark:text-zed-dark-text">
            GitNet
          </h1>
          <p className="text-zed-muted dark:text-zed-dark-muted text-sm leading-relaxed">
            Visualize your repository history <br /> with railway-style lanes.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={onSelectRepository}
            className="w-full py-2 px-4 rounded-md border border-zed-border dark:border-zed-dark-border bg-zed-surface dark:bg-zed-dark-surface hover:bg-zed-element dark:hover:bg-zed-dark-element hover:border-zed-accent/50 text-zed-text dark:text-zed-dark-text text-sm font-medium transition-all duration-200 flex items-center justify-center gap-3 group"
          >
            <span>Open Repository...</span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 h-5 text-[10px] font-mono font-medium text-zed-muted dark:text-zed-dark-muted border border-zed-border dark:border-zed-dark-border rounded bg-zed-bg dark:bg-zed-dark-bg group-hover:text-zed-text dark:group-hover:text-zed-dark-text transition-colors">
              ⌘O
            </kbd>
          </button>

          <p className="text-xs text-zed-muted/60 dark:text-zed-dark-muted/60">
            Select a folder to analyze
          </p>
        </div>
      </div>
    </div>
  );
};
