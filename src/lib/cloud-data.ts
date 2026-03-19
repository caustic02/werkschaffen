export interface CloudNode {
  id: string;
  label: string;
  fontSize: number;
  fontWeight: number;
  desc: string;
}

export interface CloudLink {
  source: string;
  target: string;
}

export const CLOUD_NODES: CloudNode[] = [
  {
    id: "judgment",
    label: "Judgment",
    fontSize: 22,
    fontWeight: 700,
    desc: "The product of time, attention, and accumulated understanding. Not code. Not credentials. Not taste. The capacity to look at a complex domain, see what is missing, see what is broken, and know what to build next. Judgment cannot be automated. It can only be developed through sustained contact with the real.",
  },
  {
    id: "agency",
    label: "Agency",
    fontSize: 20,
    fontWeight: 600,
    desc: "The capacity to act on your own behalf, using your own knowledge, through mechanisms you control. Not visibility for its own sake. Not revenue as validation. The ability to direct your expertise toward the outcomes you choose, on terms you set, without intermediaries extracting the value you create.",
  },
  {
    id: "conviction",
    label: "Conviction",
    fontSize: 18,
    fontWeight: 600,
    desc: "A position held with enough force to build from. Not a business plan. Not a pitch deck. The irreducible thing you believe about how the world works and what it needs. The thread connecting every project, every decision, every sentence. If it resonates with yours, the rest is a conversation.",
  },
  {
    id: "wertschopfung",
    label: "Wertschöpfung",
    fontSize: 19,
    fontWeight: 700,
    desc: "Wert: value. Schöpfung: the act of bringing into being. The German compound says what English cannot in a single word. Not extraction. Not optimization. Not growth hacking. The generative act of making something where nothing existed, and ensuring the value returns to the people who created it.",
  },
  {
    id: "practitioner",
    label: "Practitioner",
    fontSize: 16,
    fontWeight: 500,
    desc: "The one who makes. Sculpture, spatial work, digital media. Every material resists. Every gesture is a judgment call informed by years of contact with the real. The practitioner knows that nothing works the way the theory says it should, and that the only honest knowledge comes from the act of making itself.",
  },
  {
    id: "theorist",
    label: "Theorist",
    fontSize: 16,
    fontWeight: 500,
    desc: "The one who sees systems. Histories, forces, the structures that shape what becomes visible and what stays hidden. The theorist knows that the real is never neutral, that every system of visibility is also a system of power, and that understanding how value gets constructed is the prerequisite for constructing it differently.",
  },
  {
    id: "legibility",
    label: "Legibility",
    fontSize: 15,
    fontWeight: 400,
    desc: "Making expertise visible, accessible, and actionable. Most experts are illegible to the world outside their domain. Their knowledge is locked in institutional contexts, professional jargon, or simply the fact that nobody ever built them a way to share it on their own terms. Legibility is the first step toward agency.",
  },
  {
    id: "orchestration",
    label: "Orchestration",
    fontSize: 14,
    fontWeight: 400,
    desc: "The new literacy is not coding. It is orchestration. Knowing which tools to direct at which problems, in what sequence, with what constraints. The conductor does not play every instrument. The architect does not lay every brick. The value is in the composition, not the execution.",
  },
  {
    id: "domain-expertise",
    label: "Domain expertise",
    fontSize: 15,
    fontWeight: 400,
    desc: "The irreplaceable knowledge that comes from years of deep engagement with a field. Not credentials. Not degrees. The thing you know that cannot be Googled, automated, or summarized. In the age of generative machines, domain expertise has become the scarcest and most valuable input. The machine can execute. It cannot judge.",
  },
  {
    id: "werk",
    label: "Werk",
    fontSize: 17,
    fontWeight: 600,
    desc: "The opus. Not labor. Not product. Not content. The body of work that accumulates when judgment meets sustained attention over years. Werk is what remains when the noise subsides. It is the evidence that someone was here, that they saw clearly, and that they built accordingly.",
  },
  {
    id: "schaffen",
    label: "Schaffen",
    fontSize: 17,
    fontWeight: 600,
    desc: "To create. To bring forth. To attain through making. Marx understood Schaffen as the foundation of all value: the human capacity to transform the world through intentional labor. Not the labor of the assembly line. The labor of the mind directing the hand, the eye correcting the gesture, the judgment shaping the form.",
  },
  {
    id: "virtuous-circle",
    label: "The virtuous circle",
    fontSize: 12,
    fontWeight: 300,
    desc: "The same tools that liberate can also enslave. The question is direction. The virtuous circle reverses the default extraction: technology serves human judgment, not the other way around. You are the orchestrator, not the cog. The machine amplifies what you already know. It does not replace the knowing.",
  },
  {
    id: "skills",
    label: "Skills",
    fontSize: 13,
    fontWeight: 400,
    desc: "Artists make thousands of micro-decisions per session. Every brushstroke, every cut, every spatial choice is a judgment call informed by the entire history of their training. Strategic thinking, pattern recognition, tolerance for ambiguity, comfort with iteration. These are not soft skills. They are the hardest skills there are.",
  },
];

export const CLOUD_LINKS: CloudLink[] = [
  { source: "judgment", target: "agency" },
  { source: "judgment", target: "conviction" },
  { source: "judgment", target: "domain-expertise" },
  { source: "agency", target: "legibility" },
  { source: "agency", target: "orchestration" },
  { source: "conviction", target: "wertschopfung" },
  { source: "wertschopfung", target: "werk" },
  { source: "wertschopfung", target: "schaffen" },
  { source: "practitioner", target: "theorist" },
  { source: "practitioner", target: "skills" },
  { source: "practitioner", target: "werk" },
  { source: "theorist", target: "legibility" },
  { source: "theorist", target: "schaffen" },
  { source: "orchestration", target: "skills" },
  { source: "orchestration", target: "virtuous-circle" },
  { source: "domain-expertise", target: "skills" },
  { source: "werk", target: "schaffen" },
  { source: "virtuous-circle", target: "judgment" },
];
