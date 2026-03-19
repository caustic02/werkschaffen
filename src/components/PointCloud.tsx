"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  CLOUD_NODES,
  CLOUD_LINKS,
  type CloudNode,
} from "@/lib/cloud-data";

const ISO_START = 200;
const ISO_FULL = 300;
const FADE_RATE = 0.06;

interface SimNode extends CloudNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx: number | null;
  fy: number | null;
  targetOpacity: number;
  currentOpacity: number;
}

interface SimLink {
  source: SimNode;
  target: SimNode;
}

export default function PointCloud() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<ReturnType<typeof import("d3").forceSimulation> | null>(null);
  const nodesRef = useRef<SimNode[]>([]);
  const linksRef = useRef<SimLink[]>([]);
  const dragRef = useRef<{
    node: SimNode | null;
    startX: number;
    startY: number;
    active: boolean;
  }>({ node: null, startX: 0, startY: 0, active: false });
  const animRef = useRef<number>(0);

  const [banner, setBanner] = useState<{
    visible: boolean;
    label: string;
    desc: string;
    x: number;
    y: number;
  }>({ visible: false, label: "", desc: "", x: 0, y: 0 });

  const getNodes = useCallback((): CloudNode[] => {
    if (typeof window === "undefined") return CLOUD_NODES;
    try {
      const stored = localStorage.getItem("ws13_c");
      if (stored) return JSON.parse(stored);
    } catch {
      /* ignore */
    }
    return CLOUD_NODES;
  }, []);

  const getLinks = useCallback(() => {
    if (typeof window === "undefined") return CLOUD_LINKS;
    try {
      const stored = localStorage.getItem("ws13_l");
      if (stored) return JSON.parse(stored);
    } catch {
      /* ignore */
    }
    return CLOUD_LINKS;
  }, []);

  useEffect(() => {
    let destroyed = false;

    async function init() {
      const d3 = await import("d3");
      if (destroyed) return;

      const svg = svgRef.current;
      const container = containerRef.current;
      if (!svg || !container) return;

      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      const nodeData = getNodes();
      const linkData = getLinks();

      const nodes: SimNode[] = nodeData.map((n) => ({
        ...n,
        x: w / 2 + (Math.random() - 0.5) * w * 0.6,
        y: h / 2 + (Math.random() - 0.5) * h * 0.6,
        vx: 0,
        vy: 0,
        fx: null,
        fy: null,
        targetOpacity: 1,
        currentOpacity: 1,
      }));

      const nodeMap = new Map(nodes.map((n) => [n.id, n]));
      const links: SimLink[] = linkData
        .map((l: { source: string; target: string }) => ({
          source: nodeMap.get(l.source)!,
          target: nodeMap.get(l.target)!,
        }))
        .filter((l: SimLink) => l.source && l.target);

      nodesRef.current = nodes;
      linksRef.current = links;

      const simulation = d3
        .forceSimulation(nodes as d3.SimulationNodeDatum[])
        .force(
          "link",
          d3
            .forceLink(links as d3.SimulationLinkDatum<d3.SimulationNodeDatum>[])
            .distance(120)
            .strength(0.3)
        )
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(w / 2, h / 2))
        .force("collision", d3.forceCollide().radius(40))
        .alphaDecay(0.02);

      simRef.current = simulation as ReturnType<typeof d3.forceSimulation>;

      function render() {
        if (destroyed) return;
        if (!svg) return;

        // Update opacity with sluggish fade
        for (const node of nodes) {
          node.currentOpacity +=
            (node.targetOpacity - node.currentOpacity) * FADE_RATE;
        }

        // Clear and redraw
        while (svg.firstChild) svg.removeChild(svg.firstChild);

        // Links
        for (const link of links) {
          const line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          line.setAttribute("x1", String(link.source.x));
          line.setAttribute("y1", String(link.source.y));
          line.setAttribute("x2", String(link.target.x));
          line.setAttribute("y2", String(link.target.y));
          line.setAttribute("class", "ws-cloud-link");
          const linkOpacity =
            Math.min(link.source.currentOpacity, link.target.currentOpacity) *
            0.35;
          line.setAttribute("stroke-opacity", String(linkOpacity));
          svg.appendChild(line);
        }

        // Nodes (text only, no circles)
        for (const node of nodes) {
          const text = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
          );
          text.setAttribute("x", String(node.x));
          text.setAttribute("y", String(node.y));
          text.setAttribute("text-anchor", "middle");
          text.setAttribute("dominant-baseline", "central");
          text.setAttribute("class", "ws-cloud-node");
          text.setAttribute("font-size", `${node.fontSize}px`);
          text.setAttribute("font-weight", String(node.fontWeight));
          text.setAttribute("opacity", String(node.currentOpacity));
          text.setAttribute("data-id", node.id);
          text.textContent = node.label;
          svg.appendChild(text);
        }

        animRef.current = requestAnimationFrame(render);
      }

      simulation.on("tick", () => {});
      render();

      // Drag handling via pointer events on SVG
      function findNode(x: number, y: number): SimNode | null {
        for (let i = nodes.length - 1; i >= 0; i--) {
          const n = nodes[i];
          const dx = x - n.x;
          const dy = y - n.y;
          const hitRadius = n.fontSize * n.label.length * 0.3;
          if (Math.abs(dx) < hitRadius && Math.abs(dy) < n.fontSize) {
            return n;
          }
        }
        return null;
      }

      function onPointerDown(e: PointerEvent) {
        const svgRect = svg!.getBoundingClientRect();
        const px = e.clientX - svgRect.left;
        const py = e.clientY - svgRect.top;
        const hit = findNode(px, py);
        if (!hit) return;

        dragRef.current = {
          node: hit,
          startX: hit.x,
          startY: hit.y,
          active: true,
        };
        hit.fx = hit.x;
        hit.fy = hit.y;
        simulation.alphaTarget(0.3).restart();
        svg!.setPointerCapture(e.pointerId);
      }

      function onPointerMove(e: PointerEvent) {
        const drag = dragRef.current;
        if (!drag.active || !drag.node) return;

        const svgRect = svg!.getBoundingClientRect();
        const px = e.clientX - svgRect.left;
        const py = e.clientY - svgRect.top;

        drag.node.fx = px;
        drag.node.fy = py;

        const dx = px - drag.startX;
        const dy = py - drag.startY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > ISO_START) {
          const t = Math.min((dist - ISO_START) / (ISO_FULL - ISO_START), 1);
          for (const n of nodes) {
            n.targetOpacity = n === drag.node ? 1 : 1 - t;
          }

          if (t > 0.3) {
            const containerRect = container!.getBoundingClientRect();
            setBanner({
              visible: true,
              label: drag.node.label,
              desc: drag.node.desc,
              x: Math.min(
                px,
                containerRect.width - 500
              ),
              y: py + drag.node.fontSize + 20,
            });
          }
        } else {
          for (const n of nodes) {
            n.targetOpacity = 1;
          }
          setBanner((b) => ({ ...b, visible: false }));
        }
      }

      function onPointerUp(e: PointerEvent) {
        const drag = dragRef.current;
        if (!drag.active || !drag.node) return;

        drag.node.fx = null;
        drag.node.fy = null;
        drag.active = false;
        drag.node = null;
        simulation.alphaTarget(0);

        for (const n of nodes) {
          n.targetOpacity = 1;
        }
        setBanner((b) => ({ ...b, visible: false }));

        svg!.releasePointerCapture(e.pointerId);
      }

      svg.addEventListener("pointerdown", onPointerDown);
      svg.addEventListener("pointermove", onPointerMove);
      svg.addEventListener("pointerup", onPointerUp);
      svg.addEventListener("pointercancel", onPointerUp);

      // Handle resize
      function onResize() {
        const newRect = container!.getBoundingClientRect();
        const force = simulation.force("center") as d3.ForceCenter<d3.SimulationNodeDatum>;
        if (force) {
          force.x(newRect.width / 2).y(newRect.height / 2);
          simulation.alpha(0.3).restart();
        }
      }

      window.addEventListener("resize", onResize);

      return () => {
        svg.removeEventListener("pointerdown", onPointerDown);
        svg.removeEventListener("pointermove", onPointerMove);
        svg.removeEventListener("pointerup", onPointerUp);
        svg.removeEventListener("pointercancel", onPointerUp);
        window.removeEventListener("resize", onResize);
      };
    }

    init();

    return () => {
      destroyed = true;
      cancelAnimationFrame(animRef.current);
      simRef.current?.stop();
    };
  }, [getNodes, getLinks]);

  return (
    <div ref={containerRef} className="ws-cloud-container">
      <svg ref={svgRef} />
      <div
        ref={bannerRef}
        className={`ws-cloud-banner ${banner.visible ? "visible" : ""}`}
        style={{
          left: `${Math.max(16, banner.x)}px`,
          top: `${banner.y}px`,
        }}
      >
        <div className="ws-cloud-banner-title">{banner.label}</div>
        <p>{banner.desc}</p>
      </div>
    </div>
  );
}
