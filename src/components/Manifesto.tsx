import ScrollReveal from "./ScrollReveal";

export default function Manifesto() {
  return (
    <section id="manifesto" className="ws-manifesto">
      <ScrollReveal>
        <p className="ws-manifesto-text">
          <strong>Materials resist. Friction takes off the edge.</strong> The
          work that remains is the work that was fought for. Not optimized. Not
          automated. Built with judgment, under pressure, on purpose.{" "}
          <strong>Legible. Sovereign. Exhilaratingly yours.</strong>
        </p>
      </ScrollReveal>
      <ScrollReveal>
        <p className="ws-manifesto-coda">The rest is a conversation.</p>
      </ScrollReveal>
    </section>
  );
}
