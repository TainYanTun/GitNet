import { calculateLayout } from './graph-layout';

self.onmessage = (event: MessageEvent) => {
  const { commits, branches, headCommitHash, stashes } = event.data;
  
  try {
    const result = calculateLayout(commits, branches, headCommitHash, stashes);
    self.postMessage({ type: 'SUCCESS', result });
  } catch (error) {
    self.postMessage({ type: 'ERROR', error: error instanceof Error ? error.message : 'Unknown layout error' });
  }
};
