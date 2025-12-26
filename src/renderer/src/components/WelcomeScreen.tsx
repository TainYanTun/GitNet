import React, { useState, useEffect } from "react";
import { useTheme } from "./ThemeContext"; // Import useTheme

interface WelcomeScreenProps {
  onSelectRepository: (path?: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectRepository,
}) => {
  const [recentRepos, setRecentRepos] = useState<string[]>([]);
  const { theme } = useTheme(); // Use the theme hook

  useEffect(() => {
    const fetchRecentRepos = async () => {
      const settings = await window.gitnetAPI.getSettings();
      setRecentRepos(settings.recentRepositories || []);
    };
    fetchRecentRepos();
  }, []);

  const handleClearRecent = async () => {
    await window.gitnetAPI.clearRecentRepositories();
    setRecentRepos([]);
  };

  return (
    <div
      className="h-full flex flex-col items-center justify-center text-zed-text dark:text-zed-dark-text select-none"
      style={{
        backgroundColor: "var(--zed-bg)", // Fallback color
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%236B7280' fill-opacity='0.05' fill-rule='evenodd'%3E%3Cpath d='M90 6V0H0v6'/%3E%3Cpath d='M6 0L0 6h6V0zm-3 3L0 6h6V0zm-3 0L0 3h3V0z'/%3E%3C/g%3E%3C/svg%3E\")",
        backgroundRepeat: "repeat",
      }}
    >
      <div className="max-w-sm w-full mx-auto text-center p-8">
        <div className="mb-10 flex flex-col items-center">
          <div className="w-32 h-32 mb-6 flex items-center justify-center">
            {theme === "dark" ? ( // Conditionally render based on theme
              <img src="/whiteicon.svg" alt="App Logo" className="w-32 h-32" />
            ) : (
              <img src="/whiteicon.svg" alt="App Logo" className="w-32 h-32" />
            )}
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
            onClick={() => onSelectRepository()}
            className="w-full py-3 px-4 rounded-md border border-zed-border dark:border-zed-dark-border bg-zed-surface dark:bg-zed-dark-surface hover:bg-zed-element dark:hover:bg-zed-dark-element hover:border-zed-accent/50 text-zed-text dark:text-zed-dark-text text-sm font-medium transition-all duration-200 flex items-center justify-center gap-3 group"
          >
            <span className="text-base">Open Repository...</span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 h-5 text-[10px] font-mono font-medium text-zed-muted dark:text-zed-dark-muted border border-zed-border dark:border-zed-dark-border rounded bg-zed-bg dark:bg-zed-dark-bg group-hover:text-zed-text dark:group-hover:text-zed-dark-text transition-colors">
              ⌘O
            </kbd>
          </button>

          {recentRepos.length > 0 && (
            <div className="space-y-2 text-left">
              <div className="text-xs text-zed-muted/60 dark:text-zed-dark-muted/60 uppercase mt-4">
                Recent Repositories
              </div>
              {recentRepos.map((repoPath) => (
                <button
                  key={repoPath}
                  onClick={() => onSelectRepository(repoPath)}
                  className="w-full py-2 px-4 rounded-md border border-zed-border dark:border-zed-dark-border bg-zed-surface dark:bg-zed-dark-surface hover:bg-zed-element dark:hover:bg-zed-dark-element hover:border-zed-accent/50 text-zed-text dark:text-zed-dark-text text-sm font-medium transition-all duration-200 flex items-center group"
                >
                  <span className="truncate">{repoPath}</span>
                </button>
              ))}
              <button
                onClick={handleClearRecent}
                className="w-full py-2 px-4 text-xs text-zed-muted dark:text-zed-dark-muted hover:text-zed-text dark:hover:text-zed-dark-text transition-colors"
              >
                Clear Recent
              </button>
            </div>
          )}

          <p className="text-xs text-zed-muted/60 dark:text-zed-dark-muted/60">
            Select a folder to analyze
          </p>
        </div>
      </div>
    </div>
  );
};
