import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { VisualizationData } from "@shared/types";

interface GraphMiniMapProps {
  data: VisualizationData;
  mainZoom: d3.ZoomBehavior<SVGSVGElement, unknown> | null;
  mainSvgRef: React.RefObject<SVGSVGElement | null>;
  selectedCommitHash?: string;
}

export const GraphMiniMap: React.FC<GraphMiniMapProps> = ({
  data,
  mainZoom,
  mainSvgRef,
  selectedCommitHash,
}) => {
  const miniSvgRef = useRef<SVGSVGElement | null>(null);
  const brushRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    if (!miniSvgRef.current || !data.nodes.length) return;

    const miniSvg = d3.select(miniSvgRef.current);
    miniSvg.selectAll("*").remove();

    const width = 150;
    const height = 200;
    
    // Scaling factors
    const scaleX = width / (data.width || 1);
    const scaleY = height / (data.height || 1);
    const scale = Math.min(scaleX, scaleY) * 0.9;

    const g = miniSvg.append("g")
        .attr("transform", `translate(5, 5) scale(${scale})`);

    // Simplified tracks
    g.selectAll(".lane-track")
      .data(data.laneSegments)
      .enter()
      .append("line")
      .attr("x1", d => d.x)
      .attr("y1", d => d.startY)
      .attr("x2", d => d.x)
      .attr("y2", d => d.endY)
      .attr("stroke", d => d.color)
      .attr("stroke-width", 2)
      .attr("opacity", 0.2);

    // Simplified nodes (just dots)
    g.selectAll("circle")
      .data(data.nodes)
      .enter()
      .append("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 3)
      .attr("fill", d => d.color)
      .attr("stroke", d => d.id === selectedCommitHash ? "white" : "none")
      .attr("stroke-width", 1);

    // Viewport Brush
    const brush = d3.brush()
      .extent([[0, 0], [width, height]])
      .on("brush end", (event) => {
        if (!event.sourceEvent || !mainZoom || !mainSvgRef.current) return;
        
        const selection = event.selection;
        if (!selection) return;

        // Map brush selection back to main graph coordinates
        const [[x0, y0]] = selection;
        
        const mainSvg = d3.select(mainSvgRef.current);
        const mainWidth = mainSvgRef.current.clientWidth;
        const mainHeight = mainSvgRef.current.clientHeight;

        const targetX = -((x0 - 5) / scale);
        const targetY = -((y0 - 5) / scale);

        // We don't want to infinite loop, so we only apply if it's a manual brush move
        if (event.sourceEvent.type === "mousemove" || event.sourceEvent.type === "mousedown" || event.sourceEvent.type === "touchstart") {
             const currentTransform = d3.zoomTransform(mainSvgRef.current);
             mainSvg.call(mainZoom.transform, d3.zoomIdentity.translate(-x0/scale * currentTransform.k + mainWidth/2, -y0/scale * currentTransform.k + mainHeight/2).scale(currentTransform.k));
        }
      });

    const gBrush = miniSvg.append("g")
      .attr("class", "brush")
      .call(brush);

    // Update brush position when main zoom changes
    const updateBrush = (transform: d3.ZoomTransform) => {
        const mainSvg = mainSvgRef.current;
        if (!mainSvg) return;
        
        const w = mainSvg.clientWidth;
        const h = mainSvg.clientHeight;

        // Calculate visible area in main graph coordinates
        const x0 = -transform.x / transform.k;
        const y0 = -transform.y / transform.k;
        const x1 = x0 + w / transform.k;
        const y1 = y0 + h / transform.k;

        // Map to mini-map coordinates
        const bx0 = Math.max(0, x0 * scale + 5);
        const by0 = Math.max(0, y0 * scale + 5);
        const bx1 = Math.min(width, x1 * scale + 5);
        const by1 = Math.min(height, y1 * scale + 5);

        gBrush.select(".selection")
            .attr("x", bx0)
            .attr("y", by0)
            .attr("width", Math.max(0, bx1 - bx0))
            .attr("height", Math.max(0, by1 - by0))
            .attr("fill", "#3b82f6")
            .attr("fill-opacity", 0.1)
            .attr("stroke", "#3b82f6")
            .attr("stroke-width", 1);
    };

    // Initial brush update
    if (mainSvgRef.current) {
        updateBrush(d3.zoomTransform(mainSvgRef.current));
    }

    // Listen for zoom events on main SVG
    const mainSvg = d3.select(mainSvgRef.current);
    mainSvg.on("zoom.minimap", (event) => {
        updateBrush(event.transform);
    });

    return () => {
        if (mainSvgRef.current) d3.select(mainSvgRef.current).on("zoom.minimap", null);
    };

  }, [data, selectedCommitHash, mainZoom, mainSvgRef]);

  return (
    <div className="bg-zed-surface/80 dark:bg-zed-dark-surface/80 backdrop-blur-md p-1 rounded-md border border-zed-border dark:border-zed-dark-border shadow-2xl pointer-events-auto">
      <svg ref={miniSvgRef} width={160} height={210} className="rounded"></svg>
    </div>
  );
};
