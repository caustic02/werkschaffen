'use client';

import { NODES, EDGES, FIELDS, type GraphNode } from '@/lib/graph-data';

interface ContextPanelProps {
  node: GraphNode | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

export default function ContextPanel({ node, isOpen, onClose, onNavigate }: ContextPanelProps) {
  if (!node) return null;

  const variants = node.variants || {};
  const variantKeys = Object.keys(variants);

  // All edges involving this node (using original string IDs)
  const connectedEdges = EDGES.filter(e => e.source === node.id || e.target === node.id);
  const connectedNodeIds = [...new Set(connectedEdges.map(e =>
    e.source === node.id ? e.target : e.source
  ))];

  return (
    <div className={`cp-panel${isOpen ? ' open' : ''}`}>
      <button className="cp-close" onClick={onClose}>&times;</button>
      <div className="cp-content">
        {/* Title */}
        <div className="cp-word">{node.label}</div>

        {/* German gloss */}
        {node.de && (
          <div className="cp-german">{node.de}</div>
        )}

        {/* Field badges */}
        <div className="cp-fields">
          {node.fields.map(f => (
            <span
              key={f}
              className="cp-field"
              style={{ color: FIELDS[f].color, borderColor: FIELDS[f].color }}
            >
              {FIELDS[f].label}
            </span>
          ))}
        </div>

        {/* Bridge badge */}
        {node.bridge && (
          <div className="cp-bridge">Bridge node &middot; 3+ fields</div>
        )}

        {/* Content variants or expected variants */}
        {variantKeys.length > 0 ? (
          <div className="cp-section">
            <div className="cp-section-label">Content variants (approach vector)</div>
            {variantKeys.map(k => (
              <div key={k} className="cp-variant">
                <div className="cp-via">{k}</div>
                {variants[k]
                  ? <div className="cp-text">{variants[k]}</div>
                  : <div className="cp-placeholder">[ awaiting content ]</div>
                }
              </div>
            ))}
          </div>
        ) : (
          <div className="cp-section">
            <div className="cp-section-label">Expected variants</div>
            {/* Field-based variants */}
            {node.fields.map(f => (
              <div key={f} className="cp-variant">
                <div className="cp-via">via {FIELDS[f].label}</div>
                <div className="cp-placeholder">[ awaiting content ]</div>
              </div>
            ))}
            {/* Cross-connection variants (up to 4) */}
            {connectedNodeIds.slice(0, 4).map(nid => {
              const n = NODES.find(x => x.id === nid);
              if (!n) return null;
              return (
                <div key={nid} className="cp-variant">
                  <div className="cp-via">via {n.label}</div>
                  <div className="cp-placeholder">[ awaiting content ]</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Connected nodes */}
        <div className="cp-section">
          <div className="cp-section-label">Connected to</div>
          <div className="cp-edges">
            {connectedNodeIds.map(nid => {
              const n = NODES.find(x => x.id === nid);
              if (!n) return null;
              return (
                <div
                  key={nid}
                  className="cp-edge"
                  onClick={() => onNavigate(nid)}
                >
                  {n.label}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
