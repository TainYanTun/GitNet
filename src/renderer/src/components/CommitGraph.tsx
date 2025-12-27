import React, { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import { Commit, Branch, VisualizationData, GraphNode, GraphEdge } from "@shared/types";
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

  const data: VisualizationData = useMemo(
    () => calculateLayout(commits, branches, headCommitHash),
    [commits, branches, headCommitHash]
  );

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;

    const g = svg.append("g");

    // Define Arrowheads
    const defs = svg.append("defs");
    
    // Create markers for each branch color found in data
    const uniqueColors = Array.from(new Set(data.nodes.map(n => n.color)));
    uniqueColors.forEach(color => {
      defs.append("marker")
        .attr("id", `arrow-${color.replace("#", "")}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 20) // Position arrowhead relative to node
        .attr("refY", 0)
        .attr("markerWidth", 4)
        .attr("markerHeight", 4)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", color);
    });

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 2])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Initial zoom
    svg.call(zoom.transform, d3.zoomIdentity.translate(40, 60).scale(0.8));

    // Draw Lane Tracks (Background lines)
    const lanes = Array.from(new Set(data.nodes.map(n => n.lane))).sort((a, b) => a - b);
    lanes.forEach(lane => {
        const laneNodes = data.nodes.filter(n => n.lane === lane);
        const firstNode = laneNodes[0];
        if (firstNode) {
            // Full height track
            g.append("line")
                .attr("x1", firstNode.x)
                .attr("y1", -50)
                .attr("x2", firstNode.x)
                .attr("y2", data.height + 50)
                .attr("stroke", firstNode.color)
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "4,4")
                .attr("opacity", 0.25)
                .lower(); // Ensure it's in the background
        }
    });

    // Draw Edges (Lines) with Arrowheads
    const lineGenerator = d3.line<{ x: number; y: number }>()
      .x(d => d.x)
      .y(d => d.y)
      .curve(d3.curveMonotoneY);

    g.selectAll(".edge")
      .data(data.edges)
      .enter()
      .append("path")
      .attr("class", "edge")
      .attr("d", d => {
        const sourceNode = data.nodes.find(n => n.id === d.source);
        const targetNode = data.nodes.find(n => n.id === d.target);
        if (!sourceNode || !targetNode) return null;

        // In Git visualizers, arrow usually points to the parent (past)
        // targetNode is the CHILD (later), sourceNode is the PARENT (earlier)
        // But in our edges: source = parent, target = child.
        // So we draw from child (target) to parent (source) to have arrow point to parent.
        const points = [
          { x: targetNode.x, y: targetNode.y },
          { x: sourceNode.x, y: sourceNode.y }
        ];

        if (sourceNode.x !== targetNode.x) {
             const midY = (sourceNode.y + targetNode.y) / 2;
             return lineGenerator([
                 { x: targetNode.x, y: targetNode.y },
                 { x: targetNode.x, y: midY },
                 { x: sourceNode.x, y: midY },
                 { x: sourceNode.x, y: sourceNode.y }
             ]);
        }
        return lineGenerator(points);
      })
      .attr("fill", "none")
      .attr("stroke", d => d.color)
      .attr("stroke-width", d => {
          // Visual representation: main branch is thicker
          const sourceNode = data.nodes.find(n => n.id === d.source);
          const branchName = sourceNode?.commit.branchName;
          return (branchName === "main" || branchName === "master") ? 3 : 1.5;
      })
      .attr("stroke-dasharray", d => {
          // Optional: feature branches could be dashed? 
          // But user asked for clear main/feat distinction.
          // Let's stick to thickness for now as it's more standard.
          return "none";
      })
      .attr("marker-end", d => `url(#arrow-${d.color.replace("#", "")})`)
      .attr("opacity", 0.8);

    // Lane Headers (Visual representation of branch at the top)
    lanes.forEach(lane => {
        const firstNode = data.nodes.find(n => n.lane === lane);
        if (firstNode) {
            g.append("text")
                .attr("x", firstNode.x)
                .attr("y", -15) 
                .attr("text-anchor", "start")
                .attr("transform", `rotate(-30, ${firstNode.x}, -15)`)
                .attr("fill", firstNode.color)
                .style("font-size", "12px")
                .style("font-weight", "bold")
                .style("font-family", "monospace")
                .text((firstNode.commit.branchName || "main").toUpperCase());
        }
    });

    // Draw Nodes
    const nodeGroups = g.selectAll(".node")
      .data(data.nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x}, ${d.y})`)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        onCommitSelect?.(d.commit);
      });

    // Node shape
    nodeGroups.each(function(d) {
      const group = d3.select(this);
      const isSelected = d.id === selectedCommitHash;
      const isHead = d.id === headCommitHash;

      // Add a subtle horizontal indicator line connecting node to its lane label context
      group.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", -15)
        .attr("y2", 0)
        .attr("stroke", d.color)
        .attr("stroke-width", 1)
        .attr("opacity", 0.5);

      if (d.shape === "diamond") {
        group.append("rect")
          .attr("width", d.size * 1.5)
          .attr("height", d.size * 1.5)
          .attr("x", -d.size * 0.75)
          .attr("y", -d.size * 0.75)
          .attr("transform", "rotate(45)")
          .attr("fill", d.color)
          .attr("stroke", isSelected ? "#fff" : "none")
          .attr("stroke-width", 2);
      } else {
        group.append("circle")
          .attr("r", d.size)
          .attr("fill", d.color)
          .attr("stroke", isSelected ? "#fff" : "none")
          .attr("stroke-width", 2);
      }

      // HEAD indicator ring
      if (isHead) {
        group.append("circle")
          .attr("r", d.size + 4)
          .attr("fill", "none")
          .attr("stroke", d.color)
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "2,2");
      }

      // Initial letter placeholder (ONLY FOR MERGES)
      if (d.commit.isMerge) {
        const initial = d.commit.author.name.charAt(0).toUpperCase();
        group.append("text")
          .attr("dy", "0.35em")
          .attr("text-anchor", "middle")
          .attr("fill", "white")
          .style("font-size", "10px")
          .style("font-weight", "bold")
          .style("pointer-events", "none")
          .text(initial);
      }
    });

    // Tooltip behavior (simple title for now)
    nodeGroups.append("title")
      .text(d => `${d.commit.shortHash} - ${d.commit.author.name}\n${d.commit.shortMessage}`);

  }, [data, onCommitSelect, selectedCommitHash, headCommitHash]);

  return (
    <div ref={containerRef} className="w-full h-full bg-zed-bg dark:bg-zed-dark-bg overflow-hidden relative">
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
      
      {/* Legend / Branch Headers overlay could go here */}
      <div className="absolute top-4 right-4 flex flex-wrap justify-end gap-2 max-w-[50%] pointer-events-none">
          {data.nodes.filter((n, i, self) => self.findIndex(t => t.lane === n.lane) === i).map(node => (
              <div key={node.lane} className="flex items-center gap-2 bg-zed-surface/80 dark:bg-zed-dark-surface/80 backdrop-blur-sm px-2 py-1 rounded shadow-sm border border-zed-border dark:border-zed-dark-border">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: node.color }}></div>
                  <span className="text-[10px] font-mono whitespace-nowrap">{node.commit.branchName || 'main'}</span>
              </div>
          ))}
      </div>
    </div>
  );
};
