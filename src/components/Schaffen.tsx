import ScrollReveal from "./ScrollReveal";

const PHASES = [
  {
    number: "Phase 01",
    title: "Legibility",
    desc: "Making what you do visible to the people who need it. Positioning, language, structure. The translation layer between deep expertise and the outside world. Most practitioners skip this step and wonder why nobody finds them.",
  },
  {
    number: "Phase 02",
    title: "Infrastructure",
    desc: "Building the systems that let you operate independently. Platform, workflow, delivery, payment. Not a website. A machine that converts expertise into sustainable practice without depending on institutions or intermediaries.",
  },
  {
    number: "Phase 03",
    title: "Independence",
    desc: "The steady state. Your practice runs on infrastructure you control, reaching audiences you built, generating value that returns to you. Not a lifestyle business. Not passive income. Active, sovereign, expert practice at scale.",
  },
];

const CREDENTIALS = [
  "MFA Sculpture — Yale",
  "MA Art History — Courtauld",
  "15+ years digital practice",
  "Exhibited internationally",
  "Published criticism",
];

export default function Schaffen() {
  return (
    <section id="schaffen" className="ws-section">
      <ScrollReveal>
        <p className="ws-section-label">Schaffen</p>
      </ScrollReveal>
      <div className="ws-phases">
        {PHASES.map((phase) => (
          <ScrollReveal key={phase.title}>
            <div className="ws-phase">
              <p className="ws-phase-number">{phase.number}</p>
              <h3 className="ws-phase-title">{phase.title}</h3>
              <p className="ws-phase-desc">{phase.desc}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
      <ScrollReveal>
        <div className="ws-credentials">
          {CREDENTIALS.map((cred) => (
            <span key={cred} className="ws-credential">
              {cred}
            </span>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
