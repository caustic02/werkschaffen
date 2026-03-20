export interface Field {
  label: string;
  color: string;
  desc: string;
}

export interface GraphNode {
  id: string;
  label: string;
  fields: string[];
  bridge: boolean;
  de: string | null;
  variants?: Record<string, string>;
}

export interface GraphEdge {
  source: string;
  target: string;
  strength: number;
}

export const FIELDS: Record<string, Field> = {
  epistemic:  { label: 'Epistemic',  color: '#6B8FA3', desc: 'How knowing happens' },
  apparatus:  { label: 'Apparatus',  color: '#9B7E6B', desc: 'The means of producing knowledge' },
  agency:     { label: 'Agency',     color: '#C47A3A', desc: 'The capacity to act' },
  making:     { label: 'Making',     color: '#7A9B6B', desc: 'The act of producing' },
  spatial:    { label: 'Spatial',    color: '#8B7BA3', desc: 'The structure of relations' },
  encounter:  { label: 'Encounter',  color: '#A3836B', desc: 'The experience of engaging' },
  temporal:   { label: 'Temporal',   color: '#6B7A8B', desc: 'The dimension of time' },
};

export const NODES: GraphNode[] = [
  // EPISTEMIC
  { id: 'judgment', label: 'Judgment', fields: ['epistemic', 'agency', 'making'], bridge: true, de: null,
    variants: {
      'via Agency': 'Who gets to judge. Decision-making authority, the question of qualification, the power embedded in evaluation.',
      'via Making': 'The trained eye. Taste as craft knowledge. The practitioner who sees what the untrained eye cannot.',
      'via Legibility': 'How evaluation itself is structured. The frameworks that determine what counts as quality, rigor, or worth.',
    } },
  { id: 'pattern', label: 'Pattern', fields: ['epistemic', 'spatial', 'temporal'], bridge: true, de: null, variants: {} },
  { id: 'legibility', label: 'Legibility', fields: ['epistemic', 'agency', 'encounter'], bridge: true, de: null, variants: {} },
  { id: 'intuition', label: 'Intuition', fields: ['epistemic', 'temporal', 'encounter'], bridge: false, de: null, variants: {} },
  { id: 'coherence', label: 'Coherence', fields: ['epistemic', 'spatial', 'temporal'], bridge: true, de: null, variants: {} },

  // APPARATUS
  { id: 'medium', label: 'Medium', fields: ['apparatus', 'encounter', 'spatial'], bridge: true, de: null, variants: {} },
  { id: 'frame', label: 'Frame', fields: ['apparatus', 'spatial', 'encounter'], bridge: true, de: null, variants: {} },
  { id: 'model', label: 'Model', fields: ['apparatus', 'epistemic', 'making'], bridge: true, de: null, variants: {} },
  { id: 'language', label: 'Language', fields: ['apparatus', 'epistemic', 'encounter'], bridge: false, de: null, variants: {} },
  { id: 'prosthetic', label: 'Prosthetic', fields: ['apparatus', 'agency', 'making'], bridge: false, de: null, variants: {} },

  // AGENCY
  { id: 'agency', label: 'Agency', fields: ['agency', 'epistemic', 'encounter'], bridge: false, de: null, variants: {} },
  { id: 'courage', label: 'Courage', fields: ['agency', 'temporal', 'making'], bridge: false, de: null, variants: {} },
  { id: 'freedom', label: 'Freedom', fields: ['agency', 'spatial', 'temporal'], bridge: false, de: null, variants: {} },
  { id: 'trust', label: 'Trust', fields: ['agency', 'encounter', 'temporal'], bridge: false, de: null, variants: {} },
  { id: 'conviction', label: 'Conviction', fields: ['agency', 'epistemic', 'making'], bridge: false, de: null, variants: {} },

  // MAKING
  { id: 'schaffen', label: 'Schaffen', fields: ['making', 'temporal', 'agency'], bridge: false, de: 'To create with effort. Ich habe es geschafft: I accomplished it.' },
  { id: 'werk', label: 'Werk', fields: ['making', 'temporal', 'epistemic'], bridge: false, de: 'The opus. The body of work. What remains.' },
  { id: 'composition', label: 'Composition', fields: ['making', 'spatial', 'apparatus'], bridge: true, de: null, variants: {} },
  { id: 'friction', label: 'Friction', fields: ['making', 'encounter', 'epistemic'], bridge: false, de: null, variants: {} },
  { id: 'condense', label: 'Condense', fields: ['making', 'epistemic', 'temporal'], bridge: false, de: null, variants: {} },
  { id: 'curate', label: 'Curate', fields: ['making', 'agency', 'encounter'], bridge: false, de: null, variants: {} },

  // SPATIAL
  { id: 'surface', label: 'Surface', fields: ['spatial', 'epistemic', 'encounter'], bridge: true, de: null,
    variants: {
      'via Epistemic': 'To surface: to make visible what was hidden. The act of bringing to light. Every interface decides what rises and what stays buried.',
      'via Spatial': 'A plane. A boundary between inside and outside. The skin of things. What you touch before you understand.',
      'via Encounter': 'What the visitor meets first. The outermost layer. The thing that must be legible before depth becomes available.',
      'via Making': 'The finish. The final state of a worked material. Where process ends and perception begins.',
      'via Temporal': 'What erodes. What accumulates. Patina, wear, the record of time passing across a face.',
    } },
  { id: 'topology', label: 'Topology', fields: ['spatial', 'epistemic', 'temporal'], bridge: true, de: null, variants: {} },
  { id: 'layer', label: 'Layer', fields: ['spatial', 'temporal', 'making'], bridge: true, de: null, variants: {} },
  { id: 'threshold', label: 'Threshold', fields: ['spatial', 'encounter', 'temporal'], bridge: true, de: null, variants: {} },
  { id: 'node', label: 'Node', fields: ['spatial', 'apparatus', 'epistemic'], bridge: false, de: null, variants: {} },

  // ENCOUNTER
  { id: 'encounter', label: 'Encounter', fields: ['encounter', 'temporal', 'agency'], bridge: true, de: null, variants: {} },
  { id: 'attention', label: 'Attention', fields: ['encounter', 'epistemic', 'temporal'], bridge: false, de: null, variants: {} },
  { id: 'experiment', label: 'Experiment', fields: ['encounter', 'making', 'epistemic'], bridge: false, de: null, variants: {} },
  { id: 'interaction', label: 'Interaction', fields: ['encounter', 'apparatus', 'spatial'], bridge: false, de: null, variants: {} },

  // TEMPORAL
  { id: 'duration', label: 'Duration', fields: ['temporal', 'encounter', 'epistemic'], bridge: false, de: null, variants: {} },
  { id: 'ursprung', label: 'Ursprung', fields: ['temporal', 'epistemic', 'making'], bridge: false, de: 'Origin as eruption. Not beginning but breakthrough. Benjamin: what breaks through from history.' },
  { id: 'trace', label: 'Trace', fields: ['temporal', 'spatial', 'epistemic'], bridge: false, de: null, variants: {} },
  { id: 'continuity', label: 'Continuity', fields: ['temporal', 'spatial', 'agency'], bridge: false, de: null, variants: {} },
  { id: 'flux', label: 'Flux', fields: ['temporal', 'spatial', 'encounter'], bridge: false, de: null, variants: {} },
  { id: 'reflection', label: 'Reflection', fields: ['temporal', 'epistemic', 'encounter'], bridge: true, de: null, variants: {} },
];

// Auto-generate edges: nodes sharing 2+ fields
export const EDGES: GraphEdge[] = [];
for (let i = 0; i < NODES.length; i++) {
  for (let j = i + 1; j < NODES.length; j++) {
    const shared = NODES[i].fields.filter(f => NODES[j].fields.includes(f));
    if (shared.length >= 2) {
      EDGES.push({ source: NODES[i].id, target: NODES[j].id, strength: shared.length / 3 });
    }
  }
}
