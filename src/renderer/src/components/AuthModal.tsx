import React, { useState, useEffect, useRef } from 'react';

interface AuthModalProps {
  prompt: string;
  onSubmit: (answer: string) => void;
  onCancel: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ prompt, onSubmit, onCancel }) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zed-bg dark:bg-zed-dark-bg border border-zed-border dark:border-zed-dark-border shadow-2xl rounded-lg w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-zed-text dark:text-zed-dark-text mb-4">
          Authentication Required
        </h3>
        <p className="text-sm text-zed-muted dark:text-zed-dark-muted mb-4 font-mono break-all">
          {prompt}
        </p>
        
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-3 py-2 bg-zed-surface dark:bg-zed-dark-surface border border-zed-border dark:border-zed-dark-border rounded focus:outline-none focus:border-zed-accent text-zed-text dark:text-zed-dark-text mb-6"
            placeholder="Enter password or token..."
          />
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-zed-text dark:text-zed-dark-text hover:bg-zed-element dark:hover:bg-zed-dark-element rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-zed-accent text-white rounded hover:bg-zed-accent/90 transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
