import { Commit, Branch, VisualizationData, GraphNode, GraphEdge } from "@shared/types";

/**
 * Enhanced Git graph layout engine with a "Main Spine".
 * Reserves Lane 0 for main/master to provide a stable visual anchor.
 */
export const calculateLayout = (
  commits: Commit[],
  branches: Branch[],
  headCommitHash?: string,
  stashes: string[] = []
): VisualizationData => {
  if (commits.length === 0) {
    return {
      nodes: [],
      edges: [],
      laneSegments: [],
      width: 0,
      height: 0,
      bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
    };
  }

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  
  // Lane management
  const commitToLane = new Map<string, number>();
  const activeLanes: (string | null)[] = []; 
  
  const laneWidth = 40; 
  const commitHeight = 50;

  const isMainBranch = (name?: string) => 
    name === "main" || name === "master" || name === "origin/main" || name === "origin/master";

  const getBranchColor = (branchName?: string) => {
    if (!branchName) return "#7c3aed";
    const branch = branches.find(b => b.name === branchName);
    return branch ? branch.color : "#7c3aed";
  };

  // 1. Process Commits (Newest to Oldest)
  commits.forEach((commit, yIndex) => {
    let lane = activeLanes.indexOf(commit.hash);

    // Enforce "Main Spine" in Lane 0
    if (isMainBranch(commit.branchName)) {
      lane = 0;
    }

    if (lane === -1) {
      // Find first empty slot. 
      // If it's main, we MUST use lane 0. 
      // If it's not main, we start looking from lane 1.
      if (isMainBranch(commit.branchName)) {
        lane = 0;
      } else {
        lane = 1;
        while (lane < activeLanes.length && activeLanes[lane] !== null) {
          lane++;
        }
      }

      // Fill activeLanes up to the required index
      while (activeLanes.length <= lane) {
        activeLanes.push(null);
      }
      activeLanes[lane] = commit.hash;
    } else {
      // Commit already has a reserved lane from a child
      activeLanes[lane] = commit.hash;
    }

    commitToLane.set(commit.hash, lane);

    // 2. Prepare lanes for parents (Lookahead)
    const parents = commit.parents || [];
    if (parents.length > 0) {
      // Primary parent usually continues the current lane
      const primaryParent = parents[0];
      
      // If we are on main, we keep lane 0 occupied for the parent
      if (lane === 0) {
        activeLanes[0] = primaryParent;
      } else {
        // If the primary parent is already in a lane (e.g. lane 0), don't overwrite it
        const existingLane = activeLanes.indexOf(primaryParent);
        if (existingLane === -1) {
           activeLanes[lane] = primaryParent;
        } else {
           activeLanes[lane] = null; // Current lane ends here if parent is elsewhere
        }
      }

      // Other parents (merges) get new lanes if they don't have one
      for (let i = 1; i < parents.length; i++) {
        const pHash = parents[i];
        if (activeLanes.indexOf(pHash) === -1) {
          // Find a slot starting from lane 1
          let nextSlot = 1;
          while (nextSlot < activeLanes.length && activeLanes[nextSlot] !== null) {
            nextSlot++;
          }
          if (nextSlot === activeLanes.length) {
            activeLanes.push(pHash);
          } else {
            activeLanes[nextSlot] = pHash;
          }
        }
      }
    } else {
      // Root commit - clear its lane
      activeLanes[lane] = null;
    }

    const branchName = commit.branchName || "main";
    const color = getBranchColor(branchName);
    const isHead = commit.hash === headCommitHash;

    nodes.push({
      id: commit.hash,
      commit: { ...commit, branchName },
      x: (lane + 1) * laneWidth,
      y: (yIndex + 1) * commitHeight,
      lane,
      color,
      shape: commit.isMerge ? "diamond" : (commit.type === "revert" ? "square" : "circle"),
      size: isHead ? 10 : 7,
      children: [],
      parents: commit.parents || [],
    });
  });

  // 3. Process Stashes
  stashes.forEach((stash, index) => {
    // stash format is usually "stash@{0}: On master: some message"
    const parts = stash.split(':');
    const id = parts[0].trim(); // "stash@{0}"
    
    // Find where this stash belongs (usually relative to current branch or a commit)
    // For simplicity in visualization, we'll place them in a special lane or near HEAD
    const stashLane = Math.max(...Array.from(commitToLane.values()), 0) + 1;
    
    nodes.push({
      id,
      commit: {
        hash: id,
        shortHash: id,
        message: stash,
        shortMessage: parts.slice(2).join(':').trim() || parts[1]?.trim() || stash,
        author: { name: 'Stash', email: '' },
        timestamp: Date.now(),
        parents: headCommitHash ? [headCommitHash] : [],
        type: 'other',
        isMerge: false,
        isSquash: false,
        parentsDetails: [],
        shortMessageEmoji: '📦'
      } as any,
      x: (stashLane + 1) * laneWidth,
      y: commitHeight * (index + 1), // At the top
      lane: stashLane,
      color: '#cbd5e1', // Slate color for stashes
      shape: 'square' as any,
      size: 6,
      children: [],
      parents: headCommitHash ? [headCommitHash] : [],
    });

    if (headCommitHash) {
        edges.push({
            id: `stash-${id}`,
            source: headCommitHash,
            target: id,
            color: '#cbd5e1',
            type: 'normal',
            points: []
        });
    }
  });

  // 4. Create Edges
  const nodeMap = new Map<string, GraphNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  nodes.forEach(node => {
    node.parents.forEach((parentHash, pIndex) => {
      const parentNode = nodeMap.get(parentHash);
      if (parentNode) {
        // Edge follows the color of the branch line
        const color = pIndex === 0 ? node.color : (parentNode.color || node.color);
        
        edges.push({
          id: `${parentHash}-${node.id}`,
          source: parentHash,
          target: node.id,
          color,
          type: pIndex > 0 ? "merge" : "normal",
          points: [
            { x: parentNode.x, y: parentNode.y },
            { x: node.x, y: node.y },
          ],
        });
        parentNode.children.push(node.id);
      }
    });
  });

  const maxX = Math.max(...nodes.map(n => n.x), 0) + laneWidth * 2;
  const maxY = Math.max(...nodes.map(n => n.y), 0) + commitHeight;

  return {
    nodes,
    edges,
    laneSegments: [],
    width: maxX,
    height: maxY,
    bounds: { minX: 0, maxX, minY: 0, maxY },
  };
};
