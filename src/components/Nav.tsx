"use client";

import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { label: "Werk", href: "#werk" },
  { label: "Schaffen", href: "#schaffen" },
  { label: "Kritik", href: "#kritik" },
  { label: "Connect", href: "#connect" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = () => setMenuOpen(false);

  return (
    <>
      <nav className={`ws-nav ${scrolled ? "scrolled" : ""}`}>
        <a href="#" className="ws-nav-logo">
          werkschaffen
        </a>
        <ul className="ws-nav-links">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
        </ul>
        <button
          className={`ws-nav-hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>
      <div className={`ws-nav-mobile ${menuOpen ? "open" : ""}`}>
        {NAV_ITEMS.map((item) => (
          <a key={item.href} href={item.href} onClick={handleNavClick}>
            {item.label}
          </a>
        ))}
      </div>
    </>
  );
}
