"use client";

import PointCloud from "./PointCloud";

export default function Hero() {
  return (
    <section className="ws-hero">
      <PointCloud />
      <div className="ws-hero-content">
        <h1 className="ws-hero-question">
          Build what?
          <br />
          <span className="ws-hero-question-italic">Serve whom?</span>
        </h1>
      </div>
      <a href="#manifesto" className="ws-hero-scroll">
        <span className="ws-hero-scroll-label">Manifest</span>
        <span className="ws-hero-scroll-arrow" />
      </a>
    </section>
  );
}
