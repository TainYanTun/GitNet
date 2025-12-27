import { Commit, Branch, VisualizationData, GraphNode, GraphEdge, LaneSegment } from "@shared/types";

export const calculateLayout = (
  commits: Commit[],
  branches: Branch[],
  headCommitHash?: string
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

  // Step 1: Sort commits by timestamp (oldest first)
  const sortedCommits = [...commits].sort((a, b) => a.timestamp - b.timestamp);

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const commitMap = new Map<string, GraphNode>();
  const laneSegments: LaneSegment[] = [];
  
  const laneMap = new Map<string, number>(); // branchName -> lane
  let nextLane = 1;

  const laneWidth = 80;
  const commitHeight = 60;

  // Find branch info helper
  const getBranchInfo = (branchName?: string) => {
    if (!branchName) return { color: "#7c3aed", type: "custom" as const };
    const branch = branches.find((b) => b.name === branchName);
    return {
      color: branch ? branch.color : "#7c3aed",
      type: branch ? branch.type : ("custom" as const),
    };
  };

  // Helper to get or assign a lane (Wide visualization - one lane per branch)
  const getLane = (branchName: string): number => {
    if (laneMap.has(branchName)) {
      return laneMap.get(branchName)!;
    }

    let assignedLane: number;
    if (branchName === "main" || branchName === "master") {
        assignedLane = 0;
    } else {
        assignedLane = nextLane++;
    }

    laneMap.set(branchName, assignedLane);
    return assignedLane;
  };

  // Step 2: Create Nodes
  sortedCommits.forEach((commit, index) => {
    const branchName = commit.branchName || "main";
    const lane = getLane(branchName);
    const { color } = getBranchInfo(branchName);
    const isHead = commit.hash === headCommitHash;

    const node: GraphNode = {
      id: commit.hash,
      commit: { ...commit, branchName },
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

  // Create full-height lane segments for the wide visualization
  laneMap.forEach((lane, branchName) => {
      const { color } = getBranchInfo(branchName);
      const laneNodes = nodes.filter(n => n.lane === lane);
      if (laneNodes.length > 0) {
          const startY = Math.min(...laneNodes.map(n => n.y));
          const endY = Math.max(...laneNodes.map(n => n.y));
          
          laneSegments.push({
              lane,
              x: (lane + 1) * laneWidth,
              startY: startY,
              endY: endY,
              color,
              branchName
          });
      }
  });

  // Step 3: Create Edges
  nodes.forEach((node) => {
    node.parents.forEach((parentHash) => {
      const parentNode = commitMap.get(parentHash);
      if (parentNode) {
        const edgeColor = node.color; 
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
    laneSegments,
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
