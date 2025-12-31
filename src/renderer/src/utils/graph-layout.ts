import {
  Commit,
  Branch,
  VisualizationData,
  GraphNode,
  GraphEdge,
} from "@shared/types";

/**
 * GitKraken-style layout engine.
 * Uses dynamic lane management to keep the graph compact while ensuring branch continuity.
 */
export const calculateLayout = (
  commits: Commit[],
  branches: Branch[],
  headCommitHash?: string,
  _stashes: string[] = [],
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
  const commitToLane = new Map<string, number>();
  const activeLanes: (string | null)[] = [];

  const laneWidth = 40;
  const commitHeight = 60;

  const isMainBranch = (name?: string) =>
    name === "main" ||
    name === "master" ||
    name === "origin/main" ||
    name === "origin/master";

  const getBranchColor = (branchName?: string) => {
    if (!branchName) return "#7c3aed";
    const branch = branches.find((b) => b.name === branchName);
    return branch ? branch.color : "#7c3aed";
  };

  // 1. Process Commits (Newest to Oldest)
  commits.forEach((commit, yIndex) => {
    let lane = activeLanes.indexOf(commit.hash);

    // Main branches prefer Lane 0
    if (lane === -1 && isMainBranch(commit.branchName)) {
      if (activeLanes[0] === null || activeLanes[0] === undefined) {
        lane = 0;
      }
    }

    if (lane === -1) {
      // Find first empty slot
      lane = 0;
      while (lane < activeLanes.length && activeLanes[lane] !== null) {
        lane++;
      }
      if (lane === activeLanes.length) {
        activeLanes.push(commit.hash);
      } else {
        activeLanes[lane] = commit.hash;
      }
    } else {
      activeLanes[lane] = commit.hash;
    }

    commitToLane.set(commit.hash, lane);

    // Prepare for parents
    const parents = commit.parents || [];
    if (parents.length > 0) {
      const primaryParent = parents[0];

      // Primary parent continues the lane if not already assigned
      if (activeLanes.indexOf(primaryParent) === -1) {
        activeLanes[lane] = primaryParent;
      } else {
        activeLanes[lane] = null; // Lane ends or merges elsewhere
      }

      // Other parents (merges)
      for (let i = 1; i < parents.length; i++) {
        const pHash = parents[i];
        if (activeLanes.indexOf(pHash) === -1) {
          let nextSlot = 0;
          while (
            nextSlot < activeLanes.length &&
            activeLanes[nextSlot] !== null
          ) {
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
      activeLanes[lane] = null;
    }

    const color = getBranchColor(commit.branchName);
    const isHead = commit.hash === headCommitHash;

    nodes.push({
      id: commit.hash,
      commit,
      x: (lane + 1) * laneWidth,
      y: (yIndex + 1) * commitHeight,
      lane,
      color,
      shape: commit.isMerge
        ? "diamond"
        : commit.type === "revert"
          ? "square"
          : "circle",
      size: isHead ? 10 : 7,
      children: [],
      parents: commit.parents || [],
    });
  });

  // 2. Create Edges with node lookups
  const nodeMap = new Map<string, GraphNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  nodes.forEach((node) => {
    node.parents.forEach((parentHash, pIndex) => {
      const parentNode = nodeMap.get(parentHash);
      if (parentNode) {
        edges.push({
          id: `${parentHash}-${node.id}`,
          source: parentHash,
          target: node.id,
          color: pIndex === 0 ? node.color : parentNode.color || node.color,
          type: pIndex > 0 ? "merge" : "normal",
          points: [], // Points calculated by renderer
        });
        parentNode.children.push(node.id);
      }
    });
  });

  const maxX = Math.max(...nodes.map((n) => n.x), 0) + laneWidth * 2;
  const maxY = Math.max(...nodes.map((n) => n.y), 0) + commitHeight;

  return {
    nodes,
    edges,
    laneSegments: [],
    width: maxX,
    height: maxY,
    bounds: { minX: 0, maxX: maxX + 400, minY: 0, maxY },
  };
};

export const prepareTableLayout = (
  commits: Commit[],
  branches: Branch[],
  _headCommitHash?: string,
) => {
  // Simplified version for the table row view, using same lane logic
  const activeLanes: (string | null)[] = [];

  return commits.map((commit) => {
    let lane = activeLanes.indexOf(commit.hash);
    if (lane === -1) {
      lane = activeLanes.indexOf(null);
      if (lane === -1) {
        lane = activeLanes.length;
        activeLanes.push(commit.hash);
      } else {
        activeLanes[lane] = commit.hash;
      }
    } else {
      activeLanes[lane] = commit.hash;
    }

    const lanesAtThisRow = [...activeLanes];

    // Update for parents
    const parents = commit.parents || [];
    if (parents.length > 0) {
      const primaryParent = parents[0];
      if (activeLanes.indexOf(primaryParent) === -1) {
        activeLanes[lane] = primaryParent;
      } else {
        activeLanes[lane] = null;
      }

      for (let i = 1; i < parents.length; i++) {
        const pHash = parents[i];
        if (activeLanes.indexOf(pHash) === -1) {
          const slot = activeLanes.indexOf(null);
          if (slot === -1) activeLanes.push(pHash);
          else activeLanes[slot] = pHash;
        }
      }
    } else {
      activeLanes[lane] = null;
    }

    const branch = branches.find((b) => b.name === commit.branchName);
    return {
      commit,
      lane,
      lanesAtThisRow,
      color: branch ? branch.color : "#7c3aed",
    };
  });
};
