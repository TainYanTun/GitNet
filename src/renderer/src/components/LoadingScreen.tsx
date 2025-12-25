import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="h-full flex items-center justify-center bg-background-primary">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4">
          <div className="spinner"></div>
        </div>
        <p className="text-text-secondary animate-pulse">{message}</p>
      </div>
    </div>
  );
};
