import React, { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import {
  Commit,
  Branch,
  VisualizationData,
  GraphNode,
  GraphEdge,
} from "@shared/types";
import { calculateLayout } from "../utils/graph-layout";

interface CommitGraphProps {
  commits: Commit[];
  branches: Branch[];
  headCommitHash?: string;
  onCommitSelect?: (commit: Commit) => void;
  selectedCommitHash?: string;
}

export const CommitGraph: React.FC<CommitGraphProps> = ({
  commits,
  branches,
  headCommitHash,
  onCommitSelect,
  selectedCommitHash,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [isBranchMenuOpen, setIsBranchMenuOpen] = React.useState(false);
  const [branchSearch, setBranchSearch] = React.useState("");

  const [commitSearch, setCommitSearch] = React.useState("");

  const data: VisualizationData = useMemo(
    () => calculateLayout(commits, branches, headCommitHash),
    [commits, branches, headCommitHash],
  );

  // Filter nodes based on commit search
  const searchedCommitHashes = useMemo(() => {
    if (!commitSearch.trim()) return null;
    const search = commitSearch.toLowerCase();
    return new Set(
      commits
        .filter(
          (c) =>
            c.message.toLowerCase().includes(search) ||
            c.author.name.toLowerCase().includes(search) ||
            c.hash.toLowerCase().includes(search),
        )
        .map((c) => c.hash),
    );
  }, [commits, commitSearch]);

  // Calculate lineage (ancestors and descendants) for highlighting
  const highlightedInfo = useMemo(() => {
    if (!selectedCommitHash && !searchedCommitHashes) return null;

    const nodesMap = new Map(data.nodes.map((n) => [n.id, n]));
    const highlightedNodes = new Set<string>();
    const highlightedEdges = new Set<string>();

    if (selectedCommitHash) {
      highlightedNodes.add(selectedCommitHash);

      // Recursive ancestors
      const findAncestors = (id: string) => {
        const node = nodesMap.get(id);
        if (!node) return;
        node.parents.forEach((parentId) => {
          if (!highlightedNodes.has(parentId)) {
            highlightedNodes.add(parentId);
            findAncestors(parentId);
          }
        });
      };

      // Recursive descendants
      const findDescendants = (id: string) => {
        const node = nodesMap.get(id);
        if (!node) return;
        node.children.forEach((childId) => {
          if (!highlightedNodes.has(childId)) {
            highlightedNodes.add(childId);
            findDescendants(childId);
          }
        });
      };

      findAncestors(selectedCommitHash);
      findDescendants(selectedCommitHash);
    }

    // Add search results to highlighted nodes
    if (searchedCommitHashes) {
      searchedCommitHashes.forEach((h) => highlightedNodes.add(h));
    }

    // Identify edges that connect two highlighted nodes
    data.edges.forEach((edge) => {
      if (
        highlightedNodes.has(edge.source) &&
        highlightedNodes.has(edge.target)
      ) {
        highlightedEdges.add(edge.id);
      }
    });

    return { nodes: highlightedNodes, edges: highlightedEdges };
  }, [selectedCommitHash, searchedCommitHashes, data]);

  const centerOnCommit = (hash: string) => {
    if (!svgRef.current || !zoomRef.current) return;
    const targetNode = data.nodes.find((n) => n.id === hash);
    if (!targetNode) return;

    const svg = d3.select(svgRef.current);
    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;

    const transform = d3.zoomIdentity
      .translate(width / 2 - targetNode.x, height / 2 - targetNode.y)
      .scale(1);

    svg.transition().duration(750).call(zoomRef.current.transform, transform);
  };

  const goToHead = () => {
    if (headCommitHash) centerOnCommit(headCommitHash);
  };

  const filteredBranches = useMemo(() => {
    return branches.filter((b) =>
      b.name.toLowerCase().includes(branchSearch.toLowerCase()),
    );
  }, [branches, branchSearch]);

  const lastRepoPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const svg = d3.select(svgRef.current);

    // Capture current transform before clearing if it exists
    const currentTransform = zoomRef.current
      ? d3.zoomTransform(svg.node()!)
      : null;

    svg.selectAll("*").remove();

    const g = svg.append("g");

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 2])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    // Initial zoom / Restore zoom
    const isNewRepo =
      commits.length > 0 && lastRepoPathRef.current !== commits[0].hash;

    if (currentTransform && !isNewRepo) {
      svg.call(zoom.transform, currentTransform);
    } else if (headCommitHash) {
      centerOnCommit(headCommitHash);
      if (commits.length > 0) lastRepoPathRef.current = commits[0].hash;
    } else {
      svg.call(zoom.transform, d3.zoomIdentity.translate(40, 60).scale(0.8));
    }

    // Draw Lane Tracks (Background lines)
    const lanes = Array.from(new Set(data.nodes.map((n) => n.lane))).sort(
      (a, b) => a - b,
    );
    lanes.forEach((lane) => {
      const laneNodes = data.nodes.filter((n) => n.lane === lane);
      const firstNode = laneNodes[0];
      if (firstNode) {
        g.append("line")
          .attr("x1", firstNode.x)
          .attr("y1", -50)
          .attr("x2", firstNode.x)
          .attr("y2", data.height + 50)
          .attr("stroke", firstNode.color)
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "4,4")
          .attr("opacity", highlightedInfo ? 0.05 : 0.25) // Dim tracks if highlighting
          .lower();
      }
    });

    // Draw Edges (Lines) with Arrowheads
    const lineGenerator = d3
      .line<{ x: number; y: number }>()
      .x((d) => d.x)
      .y((d) => d.y)
      .curve(d3.curveMonotoneY);

    g.selectAll(".edge")
      .data(data.edges)
      .enter()
      .append("path")
      .attr("class", "edge")
      .attr("d", (d) => {
        const sourceNode = data.nodes.find((n) => n.id === d.source);
        const targetNode = data.nodes.find((n) => n.id === d.target);
        if (!sourceNode || !targetNode) return null;

        const points = [
          { x: sourceNode.x, y: sourceNode.y },
          { x: targetNode.x, y: targetNode.y },
        ];

        if (sourceNode.x !== targetNode.x) {
          const midY = (sourceNode.y + targetNode.y) / 2;
          return lineGenerator([
            { x: sourceNode.x, y: sourceNode.y },
            { x: sourceNode.x, y: midY },
            { x: targetNode.x, y: midY },
            { x: targetNode.x, y: targetNode.y },
          ]);
        }
        return lineGenerator(points);
      })
      .attr("fill", "none")
      .attr("stroke", (d) => d.color)
      .attr("stroke-width", (d) => {
        const isHighlighted = highlightedInfo?.edges.has(d.id);
        const sourceNode = data.nodes.find((n) => n.id === d.source);
        const branchName = sourceNode?.commit.branchName;
        const baseWidth =
          branchName === "main" || branchName === "master" ? 3 : 1.5;
        return isHighlighted ? baseWidth + 1 : baseWidth;
      })
      .attr("marker-end", (d) => `url(#arrow-${d.color.replace("#", "")})`)
      .attr("opacity", (d) => {
        if (!highlightedInfo) return 0.8;
        return highlightedInfo.edges.has(d.id) ? 1.0 : 0.15;
      });

    // Draw Branch Labels (Pills next to branch tips)
    const branchLabelsGroup = g.append("g").attr("class", "branch-labels");
    const commitToBranches = new Map<string, Branch[]>();
    branches.forEach((b) => {
      const list = commitToBranches.get(b.objectName) || [];
      list.push(b);
      commitToBranches.set(b.objectName, list);
    });

    data.nodes.forEach((node) => {
      const nodeBranches = commitToBranches.get(node.id);
      if (nodeBranches && nodeBranches.length > 0) {
        let offset = 20;
        nodeBranches.forEach((branch) => {
          const labelText = branch.name;
          const labelWidth = labelText.length * 6 + 12;

          const labelG = branchLabelsGroup
            .append("g")
            .attr("transform", `translate(${node.x + offset}, ${node.y - 9})`)
            .attr(
              "opacity",
              highlightedInfo && !highlightedInfo.nodes.has(node.id)
                ? 0.3
                : 1.0,
            );

          labelG
            .append("rect")
            .attr("width", labelWidth)
            .attr("height", 18)
            .attr("rx", 4)
            .attr("fill", branch.color)
            .attr("stroke", "white")
            .attr("stroke-width", 0.5)
            .attr("opacity", 0.9);

          labelG
            .append("text")
            .attr("x", labelWidth / 2)
            .attr("y", 9)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .style("font-size", "9px")
            .style("font-weight", "bold")
            .style("font-family", "monospace")
            .style("pointer-events", "none")
            .text(labelText);

          offset += labelWidth + 5;
        });
      }
    });

    // Draw Nodes
    const nodeGroups = g
      .selectAll(".node")
      .data(data.nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
      .style("cursor", "pointer")
      .attr("opacity", (d) => {
        if (!highlightedInfo) return 1.0;
        return highlightedInfo.nodes.has(d.id) ? 1.0 : 0.2;
      })
      .on("click", (event, d) => {
        onCommitSelect?.(d.commit);
      });

    // Node shape
    nodeGroups.each(function (d) {
      const group = d3.select(this);
      const isSelected = d.id === selectedCommitHash;
      const isHead = d.id === headCommitHash;

      // Anchor line
      group
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", -15)
        .attr("y2", 0)
        .attr("stroke", d.color)
        .attr("stroke-width", 1)
        .attr("opacity", isSelected ? 0.8 : 0.3);

      if (d.shape === "diamond") {
        group
          .append("rect")
          .attr("width", d.size * 1.5)
          .attr("height", d.size * 1.5)
          .attr("x", -d.size * 0.75)
          .attr("y", -d.size * 0.75)
          .attr("transform", "rotate(45)")
          .attr("fill", d.color)
          .attr("stroke", isSelected ? "#fff" : "none")
          .attr("stroke-width", 2);
        
        // Avatar for merges
        if (d.commit.author.avatarUrl) {
            const clipId = `clip-${d.id}`;
            const defs = d3.select(svgRef.current).select("defs");
            
            defs.append("clipPath")
                .attr("id", clipId)
                .append("rect")
                .attr("width", d.size * 1.2)
                .attr("height", d.size * 1.2)
                .attr("x", -d.size * 0.6)
                .attr("y", -d.size * 0.6)
                .attr("transform", "rotate(45)");

            group.append("image")
                .attr("xlink:href", d.commit.author.avatarUrl)
                .attr("width", d.size * 1.8)
                .attr("height", d.size * 1.8)
                .attr("x", -d.size * 0.9)
                .attr("y", -d.size * 0.9)
                .attr("clip-path", `url(#${clipId})`);
        } else {
            const initial = d.commit.author.name.charAt(0).toUpperCase();
            group
              .append("text")
              .attr("dy", "0.35em")
              .attr("text-anchor", "middle")
              .attr("fill", "white")
              .style("font-size", "10px")
              .style("font-weight", "bold")
              .style("pointer-events", "none")
              .text(initial);
        }
      } else {
        group
          .append("circle")
          .attr("r", d.size)
          .attr("fill", d.color)
          .attr("stroke", isSelected ? "#fff" : "none")
          .attr("stroke-width", 2);
      }
    });

    nodeGroups
      .append("title")
      .text(
        (d) =>
          `${d.commit.shortHash} - ${d.commit.author.name}\n${d.commit.shortMessage}`,
      );
  }, [
    data,
    onCommitSelect,
    selectedCommitHash,
    headCommitHash,
    highlightedInfo,
  ]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-zed-bg dark:bg-zed-dark-bg overflow-hidden relative flex flex-col"
    >
      {/* Dashboard Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b border-zed-border dark:border-zed-dark-border bg-zed-surface/50 dark:bg-zed-dark-surface/50 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          {/* Search Bar */}
          <div className="relative group w-64">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-zed-muted dark:text-zed-dark-muted group-focus-within:text-zed-accent">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search messages, authors, hashes..."
              value={commitSearch}
              onChange={(e) => setCommitSearch(e.target.value)}
              className="w-full bg-zed-element dark:bg-zed-dark-element border border-zed-border dark:border-zed-dark-border rounded-md pl-8 pr-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-zed-accent focus:border-zed-accent text-zed-text dark:text-zed-dark-text placeholder-zed-muted/60 dark:placeholder-zed-dark-muted/60 transition-all"
            />
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 text-zed-muted dark:text-zed-dark-muted">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider font-bold opacity-60">
                Commits
              </span>
              <span className="text-xs font-mono text-zed-text dark:text-zed-dark-text">
                {commits.length}
              </span>
            </div>
            <div className="w-px h-6 bg-zed-border dark:bg-zed-dark-border"></div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider font-bold opacity-60">
                Branches
              </span>
              <span className="text-xs font-mono text-zed-text dark:text-zed-dark-text">
                {branches.length}
              </span>
            </div>
          </div>
        </div>

        {/* Active Contributors */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider font-bold text-zed-muted opacity-60 mr-2">
            Contributors
          </span>
          <div className="flex -space-x-2">
            {Array.from(new Set(commits.map((c) => c.author.email)))
              .slice(0, 5)
              .map((email) => {
                const commit = commits.find((c) => c.author.email === email);
                const name = commit?.author.name || "Unknown";
                const avatarUrl = commit?.author.avatarUrl;

                return (
                  <div
                    key={email}
                    className="w-7 h-7 rounded-full border-2 border-zed-bg dark:border-zed-dark-bg bg-zed-element dark:bg-zed-dark-element flex items-center justify-center overflow-hidden shadow-sm group relative"
                    title={name}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] font-bold text-zed-text dark:text-zed-dark-text">
                        {name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                );
              })}
            {new Set(commits.map((c) => c.author.email)).size > 5 && (
              <div className="w-7 h-7 rounded-full border-2 border-zed-bg dark:border-zed-dark-bg bg-zed-element dark:bg-zed-dark-element flex items-center justify-center text-[8px] font-bold text-zed-muted shadow-sm">
                +{new Set(commits.map((c) => c.author.email)).size - 5}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <svg ref={svgRef} className="w-full h-full">
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
              <feOffset dx="0" dy="1" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>

        {/* Legend / Branch Dropdown */}
        <div className="absolute top-4 right-4 flex flex-col items-end pointer-events-none">
          <div className="flex flex-col items-end gap-2 pointer-events-auto">
            <button
              onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
              className={`flex items-center gap-2 bg-zed-surface/90 dark:bg-zed-dark-surface/90 backdrop-blur-md px-3 py-1.5 rounded-md border shadow-lg transition-all ${isBranchMenuOpen ? "border-zed-accent" : "border-zed-border dark:border-zed-dark-border"}`}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-zed-accent animate-pulse"></div>
              <span className="text-xs font-semibold text-zed-text dark:text-zed-dark-text">
                Branches
              </span>
              <svg
                className={`w-3.5 h-3.5 text-zed-muted dark:text-zed-dark-muted transition-transform ${isBranchMenuOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isBranchMenuOpen && (
              <div className="bg-zed-surface/95 dark:bg-zed-dark-surface/95 backdrop-blur-xl p-2 rounded-lg border border-zed-border dark:border-zed-dark-border shadow-2xl flex flex-col gap-2 w-56 animate-slide-in">
                <div className="px-1">
                  <input
                    type="text"
                    placeholder="Search branches..."
                    value={branchSearch}
                    onChange={(e) => setBranchSearch(e.target.value)}
                    className="w-full bg-zed-element dark:bg-zed-dark-element border border-zed-border dark:border-zed-dark-border rounded px-2 py-1 text-[11px] focus:outline-none focus:border-zed-accent text-zed-text dark:text-zed-dark-text placeholder-zed-muted dark:placeholder-zed-dark-muted"
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto custom-scrollbar flex flex-col max-h-80">
                  {filteredBranches.map((branch) => (
                    <button
                      key={branch.name}
                      onClick={() => {
                        centerOnCommit(branch.objectName);
                        setIsBranchMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-zed-element dark:hover:bg-zed-dark-element rounded transition-colors text-left group"
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: branch.color }}
                      ></div>
                      <span
                        className="text-[11px] font-mono truncate text-zed-text dark:text-zed-dark-text group-hover:text-zed-accent"
                        title={branch.name}
                      >
                        {branch.name}
                      </span>
                    </button>
                  ))}
                  {filteredBranches.length === 0 && (
                    <div className="text-[10px] text-zed-muted dark:text-zed-dark-muted text-center py-4 italic">
                      No branches found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating UI */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-zed-surface/90 dark:bg-zed-dark-surface/90 backdrop-blur-md px-3 py-2 rounded-full shadow-lg border border-zed-border dark:border-zed-dark-border animate-slide-in">
          <button
            onClick={goToHead}
            className="flex items-center gap-2 text-xs font-medium text-zed-text dark:text-zed-dark-text hover:text-zed-accent transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 2 9 18zm0 0v-8"
              />
            </svg>
            Go to HEAD
          </button>

          {selectedCommitHash && (
            <>
              <div className="w-px h-4 bg-zed-border dark:bg-zed-dark-border mx-1"></div>
              <div className="text-[10px] font-mono text-zed-muted dark:text-zed-dark-muted px-1">
                {selectedCommitHash.substring(0, 7)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
