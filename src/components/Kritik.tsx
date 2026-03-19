"use client";

import ScrollReveal from "./ScrollReveal";

const ESSAYS = [
  {
    title: "The Judgment Gap",
    meta: "forthcoming",
  },
  {
    title: "Orchestration as Literacy",
    meta: "forthcoming",
  },
  {
    title: "Against Legibility Theater",
    meta: "forthcoming",
  },
  {
    title: "Wertschöpfung: Value Creation After Extraction",
    meta: "forthcoming",
  },
  {
    title: "The Practitioner's Advantage",
    meta: "forthcoming",
  },
];

export default function Kritik() {
  return (
    <section id="kritik" className="ws-section">
      <ScrollReveal>
        <p className="ws-section-label">Kritik</p>
      </ScrollReveal>
      <div className="ws-essays">
        {ESSAYS.map((essay) => (
          <ScrollReveal key={essay.title}>
            <div className="ws-essay-row">
              <span className="ws-essay-title">{essay.title}</span>
              <span className="ws-essay-meta">{essay.meta}</span>
            </div>
          </ScrollReveal>
        ))}
      </div>
      <ScrollReveal>
        <div className="ws-email-capture">
          <p>
            Essays on art, technology, and the infrastructure of independent
            practice. Subscribe for new writing.
          </p>
          <form
            className="ws-email-form"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              className="ws-email-input"
              placeholder="your@email.com"
              aria-label="Email address"
            />
            <button type="submit" className="ws-email-btn">
              Subscribe
            </button>
          </form>
        </div>
      </ScrollReveal>
    </section>
  );
}
