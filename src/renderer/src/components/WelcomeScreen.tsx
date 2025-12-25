import React from "react";

interface WelcomeScreenProps {
  onSelectRepository: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectRepository,
}) => {
  return (
    <div className="h-full flex items-center justify-center bg-background-primary">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to GitNet
          </h1>
          <p className="text-gray-600 mb-8">
            Visualize your Git repository's commit history as an interactive
            graph with semantic coloring and clear merge representation.
          </p>
        </div>

        <button
          onClick={onSelectRepository}
          className="btn-primary text-lg px-8 py-3"
        >
          Select Repository
        </button>

        <div className="mt-8 text-sm text-gray-500">
          <p>Choose a folder containing a Git repository to get started</p>
        </div>
      </div>
    </div>
  );
};
