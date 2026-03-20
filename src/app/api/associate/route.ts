import { NextRequest, NextResponse } from 'next/server';
import { NODE_VIDEOS, type AssociationItem } from '@/lib/association-videos';

const QUERY_POOLS: Record<string, string[]> = {
  werk: [
    'artist studio cluttered workspace',
    'manuscript pages handwritten',
    'cathedral construction medieval',
    'sculptor marble rough hewn',
    'bookshelf old leather volumes',
    'architect drafting table blueprints',
    'composer musical score annotations',
    'aged craftsman hands tools',
    'museum gallery installation',
    'printing press letterpress',
    'darkroom photography enlarger',
    'weaving loom textile',
    'ceramics kiln fired objects',
    'library archive shelves',
    'ruins ancient columns',
    'patinated bronze sculpture',
    'woodworking bench plane shavings',
    'stone wall dry stacked',
    'typewriter manuscript desk',
    'archaeological excavation layers',
  ],
  schaffen: [
    'hands shaping clay pottery wheel',
    'blacksmith forge sparks',
    'construction scaffolding workers',
    'dawn breaking mountain horizon',
    'seed breaking through soil',
    'welding sparks metal fabrication',
    'painter palette brushstrokes canvas',
    'woodworker carving chisel',
    'glass blowing molten',
    'stonemason chisel limestone',
    'bread dough kneading hands',
    'plowing field earth furrows',
    'climbing steep rock face',
    'foundry pouring molten metal',
    'engraving plate printmaking',
    'dancer rehearsal studio practice',
    'building framework timber framing',
    'calligraphy ink brush strokes',
    'violin maker workshop',
    'concrete pouring construction',
  ],
};

export async function POST(req: NextRequest) {
  try {
    const { nodeId } = await req.json();
    const pool = QUERY_POOLS[nodeId];
    if (!pool) return NextResponse.json([]);

    const key = process.env.UNSPLASH_ACCESS_KEY;
    if (!key) return NextResponse.json([]);

    // Pick 4 random queries
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const queries = shuffled.slice(0, 4);

    const results = await Promise.all(
      queries.map(async (query) => {
        try {
          const res = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=5&client_id=${key}`
          );
          if (!res.ok) return [];
          const data = await res.json();
          return (data.results || []).map((r: Record<string, unknown>) => ({
            type: 'image' as const,
            src: (r.urls as Record<string, string>).small,
            alt: (r.alt_description as string) || query,
          }));
        } catch {
          return [];
        }
      })
    );

    // Mix videos into the image results
    const images: AssociationItem[] = results.flat();
    const videos = NODE_VIDEOS[nodeId] || [];
    // Interleave: insert videos at roughly even intervals
    const combined = [...images];
    const step = Math.max(1, Math.floor(images.length / (videos.length + 1)));
    videos.forEach((v, i) => {
      const pos = Math.min(combined.length, step * (i + 1));
      combined.splice(pos, 0, v);
    });

    return NextResponse.json(combined);
  } catch {
    return NextResponse.json([]);
  }
}
