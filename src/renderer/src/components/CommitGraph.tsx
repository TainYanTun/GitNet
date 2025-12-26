import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Commit } from "@shared/types";

interface CommitGraphProps {
  commits: Commit[];
}

export const CommitGraph: React.FC<CommitGraphProps> = ({ commits }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    // Clear previous render
    svg.selectAll("*").remove();

    // Set up dimensions
    const width = svg.node()?.getBoundingClientRect().width || 800;
    const height = svg.node()?.getBoundingClientRect().height || 600;

    // Create a simple visualization
    const nodes = svg
      .selectAll("circle")
      .data(commits)
      .enter()
      .append("circle")
      .attr("cx", (_, i) => 50 + i * 80)
      .attr("cy", height / 2)
      .attr("r", 20)
      .attr("fill", "blue");
  }, [commits]);

  return (
    <div className="w-full h-full">
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};
