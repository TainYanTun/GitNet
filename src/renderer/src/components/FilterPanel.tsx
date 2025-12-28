import React, { useState } from 'react';
import { CommitFilter } from '@shared/types';

interface FilterPanelProps {
  onApplyFilter: (filter: CommitFilter) => void;
  onClearFilter: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ onApplyFilter, onClearFilter }) => {
  const [filter, setFilter] = useState<CommitFilter>({
    path: '',
    author: '',
    since: '',
    until: '',
    search: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    onApplyFilter(filter);
  };

  const handleClear = () => {
    const emptyFilter = { path: '', author: '', since: '', until: '', search: '' };
    setFilter(emptyFilter);
    onClearFilter();
  };

  return (
    <div className="p-4 bg-zed-surface/50 dark:bg-zed-dark-surface/50 border-b border-zed-border dark:border-zed-dark-border space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-zed-muted uppercase">Search Message</label>
          <input 
            name="search"
            value={filter.search}
            onChange={handleChange}
            placeholder="e.g. fix sidebar"
            className="w-full bg-zed-element dark:bg-zed-dark-element border border-zed-border dark:border-zed-dark-border rounded px-2 py-1 text-xs focus:outline-none focus:border-zed-accent"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-zed-muted uppercase">Author</label>
          <input 
            name="author"
            value={filter.author}
            onChange={handleChange}
            placeholder="e.g. John"
            className="w-full bg-zed-element dark:bg-zed-dark-element border border-zed-border dark:border-zed-dark-border rounded px-2 py-1 text-xs focus:outline-none focus:border-zed-accent"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-zed-muted uppercase">File Path</label>
          <input 
            name="path"
            value={filter.path}
            onChange={handleChange}
            placeholder="e.g. src/main"
            className="w-full bg-zed-element dark:bg-zed-dark-element border border-zed-border dark:border-zed-dark-border rounded px-2 py-1 text-xs focus:outline-none focus:border-zed-accent"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-zed-muted uppercase">Since</label>
          <input 
            name="since"
            type="date"
            value={filter.since}
            onChange={handleChange}
            className="w-full bg-zed-element dark:bg-zed-dark-element border border-zed-border dark:border-zed-dark-border rounded px-2 py-1 text-xs focus:outline-none focus:border-zed-accent"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-zed-muted uppercase">Until</label>
          <input 
            name="until"
            type="date"
            value={filter.until}
            onChange={handleChange}
            className="w-full bg-zed-element dark:bg-zed-dark-element border border-zed-border dark:border-zed-dark-border rounded px-2 py-1 text-xs focus:outline-none focus:border-zed-accent"
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <button 
          onClick={handleClear}
          className="px-3 py-1 text-xs text-zed-muted hover:text-zed-text transition-colors"
        >
          Clear All
        </button>
        <button 
          onClick={handleApply}
          className="px-4 py-1 text-xs bg-zed-accent text-white rounded hover:opacity-90 transition-all font-semibold"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};
