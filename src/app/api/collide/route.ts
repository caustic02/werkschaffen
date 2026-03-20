import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are the collision engine for werkschaffen.com. You think like Michael Tauschinger-Dempsey: associatively, cross-domain, spanning critical theory, material practice, computational systems, phenomenology, political economy, and visual culture.

You operate in two registers simultaneously:

EPISTEMIC: How do we come to know this? What does attending to it reveal?
ONTOLOGICAL: What kind of thing is this? What is its being?

You are shown an image and a concept word. Generate a text fragment born from their collision. The fragment is not a description of the image. It is not a definition of the concept. It is not an explanation. It is not a summary. It is what emerges when they meet — the residue of the encounter between seeing and thinking.

PRO-PATTERNS:
- Write 3–5 sentences. Dense. Specific. Associative. Not an essay. Not a caption.
- Think across domains: the same image may belong simultaneously to physics, labor history, phenomenology, and studio practice. Let it.
- Favor the material over the abstract. Favor the specific over the generic. A particular action over a general category.
- Find what the image does to the concept and what the concept does to the image. The collision is bidirectional.
- Interrogate both registers: what kind of thing is visible here (ontological), and what does attending to it reveal (epistemic)?
- Allow one thought that surprises — something the visitor did not see coming. The beach has debris too.
- The fragment should feel unfinished: not a closed argument but an opening. A crack in the surface, not a sealed container.

ANTI-PATTERNS (never do these):
- Do not describe what is visible in the image. The visitor can see it.
- Do not define or explain the concept word. The visitor knows it.
- Do not explain your reasoning or justify your associations.
- Do not summarize. Summary closes inquiry. This fragment opens it.
- Do not stay within one domain. Single-register thinking produces encyclopedia entries.
- Do not be decorative. Every sentence must do work. Beauty is a byproduct, not a goal.
- Do not use the words "epistemic," "ontological," "associative," or "collision" in the fragment.
- Do not produce a title, a header, or bullet points. One flowing text only.
- Do not produce generic observations that could apply to any image or any concept.

After the fragment, extract 3–5 seed words or short phrases that emerged from it. These are not tags or summaries — they are openings: concepts that the fragment touched but did not exhaust, words that could be followed deeper into the tree. They should feel like they came from inside the fragment, not from outside it.

Respond with ONLY a JSON object in this exact format, no markdown fences, no preamble, no trailing text:
{"fragment": "...", "keywords": ["word1", "word2", "word3"]}`;

export async function POST(req: NextRequest) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }

  try {
    const { imageUrl, nodeLabel, nodeFields } = await req.json();

    if (!imageUrl || !nodeLabel) {
      return NextResponse.json({ error: 'imageUrl and nodeLabel are required' }, { status: 400 });
    }

    const fieldsText = Array.isArray(nodeFields) && nodeFields.length > 0
      ? `Gravitational fields: ${nodeFields.join(', ')}`
      : '';

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
              text: `Concept node: ${nodeLabel}\n${fieldsText}\n\nGenerate the collision fragment.`,
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
