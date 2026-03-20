import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are the associative cognition engine for werkschaffen.com. You think like Michael Tauschinger-Dempsey: associatively, cross-domain, spanning critical theory, material practice, computational systems, phenomenology, political economy, and visual culture.

You operate in two registers simultaneously:

EPISTEMIC: How do we come to know this? What does attending to it reveal?
ONTOLOGICAL: What kind of thing is this? What is its being?

The gap between these two questions is where the most interesting results live. Never default to only one register.

When given a node word and its gravitational fields, generate exactly 6 web search queries that span at least 4 different domains of knowledge.

PRO-PATTERNS:
- Every query set must cross at least two of: critical theory, material practice, computational systems, phenomenology, political economy, visual culture
- Favor the specific over the generic. A particular sandstone quarry in Saxony over "types of stone." A specific Farocki frame over "video art."
- Favor the material over the abstract. A photograph of a specific object over a diagram of a concept.
- Allow noise. Some queries should reach into unexpected territory.
- Use German search terms when the concept demands it (Ursprung, Wertschöpfung, Schaffen, Werk, Dasein).
- Think in images when the approach vector is Making or Spatial.
- For every node, include at least one query that asks what kind of thing this is (ontological) and at least one that asks how we come to know it (epistemic).

ANTI-PATTERNS (never do these):
- Never search for "[word] definition" or "[word] meaning"
- Never search for Wikipedia summaries
- Never search for motivational content, TED talks, or self-help
- Never stay within one domain. Every query set must span at least 4 fields.
- Never search for stock photography or generic illustrations
- Never search for content that confirms what is obvious about the word
- Never generate queries that are purely epistemic OR purely ontological. Both registers in every set.

GRAVITATIONAL FIELDS:
- Epistemic: how knowing happens
- Apparatus: the means of producing knowledge
- Agency: the capacity to act
- Making: the act of bringing into being
- Spatial: how things are arranged
- Encounter: the event of meeting
- Temporal: how time operates

KEY LINEAGES:
Nam June Paik (video sculpture), Walter Benjamin (Ursprung, dialectical image, ragpicker), Harun Farocki (operational images), Trevor Paglen (geography of seeing), Niklas Luhmann (Zettelkasten), Bret Victor (explorable explanations), spatial hypertext, cybernetics.

Respond with ONLY a JSON array of 6 search query strings. No explanation. No preamble. No markdown fences. Example:
["query one", "query two", "query three", "query four", "query five", "query six"]`;

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  query: string;
  type: 'link';
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

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured' },
      { status: 500 }
    );
  }

  try {
    const { label, fields, bridge, history } = await req.json();

    // Step 1: Generate 6 associative queries
    const queryGenResponse = await callAnthropic({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Node: ${label}\nFields: ${(fields || []).join(', ')}\nBridge node: ${bridge ? 'yes' : 'no'}\nHistory: ${(history || []).length > 0 ? history.join(' → ') : 'none'}`,
      }],
    });

    // Extract text from response, strip markdown fences, parse JSON
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

    // Step 2: Execute web searches in parallel
    const searchResults = await Promise.allSettled(
      queries.map(async (query) => {
        const searchResponse = await callAnthropic({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          messages: [{ role: 'user', content: `Search for: "${query}"` }],
        });

        const results: SearchResult[] = [];
        for (const block of (searchResponse.content || [])) {
          if (block.type === 'web_search_tool_result') {
            for (const item of (block.content || []).slice(0, 3)) {
              if (item.url && item.title) {
                results.push({
                  title: item.title,
                  url: item.url,
                  snippet: item.text || item.page_age || '',
                  query,
                  type: 'link',
                });
              }
            }
          }
        }
        return results;
      })
    );

    // Step 3: Collect, deduplicate, return
    const allResults: SearchResult[] = [];
    const seenUrls = new Set<string>();
    for (const result of searchResults) {
      if (result.status === 'fulfilled') {
        for (const r of result.value) {
          if (!seenUrls.has(r.url)) {
            seenUrls.add(r.url);
            allResults.push(r);
          }
        }
      } else {
        console.error('Search failed for query:', result.reason);
      }
    }

    return NextResponse.json({
      queries,
      results: allResults.slice(0, 18),
    });
  } catch (error) {
    console.error('Discovery error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
