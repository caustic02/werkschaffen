'use client';

import { useEffect, useState, useRef } from 'react';
import type { AssociationItem } from '@/lib/association-videos';

export type { AssociationItem };

export interface PathStep {
  type: 'node' | 'image' | 'fragment' | 'seed';
  label?: string;
  url?: string;
  text?: string;
  keywords?: string[];
  fields?: string[];
}

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

      const thumbCx = x + THUMB_W / 2;
      const thumbCy = y + THUMB_H / 2;
      const dist = Math.sqrt((thumbCx - cx) ** 2 + (thumbCy - cy) ** 2);
      if (dist < 300) continue;

      if (x < 200 && y < 60) continue;

      candidates.push({ x, y });
    }
  }

  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  return candidates.slice(0, count);
}

export default function AssociationField({ images, onClose, status, nodeLabel, nodeFields }: AssociationFieldProps) {
  // Display state — shadows props, can be replaced by seed clicks
  const [displayImages, setDisplayImages] = useState<AssociationItem[]>([]);
  const [displayLabel, setDisplayLabel] = useState(nodeLabel || '');
  const [path, setPath] = useState<PathStep[]>([]);
  const [internalStatus, setInternalStatus] = useState<'idle' | 'loading' | 'error' | null>(null);

  // Grid state
  const [positions, setPositions] = useState<Position[]>([]);
  const [visibleSet, setVisibleSet] = useState<Set<number>>(new Set());
  const [collision, setCollision] = useState<CollisionState | null>(null);

  const onCloseRef = useRef(onClose);
  const collisionRef = useRef(collision);
  const effectiveStatus = internalStatus ?? status;

  useEffect(() => { onCloseRef.current = onClose; });
  useEffect(() => { collisionRef.current = collision; }, [collision]);

  // Initialize from props when Layer 1 images arrive
  useEffect(() => {
    if (images.length === 0) return;
    setDisplayImages(images);
    setDisplayLabel(nodeLabel || '');
    setPath([{ type: 'node', label: nodeLabel || '', fields: nodeFields }]);
    setInternalStatus(null);
  }, [images, nodeLabel, nodeFields]);

  // Recompute positions when display images change
  useEffect(() => {
    if (displayImages.length === 0) return;
    setPositions(computePositions(displayImages.length));
    setVisibleSet(new Set());
    setCollision(null);
  }, [displayImages]);

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
      if ((e.target as HTMLElement).closest('.breadcrumb-trail')) return;
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

    if (collision?.index === i) {
      setCollision(null);
      return;
    }

    if (!displayLabel || !item.src) return;

    // Build path with image step for this click
    const clickPath = [...path, { type: 'image' as const, url: item.src }];

    setCollision({ index: i, status: 'loading' });

    fetch('/api/collide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: item.src,
        nodeLabel: displayLabel,
        nodeFields: nodeFields || [],
        path: clickPath,
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

  function handleSeedClick(e: React.MouseEvent, keyword: string) {
    e.stopPropagation();

    // Extend path: add fragment step (if we have one) + seed step
    const newPath = [...path];
    if (collision?.status === 'done' && collision.fragment) {
      newPath.push({
        type: 'fragment',
        text: collision.fragment,
        keywords: collision.keywords,
      });
    }
    newPath.push({ type: 'seed', label: keyword });

    // Clear current state, start loading new images
    setCollision(null);
    setDisplayImages([]);
    setPath(newPath);
    setDisplayLabel(keyword);
    setInternalStatus('loading');

    fetch('/api/discover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        label: keyword,
        fields: nodeFields || [],
        bridge: false,
        history: [],
        path: newPath,
      }),
    })
      .then(res => { if (!res.ok) throw new Error(`${res.status}`); return res.json(); })
      .then(data => {
        const results = data.results || [];
        if (results.length > 0) {
          setDisplayImages(results);
          setInternalStatus('idle');
        } else {
          setInternalStatus('error');
        }
      })
      .catch(() => setInternalStatus('error'));
  }

  // Breadcrumb: all node and seed steps
  const breadcrumbs = path.filter(s => s.type === 'node' || s.type === 'seed');

  return (
    <>
      {/* Breadcrumb trail — visible once a seed has been clicked */}
      {breadcrumbs.length > 1 && (
        <div className="breadcrumb-trail">
          {breadcrumbs.map((step, i) => (
            <span key={i}>
              {i > 0 && <span className="breadcrumb-sep">{'\u2192'}</span>}
              <span className="breadcrumb-label">{step.label}</span>
            </span>
          ))}
          <span
            className="breadcrumb-close"
            onClick={(e) => { e.stopPropagation(); onCloseRef.current(); }}
          >{'\u00d7'}</span>
        </div>
      )}

      {/* Status indicator */}
      {effectiveStatus === 'loading' && (
        <div className="discover-status">the tide is coming in...</div>
      )}
      {effectiveStatus === 'error' && (
        <div className="discover-status error">the tide retreated.</div>
      )}

      {/* Image grid */}
      {displayImages.length > 0 && positions.length > 0 && (
        <div className="association-field">
          {displayImages.slice(0, positions.length).map((item, i) => (
            <div
              key={`${item.id || item.src}-${i}`}
              className={[
                'association-thumb',
                visibleSet.has(i) ? 'visible' : '',
                item.type === 'link' ? 'link-card' : '',
                collision?.index === i && collision.status === 'loading' ? 'colliding' : '',
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

      {/* Collision overlay (Layer 2 + 3) */}
      {collision && collision.status !== 'loading' && (
        <div className="collision-overlay" onClick={() => setCollision(null)}>
          <div className="collision-panel" onClick={e => e.stopPropagation()}>
            {displayLabel && (
              <div className="collision-node-label">{displayLabel}</div>
            )}
            {collision.status === 'done' && (
              <>
                <p className="collision-fragment">{collision.fragment}</p>
                {collision.keywords && collision.keywords.length > 0 && (
                  <div className="collision-keywords">
                    {collision.keywords.map((kw, ki) => (
                      <span
                        key={ki}
                        className="collision-keyword"
                        onClick={(e) => handleSeedClick(e, kw)}
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
            {collision.status === 'error' && (
              <p className="collision-fragment collision-error-text">{'\u2014'}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
