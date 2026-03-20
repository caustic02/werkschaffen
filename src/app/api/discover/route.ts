import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are the visual association engine for werkschaffen.com. You think like Michael Tauschinger-Dempsey: associatively, cross-domain, spanning critical theory, material practice, computational systems, phenomenology, political economy, and visual culture.

You operate in two registers simultaneously:

EPISTEMIC: How do we come to know this? What does attending to it reveal?
ONTOLOGICAL: What kind of thing is this? What is its being?

Your job is to translate these questions into IMAGE search queries. You are searching the visual internet. The queries must find photographs, not articles. Think visually. Think materially. Think specifically.

When given a node word and its gravitational fields, generate exactly 6 image search queries that span at least 4 different visual domains.

PRO-PATTERNS:
- Every query must describe something VISIBLE. Not a concept — a scene, an object, a texture, a place, a process, a material.
- Favor the hyper-specific over the generic. "limestone quarry aerial Saxony" not "stone." "silk loom shuttle close-up" not "textile production." "CNC mill aluminum sparks" not "manufacturing."
- Span domains visually: a scientific photograph, an architectural detail, a studio/workshop scene, a landscape, a material texture, a human gesture.
- When the node belongs to the Making field, search for physical processes: hands working material, tools in use, workshops, forges, studios, kilns.
- When the node belongs to the Spatial field, search for architectural spaces, topographic views, structural details, arrangements of objects.
- When the node belongs to the Temporal field, search for patina, erosion, ruins, growth rings, geological strata, time-lapse subjects.
- When the node belongs to the Encounter field, search for moments of contact: a person facing a landscape, hands touching material, eyes meeting a screen.
- Allow one unexpected/noise query per set. Something lateral. The beach has debris too.
- Use German search terms when they produce better visual results (Werkstatt, Baustelle, Steinbruch).

ANTI-PATTERNS (never do these):
- Never search for book covers, logos, screenshots, diagrams, or infographics
- Never search for portraits of named philosophers or theorists
- Never search for generic stock photography ("business meeting", "creative team", "innovation")
- Never search for abstract concepts that cannot be photographed ("epistemology", "ontology", "meaning")
- Never use the node word by itself as a query. Always transform it into something visual and specific.
- Never search for the same visual domain twice in one set. 6 queries = 6 different kinds of images.

GRAVITATIONAL FIELDS (for reference):
- Epistemic: how knowing happens → search for: instruments of measurement, observatories, laboratories, lenses, archives, libraries, specimens
- Apparatus: the means of producing knowledge → search for: cameras, printing presses, looms, machines, screens, interfaces, tools
- Agency: the capacity to act → search for: hands at work, decisive gestures, thresholds being crossed, doors opening
- Making: the act of bringing into being → search for: workshops, raw materials transforming, kilns, forges, studios, construction sites
- Spatial: how things are arranged → search for: architecture, urban planning, geological formations, grids, maps, cross-sections
- Encounter: the event of meeting → search for: moments of contact, arrival scenes, exhibition spaces, thresholds, horizons
- Temporal: how time operates → search for: erosion, patina, ruins, growth rings, fossils, archaeological digs, weathered surfaces

Respond with ONLY a JSON array of 6 image search query strings. No explanation. No preamble. No markdown fences. Example:
["molten glass blowing furnace close-up", "eroded sandstone cliff face texture", "darkroom enlarger red light", "carpenter dovetail joint hand tools", "brutalist concrete stairwell shadow", "abandoned textile mill machinery"]`;

interface ImageResult {
  type: 'image';
  id: string;
  src: string;
  thumb: string;
  alt: string;
  credit: string;
  url: string;
  query: string;
}

async function callAnthropic(body: Record<string, unknown>) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${text}`);
  }
  return res.json();
}

async function searchGoogleImages(query: string, apiKey: string, cseId: string): Promise<ImageResult[]> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&searchType=image&num=4&imgSize=large&siteSearchFilter=e`
    );
    if (!res.ok) {
      console.error(`Google CSE error for "${query}": ${res.status}`);
      return [];
    }
    const data = await res.json();
    return (data.items || []).map((item: Record<string, unknown>) => {
      const image = (item.image || {}) as Record<string, string>;
      return {
        type: 'image' as const,
        id: item.link as string,
        src: item.link as string,
        thumb: image.thumbnailLink || (item.link as string),
        alt: (item.title as string) || '',
        credit: (item.displayLink as string) || '',
        url: image.contextLink || (item.link as string),
        query,
      };
    });
  } catch (err) {
    console.error(`Google CSE fetch failed for "${query}":`, err);
    return [];
  }
}

export async function POST(req: NextRequest) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }
  const googleKey = process.env.GOOGLE_CSE_KEY;
  const googleCseId = process.env.GOOGLE_CSE_ID;
  if (!googleKey || !googleCseId) {
    return NextResponse.json({ error: 'GOOGLE_CSE_KEY or GOOGLE_CSE_ID not configured' }, { status: 500 });
  }

  try {
    const { label, fields, bridge, history } = await req.json();

    // Step 1: Generate 6 visual search queries via Anthropic
    const queryGenResponse = await callAnthropic({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Node: ${label}\nFields: ${(fields || []).join(', ')}\nBridge node: ${bridge ? 'yes' : 'no'}\nHistory: ${(history || []).length > 0 ? history.join(' → ') : 'none'}`,
      }],
    });

    // Extract and parse queries
    let queriesText = (queryGenResponse.content || [])
      .filter((b: Record<string, unknown>) => b.type === 'text')
      .map((b: Record<string, unknown>) => b.text)
      .join('');
    queriesText = queriesText.replace(/```json\s*\n?/g, '').replace(/```\s*\n?/g, '').trim();

    let queries: string[];
    try {
      queries = JSON.parse(queriesText);
    } catch {
      console.error('Failed to parse queries:', queriesText);
      return NextResponse.json(
        { error: 'Failed to parse query generation response', raw: queriesText },
        { status: 500 }
      );
    }

    if (!Array.isArray(queries) || queries.length === 0) {
      console.error('No queries generated:', queriesText);
      return NextResponse.json(
        { error: 'No queries generated', raw: queriesText },
        { status: 500 }
      );
    }

    // Step 2: Search Google Images for each query in parallel
    const searchResults = await Promise.all(
      queries.map(query => searchGoogleImages(query, googleKey, googleCseId))
    );

    // Step 3: Flatten, deduplicate by src URL, cap at 20
    const allResults: ImageResult[] = [];
    const seenSrcs = new Set<string>();
    for (const batch of searchResults) {
      for (const photo of batch) {
        if (!seenSrcs.has(photo.src)) {
          seenSrcs.add(photo.src);
          allResults.push(photo);
        }
      }
    }

    return NextResponse.json({
      queries,
      results: allResults.slice(0, 20),
    });
  } catch (error) {
    console.error('Discovery error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
