"use client";

import { useState } from "react";
import ScrollReveal from "./ScrollReveal";

interface Spoke {
  title: string;
  status: string;
  statusClass: string;
  desc: string;
}

const SPOKES: Spoke[] = [
  {
    title: "aha! Art Haus Auction",
    status: "Live",
    statusClass: "live",
    desc: "A curated auction platform where artists set the terms. No gallery commission structure. No algorithmic visibility games. Direct exchange between maker and collector, with transparent mechanics and artist-controlled pricing. The auction format creates urgency without extraction.",
  },
  {
    title: "aha! Register",
    status: "Pre-launch",
    statusClass: "prelaunch",
    desc: "A verified registry of practicing artists and their work. Not a portfolio site. Not a social network. A credentialed, searchable record that makes artistic practice legible to institutions, collectors, and collaborators on the artist's own terms.",
  },
  {
    title: "Expert Practice Builds",
    status: "Open",
    statusClass: "open",
    desc: "Structured engagements for practitioners who know their domain but need infrastructure. We build the systems that make expertise visible and economically sovereign: positioning, platforms, workflows, and the connective tissue between what you know and how the world finds it.",
  },
  {
    title: "Culture and Criticism",
    status: "Active",
    statusClass: "active",
    desc: "Writing, analysis, and public discourse on the intersection of art, technology, and value creation. Not content marketing. Not thought leadership. Criticism in the European tradition: rigorous, opinionated, and accountable to the work it examines.",
  },
];

export default function Werk() {
  const [expanded, setExpanded] = useState<number | null>(null);

  const toggle = (i: number) => {
    setExpanded(expanded === i ? null : i);
  };

  return (
    <section id="werk" className="ws-section">
      <ScrollReveal>
        <p className="ws-section-label">Werk</p>
      </ScrollReveal>
      <div className="ws-werk-grid">
        {SPOKES.map((spoke, i) => (
          <ScrollReveal key={spoke.title}>
            <div
              className={`ws-spoke ${expanded === i ? "expanded" : ""}`}
              onClick={() => toggle(i)}
            >
              <div className="ws-spoke-header">
                <span className="ws-spoke-title">{spoke.title}</span>
                <span className={`ws-spoke-status ${spoke.statusClass}`}>
                  {spoke.status}
                </span>
                <span
                  className={`ws-spoke-toggle ${expanded === i ? "open" : ""}`}
                >
                  &#9662;
                </span>
              </div>
              <div
                className={`ws-spoke-body ${expanded === i ? "open" : ""}`}
              >
                <p className="ws-spoke-desc">{spoke.desc}</p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
