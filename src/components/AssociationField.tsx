'use client';

import { useEffect, useState, useRef } from 'react';
import type { AssociationItem } from '@/lib/association-videos';

export type { AssociationItem };

interface CollisionState {
  index: number;
  status: 'loading' | 'done' | 'error';
  fragment?: string;
  keywords?: string[];
}

interface AssociationFieldProps {
  images: AssociationItem[];
  onClose: () => void;
  status?: 'idle' | 'loading' | 'error';
  nodeLabel?: string;
  nodeFields?: string[];
}

interface Position {
  x: number;
  y: number;
}

function computePositions(count: number): Position[] {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const cx = W / 2;
  const cy = H / 2;
  const cols = 5, rows = 4;
  const cellW = W / cols;
  const cellH = H / rows;
  const THUMB_W = 200, THUMB_H = 130;

  const candidates: Position[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const baseX = col * cellW + (cellW - THUMB_W) / 2 + (Math.random() - 0.5) * 60;
      const baseY = row * cellH + (cellH - THUMB_H) / 2 + (Math.random() - 0.5) * 40;

      const x = Math.max(0, Math.min(W - THUMB_W, baseX));
      const y = Math.max(0, Math.min(H - THUMB_H, baseY));

      // Skip center clear zone (300px radius)
      const thumbCx = x + THUMB_W / 2;
      const thumbCy = y + THUMB_H / 2;
      const dist = Math.sqrt((thumbCx - cx) ** 2 + (thumbCy - cy) ** 2);
      if (dist < 300) continue;

      // Skip werkschaffen mark area (top-left 200x60)
      if (x < 200 && y < 60) continue;

      candidates.push({ x, y });
    }
  }

  // Shuffle for random stagger order
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  return candidates.slice(0, count);
}

export default function AssociationField({ images, onClose, status, nodeLabel, nodeFields }: AssociationFieldProps) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [visibleSet, setVisibleSet] = useState<Set<number>>(new Set());
  const [collision, setCollision] = useState<CollisionState | null>(null);
  const onCloseRef = useRef(onClose);
  const collisionRef = useRef(collision);

  useEffect(() => { onCloseRef.current = onClose; });
  useEffect(() => { collisionRef.current = collision; }, [collision]);

  // Compute positions when images arrive
  useEffect(() => {
    if (images.length === 0) return;
    setPositions(computePositions(images.length));
    setVisibleSet(new Set());
    setCollision(null);
  }, [images]);

  // Staggered fade-in
  useEffect(() => {
    if (positions.length === 0) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    positions.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setVisibleSet(prev => new Set(prev).add(i));
      }, i * 40));
    });
    return () => timers.forEach(clearTimeout);
  }, [positions]);

  // Global click + escape handlers
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.association-thumb')) return;
      if ((e.target as SVGElement).closest?.('.graph-node')) return;
      if ((e.target as HTMLElement).closest('.collision-panel')) return;
      // Clicking outside closes collision overlay first, then field
      if (collisionRef.current) {
        setCollision(null);
        return;
      }
      onCloseRef.current();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (collisionRef.current) {
          setCollision(null);
        } else {
          onCloseRef.current();
        }
      }
    };
    // Small delay to avoid capturing drag-end mouseup
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClick);
      document.addEventListener('keydown', handleKey);
    }, 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  function handleThumbClick(e: React.MouseEvent, i: number, item: AssociationItem) {
    e.stopPropagation();

    // Toggle off if already active for this image
    if (collision?.index === i) {
      setCollision(null);
      return;
    }

    if (!nodeLabel || !item.src) return;

    setCollision({ index: i, status: 'loading' });

    fetch('/api/collide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: item.src,
        nodeLabel,
        nodeFields: nodeFields || [],
      }),
    })
      .then(res => { if (!res.ok) throw new Error(`${res.status}`); return res.json(); })
      .then(data => setCollision({
        index: i,
        status: 'done',
        fragment: data.fragment,
        keywords: data.keywords || [],
      }))
      .catch(() => setCollision({ index: i, status: 'error' }));
  }

  return (
    <>
      {/* Status indicator */}
      {status === 'loading' && (
        <div className="discover-status">the tide is coming in...</div>
      )}
      {status === 'error' && (
        <div className="discover-status error">the tide retreated.</div>
      )}

      {/* Results */}
      {images.length > 0 && positions.length > 0 && (
        <div className="association-field">
          {images.slice(0, positions.length).map((item, i) => (
            <div
              key={`${item.url || item.src}-${i}`}
              className={[
                'association-thumb',
                visibleSet.has(i) ? 'visible' : '',
                item.type === 'link' ? 'link-card' : '',
                collision?.index === i ? 'colliding' : '',
              ].filter(Boolean).join(' ')}
              style={{ left: positions[i].x, top: positions[i].y }}
              onClick={(e) => handleThumbClick(e, i, item)}
            >
              {item.type === 'video' ? (
                <video autoPlay muted loop playsInline poster={item.thumb || ''}>
                  <source src={item.src} type="video/mp4" />
                </video>
              ) : item.type === 'link' ? (
                <div className="link-card-inner">
                  <div className="link-card-title">{item.title}</div>
                  {item.snippet && (
                    <div className="link-card-snippet">{item.snippet}</div>
                  )}
                  {item.query && (
                    <div className="link-card-query">{item.query}</div>
                  )}
                </div>
              ) : (
                <img src={item.src} alt={item.alt || ''} loading="lazy" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Layer 2: collision overlay — fixed panel over the grid */}
      {collision && collision.status !== 'loading' && (
        <div
          className="collision-overlay"
          onClick={() => setCollision(null)}
        >
          <div
            className="collision-panel"
            onClick={e => e.stopPropagation()}
          >
            {nodeLabel && (
              <div className="collision-node-label">{nodeLabel}</div>
            )}
            {collision.status === 'done' && (
              <>
                <p className="collision-fragment">{collision.fragment}</p>
                {collision.keywords && collision.keywords.length > 0 && (
                  <div className="collision-keywords">
                    {collision.keywords.map((kw, ki) => (
                      <span key={ki} className="collision-keyword">{kw}</span>
                    ))}
                  </div>
                )}
              </>
            )}
            {collision.status === 'error' && (
              <p className="collision-fragment collision-error-text">—</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
