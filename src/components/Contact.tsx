import ScrollReveal from "./ScrollReveal";

export default function Contact() {
  return (
    <section id="connect" className="ws-section">
      <ScrollReveal>
        <p className="ws-section-label">Connect</p>
      </ScrollReveal>
      <ScrollReveal>
        <p className="ws-contact-cta">
          If you are a practitioner with{" "}
          <strong>domain expertise and conviction</strong> but no infrastructure
          to match, this is built for you. The first conversation is about
          whether we see the same things.
        </p>
      </ScrollReveal>
      <ScrollReveal>
        <div className="ws-contact-grid">
          <div className="ws-contact-item">
            <p className="ws-contact-item-label">Email</p>
            <p className="ws-contact-item-value">
              <a href="mailto:hello@werkschaffen.com">
                hello@werkschaffen.com
              </a>
            </p>
          </div>
          <div className="ws-contact-item">
            <p className="ws-contact-item-label">Location</p>
            <p className="ws-contact-item-value">Berlin / Remote</p>
          </div>
          <div className="ws-contact-item">
            <p className="ws-contact-item-label">Availability</p>
            <p className="ws-contact-item-value">Accepting projects</p>
          </div>
        </div>
      </ScrollReveal>
      <ScrollReveal>
        <a href="mailto:hello@werkschaffen.com" className="ws-booking-link">
          Book a conversation
        </a>
      </ScrollReveal>
    </section>
  );
}
