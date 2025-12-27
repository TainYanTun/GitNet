import { Commit, Branch, VisualizationData, GraphNode, GraphEdge } from "@shared/types";

export const calculateLayout = (
  commits: Commit[],
  branches: Branch[],
  headCommitHash?: string
): VisualizationData => {
  if (commits.length === 0) {
    return {
      nodes: [],
      edges: [],
      width: 0,
      height: 0,
      bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
    };
  }

  // Step 1: Sort commits by timestamp (oldest first)
  const sortedCommits = [...commits].sort((a, b) => a.timestamp - b.timestamp);

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const commitMap = new Map<string, GraphNode>();
  const laneMap = new Map<string, number>(); // branchName -> lane
  const activeLanes: (string | null)[] = []; // index is lane, value is branchName

  const laneWidth = 80;
  const commitHeight = 60;

  // Helper to get or assign a lane for a branch
  const getLane = (branchName: string): number => {
    if (laneMap.has(branchName)) {
      return laneMap.get(branchName)!;
    }

    // Find first empty lane or push new
    let lane = activeLanes.indexOf(null);
    if (lane === -1) {
      lane = activeLanes.length;
      activeLanes.push(branchName);
    } else {
      activeLanes[lane] = branchName;
    }

    laneMap.set(branchName, lane);
    return lane;
  };

  // Find branch info
  const getBranchInfo = (branchName?: string) => {
    if (!branchName) return { color: "#7c3aed", type: "custom" as const };
    const branch = branches.find((b) => b.name === branchName);
    return {
      color: branch ? branch.color : "#7c3aed",
      type: branch ? branch.type : ("custom" as const),
    };
  };

  // Step 2: Create Nodes
  sortedCommits.forEach((commit, index) => {
    const branchName = commit.branchName || "main";
    const lane = getLane(branchName);
    const { color, type: branchType } = getBranchInfo(branchName);
    const isHead = commit.hash === headCommitHash;

    const node: GraphNode = {
      id: commit.hash,
      commit: { ...commit, branchName }, // Ensure branchName is present
      x: (lane + 1) * laneWidth,
      y: (index + 1) * commitHeight,
      lane,
      color,
      shape: commit.isMerge ? "diamond" : "circle",
      size: isHead ? 14 : 10,
      children: [],
      parents: commit.parents || [],
    };

    nodes.push(node);
    commitMap.set(commit.hash, node);
  });

  // Step 3: Create Edges
  nodes.forEach((node) => {
    node.parents.forEach((parentHash) => {
      const parentNode = commitMap.get(parentHash);
      if (parentNode) {
        // Child -> Parent edge (drawing backwards in time from child to parent)
        // Since we want history flowing DOWN, oldest is at TOP.
        // So edges go from parent (top) to child (bottom).
        
        const edgeColor = node.color; // Edge usually takes color of the child branch
        
        const edge: GraphEdge = {
          id: `${parentHash}-${node.id}`,
          source: parentHash,
          target: node.id,
          color: edgeColor,
          type: node.commit.isMerge ? "merge" : "normal",
          points: [
            { x: parentNode.x, y: parentNode.y },
            { x: node.x, y: node.y },
          ],
        };
        edges.push(edge);
        parentNode.children.push(node.id);
      }
    });
  });

  // Calculate bounds
  const maxX = Math.max(...nodes.map((n) => n.x), 0) + laneWidth;
  const maxY = Math.max(...nodes.map((n) => n.y), 0) + commitHeight;

  return {
    nodes,
    edges,
    width: maxX,
    height: maxY,
    bounds: {
      minX: 0,
      maxX,
      minY: 0,
      maxY,
    },
  };
};
