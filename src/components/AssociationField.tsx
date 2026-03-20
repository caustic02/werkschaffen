'use client';

import { useEffect, useState, useRef } from 'react';

export interface AssociationImage {
  src: string;
  alt: string;
}

interface AssociationFieldProps {
  images: AssociationImage[];
  onClose: () => void;
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

export default function AssociationField({ images, onClose }: AssociationFieldProps) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [visibleSet, setVisibleSet] = useState<Set<number>>(new Set());
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Compute positions when images arrive
  useEffect(() => {
    if (images.length === 0) return;
    setPositions(computePositions(images.length));
    setVisibleSet(new Set());
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
      onCloseRef.current();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
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

  if (images.length === 0 || positions.length === 0) return null;

  return (
    <div className="association-field">
      {images.slice(0, positions.length).map((img, i) => (
        <div
          key={`${img.src}-${i}`}
          className={`association-thumb${visibleSet.has(i) ? ' visible' : ''}`}
          style={{ left: positions[i].x, top: positions[i].y }}
          onClick={(e) => {
            e.stopPropagation();
            console.log(img);
          }}
        >
          <img src={img.src} alt={img.alt || ''} loading="lazy" />
        </div>
      ))}
    </div>
  );
}
