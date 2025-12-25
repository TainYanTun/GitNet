import { watch, FSWatcher } from 'fs';
import { join } from 'path';
import { AppEvent } from '../../shared/types';

export class RepositoryWatcher {
  private watchers: Map<string, FSWatcher[]> = new Map();

  watchRepository(repoPath: string, callback: (event: AppEvent) => void): void {
    // Don't watch the same repo multiple times
    if (this.watchers.has(repoPath)) {
      this.unwatchRepository(repoPath);
    }

    const watchers: FSWatcher[] = [];

    try {
      // Watch .git/HEAD for branch changes
      const headWatcher = watch(join(repoPath, '.git', 'HEAD'), (eventType) => {
        if (eventType === 'change') {
          callback({
            type: 'head-changed',
            newHead: '',
            oldHead: '',
          });
        }
      });
      watchers.push(headWatcher);

      // Watch .git/refs/heads for branch updates
      const refsWatcher = watch(join(repoPath, '.git', 'refs', 'heads'), { recursive: true }, (eventType) => {
        if (eventType === 'change') {
          callback({
            type: 'branches-updated',
            branches: [],
          });
        }
      });
      watchers.push(refsWatcher);

      this.watchers.set(repoPath, watchers);
    } catch (error) {
      console.error('Failed to watch repository:', error);
      // Clean up any watchers that were created
      watchers.forEach(watcher => watcher.close());
    }
  }

  unwatchRepository(repoPath: string): void {
    const watchers = this.watchers.get(repoPath);
    if (watchers) {
      watchers.forEach(watcher => watcher.close());
      this.watchers.delete(repoPath);
    }
  }

  unwatchAll(): void {
    for (const [repoPath] of this.watchers) {
      this.unwatchRepository(repoPath);
    }
  }
}
