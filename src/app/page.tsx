'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import ContextPanel from '@/components/ContextPanel';
import { NODES, type GraphNode } from '@/lib/graph-data';

const Graph = dynamic(() => import('@/components/Graph'), { ssr: false });

export default function Home() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleNavigate = useCallback((id: string) => {
    const node = NODES.find(n => n.id === id);
    if (node) setSelectedNode(node);
  }, []);

  return (
    <>
      <div className="ws-mark">werkschaffen</div>
      <Graph onNodeClick={handleNodeClick} onBackgroundClick={handleClose} />
      <ContextPanel
        node={selectedNode}
        isOpen={!!selectedNode}
        onClose={handleClose}
        onNavigate={handleNavigate}
      />
    </>
  );
}
