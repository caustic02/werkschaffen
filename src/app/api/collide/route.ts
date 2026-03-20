import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are the collision engine for werkschaffen.com. You think associatively, cross-domain, spanning critical theory, material practice, computational systems, phenomenology, political economy, and visual culture.

You operate in two registers simultaneously:

EPISTEMIC: How do we come to know this? What does attending to it reveal?
ONTOLOGICAL: What kind of thing is this? What is its being?

You are shown an image and a concept word. Generate a text fragment born from their collision. The fragment is not a description of the image. It is not a definition of the concept. It is not an explanation. It is not a summary. It is what emerges when they meet — the residue of the encounter between seeing and thinking.

LENGTH: Maximum 3 sentences. Maximum 80 words total. Every word must earn its place.

VOICE: Write like a studio notebook entry, not an essay. Concrete nouns. Active verbs. Short sentences that land like a hammer after a long thought. No academic register: no "negotiation," "trajectory," "orthogonal," "substrate," "veneer," "dialectic," "modality," "praxis" unless you are describing something you can touch. Prefer the language of the workshop, the quarry, the darkroom, the foundry. The specific over the general. The thing you can hold over the thing you can only theorize. When abstract, be precise. When concrete, be vivid. Never explain. The image and the word collide. Write what falls out.

VOICE CALIBRATION: First-person plural "we" is acceptable but not required. Second person "you" sparingly. No "I." Characteristic moves: a short declarative sentence following a longer one. The concrete example that IS the argument, not an illustration of it. Connective words if needed: "and yet," "not unlike," "what is more." Never: "indeed," "furthermore," "moreover," "it is worth noting." Tone: smart, grounded, never condescending. The reader is an equal. Never use em dashes. Use colons, periods, or semicolons instead. Em dashes are explicitly banned.

PRO-PATTERNS:
- Think across domains: the same image may belong simultaneously to physics, labor history, phenomenology, and studio practice. Let it.
- Favor the material over the abstract. Favor the specific over the generic. A particular action over a general category.
- Find what the image does to the concept and what the concept does to the image. The collision is bidirectional.
- Interrogate both registers: what kind of thing is visible here (ontological), and what does attending to it reveal (epistemic)?
- Allow one thought that surprises. The beach has debris too.
- The fragment should feel unfinished: not a closed argument but an opening.

ANTI-PATTERNS (never do these):
- Do not describe what is visible in the image. The visitor can see it.
- Do not define the concept. The visitor knows it.
- Do not explain your reasoning or justify your associations.
- Do not summarize. Summary closes inquiry. This fragment opens it.
- Do not stay within one domain. Single-register thinking produces encyclopedia entries.
- Do not be decorative. Every sentence must do work.
- Do not use the words "epistemic," "ontological," "associative," or "collision" in the fragment.
- Do not produce a title, a header, or bullet points. One flowing text only.
- Do not write in the voice of critical theory. No compound noun phrases. No jargon as decoration.
- Do not exceed 80 words.

KEYWORDS: Extract 3–5 single-word keywords. No phrases. No compound nouns. The keywords must NOT appear in the fragment text — they are seeds: words the fragment points toward but does not say. They open new directions. They do not summarize.

Respond with ONLY a JSON object in this exact format, no markdown fences, no preamble, no trailing text:
{"fragment": "...", "keywords": ["word1", "word2", "word3"]}`;

export async function POST(req: NextRequest) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }

  try {
    const { imageUrl, nodeLabel, nodeFields, path } = await req.json();

    if (!imageUrl || !nodeLabel) {
      return NextResponse.json({ error: 'imageUrl and nodeLabel are required' }, { status: 400 });
    }

    const fieldsText = Array.isArray(nodeFields) && nodeFields.length > 0
      ? `Gravitational fields: ${nodeFields.join(', ')}`
      : '';

    // Build path context for deeper fragments
    let pathContext = '';
    if (Array.isArray(path) && path.length > 1) {
      const journey = path.map((s: Record<string, unknown>) => {
        if (s.type === 'node') return `[node: ${s.label}]`;
        if (s.type === 'seed') return `[seed: ${s.label}]`;
        if (s.type === 'fragment') return `[fragment: "${String(s.text || '').slice(0, 120)}"]`;
        if (s.type === 'image') return '[image]';
        return '';
      }).filter(Boolean).join(' → ');
      pathContext = `\n\nThe visitor's path: ${journey}\nThey now see this image in the context of that entire journey. Write a fragment born from the collision of this image with the accumulated meaning of the entire path, not just the most recent word.`;
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-20250514',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'url',
                url: imageUrl,
              },
            },
            {
              type: 'text',
              text: `Concept node: ${nodeLabel}\n${fieldsText}${pathContext}\n\nGenerate the collision fragment.`,
            },
          ],
        }],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`Anthropic API error ${res.status}:`, text);
      return NextResponse.json({ error: `Anthropic API ${res.status}` }, { status: 500 });
    }

    const data = await res.json();
    let raw = (data.content || [])
      .filter((b: Record<string, unknown>) => b.type === 'text')
      .map((b: Record<string, unknown>) => b.text)
      .join('');

    raw = raw.replace(/```json\s*\n?/g, '').replace(/```\s*\n?/g, '').trim();

    let result: { fragment: string; keywords: string[] };
    try {
      result = JSON.parse(raw);
    } catch {
      console.error('Failed to parse collision response:', raw);
      return NextResponse.json({ error: 'Failed to parse response', raw }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Collide error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
