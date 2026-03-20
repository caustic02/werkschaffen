'use client';

import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { NODES, EDGES, FIELDS, type GraphNode, type GraphEdge } from '@/lib/graph-data';

type SimNode = GraphNode & d3.SimulationNodeDatum;
interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  strength: number;
}

function getNodeSize(d: SimNode): number {
  if (d.bridge) return 18;
  if (d.de) return 16;
  return 14;
}

function getNodeWeight(d: SimNode): number {
  if (d.bridge) return 700;
  if (d.id === 'schaffen' || d.id === 'werk') return 700;
  return 400;
}

function getNodeFill(d: SimNode): string {
  if (d.bridge) return '#DDD9D1';
  if (d.de) return '#D4500A';
  return '#B8B3A9';
}

interface GraphProps {
  onNodeClick: (node: GraphNode) => void;
  onBackgroundClick: () => void;
}

export default function Graph({ onNodeClick, onBackgroundClick }: GraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const callbacksRef = useRef({ onNodeClick, onBackgroundClick });

  useEffect(() => {
    callbacksRef.current = { onNodeClick, onBackgroundClick };
  });

  useEffect(() => {
    const svgEl = svgRef.current;
    const containerEl = containerRef.current;
    if (!svgEl || !containerEl) return;

    const svg = d3.select(svgEl);
    let currentSim: d3.Simulation<SimNode, SimLink> | null = null;

    function buildGraph() {
      if (currentSim) currentSim.stop();
      svg.selectAll('*').remove();

      const { width: W, height: H } = containerEl!.getBoundingClientRect();
      const cx = W / 2;
      const cy = H / 2;
      svg.attr('viewBox', `0 0 ${W} ${H}`);

      const nodes: SimNode[] = NODES.map(n => ({ ...n }));
      const edges: SimLink[] = EDGES.map(e => ({ ...e } as SimLink));

      const g = svg.append('g');

      // Links
      const linkEls = g.append('g')
        .selectAll('line')
        .data(edges)
        .join('line')
        .attr('stroke', '#5A5550')
        .attr('stroke-width', (d: SimLink) => d.strength > 0.6 ? 1 : 0.5)
        .attr('opacity', (d: SimLink) => d.strength > 0.6 ? 0.25 : 0.12);

      // Node groups
      const nodeEls = g.append('g')
        .selectAll<SVGGElement, SimNode>('g')
        .data(nodes)
        .join('g')
        .attr('class', 'graph-node');

      // Field-colored dot
      nodeEls.append('circle')
        .attr('r', (d: SimNode) => d.bridge ? 4 : 3)
        .attr('fill', (d: SimNode) => FIELDS[d.fields[0]].color)
        .attr('opacity', 0.3);

      // Label
      nodeEls.append('text')
        .attr('class', 'graph-label')
        .text((d: SimNode) => d.label)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('dy', (d: SimNode) => d.bridge ? -12 : -10)
        .attr('font-size', (d: SimNode) => getNodeSize(d))
        .attr('font-weight', (d: SimNode) => getNodeWeight(d))
        .attr('fill', (d: SimNode) => getNodeFill(d))
        .attr('font-style', (d: SimNode) => d.de ? 'italic' : 'normal');

      // Simulation
      const fieldXOffsets: Record<string, number> = {
        epistemic: -0.25, apparatus: -0.15, agency: 0.2, making: 0.1,
        spatial: -0.1, encounter: 0.25, temporal: 0.15,
      };
      const fieldYOffsets: Record<string, number> = {
        epistemic: -0.2, apparatus: -0.1, agency: -0.05, making: 0.15,
        spatial: 0.05, encounter: 0.1, temporal: 0.25,
      };

      const sim = d3.forceSimulation<SimNode>(nodes)
        .force('link', d3.forceLink<SimNode, SimLink>(edges)
          .id(d => d.id)
          .distance(d => d.strength > 0.6 ? 70 : 110)
          .strength(d => d.strength * 0.3))
        .force('charge', d3.forceManyBody().strength(-180))
        .force('center', d3.forceCenter(cx, cy))
        .force('collision', d3.forceCollide<SimNode>().radius(d => d.bridge ? 40 : 30))
        .force('x', d3.forceX<SimNode>(cx).strength(0.03))
        .force('y', d3.forceY<SimNode>(cy).strength(0.03))
        .force('fieldX', d3.forceX<SimNode>(d => {
          return cx + (fieldXOffsets[d.fields[0]] || 0) * W * 0.3;
        }).strength(0.015))
        .force('fieldY', d3.forceY<SimNode>(d => {
          return cy + (fieldYOffsets[d.fields[0]] || 0) * H * 0.3;
        }).strength(0.015));

      currentSim = sim;

      // Drag behavior
      let isDragging = false;
      const ISO_START = 120, ISO_FULL = 220;

      nodeEls.call(d3.drag<SVGGElement, SimNode>()
        .on('start', function (ev, d) {
          if (!ev.active) sim.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
          isDragging = true;
        })
        .on('drag', function (ev, d) {
          d.fx = ev.x;
          d.fy = ev.y;

          const dist = Math.sqrt((d.fx! - cx) ** 2 + (d.fy! - cy) ** 2);
          const t = Math.min(1, Math.max(0, (dist - ISO_START) / (ISO_FULL - ISO_START)));
          const base = getNodeSize(d);
          const grow = base + base * 0.3 * t;
          const rest = getNodeFill(d);

          // Grow + tint dragged label
          d3.select(this).select('.graph-label')
            .attr('font-size', grow)
            .attr('fill', t > 0.05 ? d3.interpolateRgb(rest, '#D4500A')(t) : rest);

          // Highlight connected edges
          linkEls
            .attr('stroke', function (l: SimLink) {
              const s = l.source as SimNode, tgt = l.target as SimNode;
              return (s.id === d.id || tgt.id === d.id)
                ? d3.interpolateRgb('#5A5550', '#D4500A')(t) : '#5A5550';
            })
            .attr('opacity', function (l: SimLink) {
              const s = l.source as SimNode, tgt = l.target as SimNode;
              return (s.id === d.id || tgt.id === d.id)
                ? 0.25 + t * 0.5 : Math.max(0.04, 0.2 - t * 0.15);
            })
            .attr('stroke-width', function (l: SimLink) {
              const s = l.source as SimNode, tgt = l.target as SimNode;
              return (s.id === d.id || tgt.id === d.id)
                ? 0.5 + t * 2 : (l.strength > 0.6 ? 1 : 0.5);
            });

          // Dim unconnected nodes
          nodeEls.select('.graph-label')
            .attr('opacity', function (n: SimNode) {
              if (n.id === d.id) return 1;
              const connected = edges.some((e: SimLink) => {
                const s = e.source as SimNode, tgt = e.target as SimNode;
                return (s.id === d.id && tgt.id === n.id) || (tgt.id === d.id && s.id === n.id);
              });
              return connected ? 1 : Math.max(0.15, 1 - t * 0.7);
            });
        })
        .on('end', function (ev, d) {
          if (!ev.active) sim.alphaTarget(0);
          d.fx = null;
          d.fy = null;
          isDragging = false;

          const rest = getNodeFill(d);
          d3.select(this).select('.graph-label')
            .transition().duration(500)
            .attr('font-size', getNodeSize(d))
            .attr('fill', rest);

          nodeEls.select('.graph-label')
            .transition().duration(400)
            .attr('opacity', 1);

          linkEls.transition().duration(500)
            .attr('stroke', '#5A5550')
            .attr('opacity', function (l: SimLink) { return l.strength > 0.6 ? 0.25 : 0.12; })
            .attr('stroke-width', function (l: SimLink) { return l.strength > 0.6 ? 1 : 0.5; });
        })
      );

      // Click to open panel
      nodeEls.on('click', function (ev: MouseEvent, d: SimNode) {
        if (isDragging) return;
        ev.stopPropagation();
        callbacksRef.current.onNodeClick(d);
      });

      // Click background to close panel
      svg.on('click', function () {
        callbacksRef.current.onBackgroundClick();
      });

      // Tick
      sim.on('tick', () => {
        linkEls
          .attr('x1', (d: SimLink) => (d.source as SimNode).x!)
          .attr('y1', (d: SimLink) => (d.source as SimNode).y!)
          .attr('x2', (d: SimLink) => (d.target as SimNode).x!)
          .attr('y2', (d: SimLink) => (d.target as SimNode).y!);
        nodeEls.attr('transform', (d: SimNode) => `translate(${d.x},${d.y})`);
      });
    }

    buildGraph();
    window.addEventListener('resize', buildGraph);

    return () => {
      window.removeEventListener('resize', buildGraph);
      if (currentSim) currentSim.stop();
      svg.selectAll('*').remove();
    };
  }, []);

  return (
    <div ref={containerRef} className="graph-container">
      <svg ref={svgRef} className="graph-svg" />
    </div>
  );
}
