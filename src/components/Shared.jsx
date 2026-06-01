import React, { useState, useEffect } from 'react';
import { Icon, DropLogo } from './Icons';
import { WW, t } from '../data';

/* Image with graceful fallback (photos are hotlinked from the live site) */
export function Img({ src, alt, style, className }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div className={className} style={{ ...style, width: "100%", height: "100%",
        background: "linear-gradient(135deg, color-mix(in srgb,var(--primary) 22%,var(--surface)), color-mix(in srgb,var(--accent) 16%,var(--surface)))",
        display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
        <Icon name="drop" size={42} />
      </div>
    );
  }
  return <img src={src} alt={alt || ""} style={style} className={className} loading="lazy" onError={() => setErr(true)} />;
}

export function Eyebrow({ children, className, style }) {
  return <span className={"eyebrow " + (className || "")} style={style}>{children}</span>;
}

export function SectionHead({ eyebrow, title, sub, center }) {
  return (
    <div className={"shead reveal" + (center ? " center" : "")}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2>{title}</h2>
      {sub && <p>{sub}</p>}
    </div>
  );
}

export function Wave({ up }) {
  return (
    <svg className={"wave" + (up ? " wave-up" : "")} viewBox="0 0 1200 64" preserveAspectRatio="none" aria-hidden="true">
      <path fill="currentColor" d="M0 28c150 30 280 30 420 6s300-44 480-22 240 34 300 30v22H0Z" />
    </svg>
  );
}

/* scroll reveal — observes .reveal nodes, with immediate in-view reveal + safety fallback */
export function useReveal(dep) {
  useEffect(() => {
    const revealInView = () => {
      const vh = window.innerHeight || 800;
      document.querySelectorAll(".reveal:not(.in)").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) el.classList.add("in");
      });
    };
    let io = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver((ents) => {
        ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
      }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
      document.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
    }
    // reveal anything already on screen right away
    const raf = requestAnimationFrame(revealInView);
    window.addEventListener("scroll", revealInView, { passive: true });
    // safety net: never leave content hidden
    const safety = setTimeout(() => { document.querySelectorAll(".reveal:not(.in)").forEach((el) => el.classList.add("in")); }, 1600);
    return () => { if (io) io.disconnect(); cancelAnimationFrame(raf); clearTimeout(safety); window.removeEventListener("scroll", revealInView); };
  }, [dep]);
}

export function Header({ lang, setLang, route, go }) {
  const [open, setOpen] = useState(false);
  const L = (o) => t(o, lang);
  return (
    <header className={"header" + (open ? " open" : "")}>
      <div className="wrap">
        <div className="header-row">
          <a className="brand" href="#" onClick={(e) => { e.preventDefault(); go("home"); setOpen(false); }}>
            <DropLogo className="drop" />
            <span>Water<b>Works</b></span>
          </a>
          <nav className="nav">
            {WW.nav.map((n) => (
              <a key={n.id} href="#" className={route === n.id ? "active" : ""}
                onClick={(e) => { e.preventDefault(); go(n.id); }}>{L(n.label)}</a>
            ))}
          </nav>
          <div className="header-actions">
            <div className="lang">
              {["en", "fr", "nl"].map((lg) => (
                <button key={lg} className={lang === lg ? "on" : ""} onClick={() => setLang(lg)}>{lg.toUpperCase()}</button>
              ))}
            </div>
            <a className="btn btn-accent" href="#" onClick={(e) => { e.preventDefault(); go("contact"); }}>
              {L(WW.ui.quoteShort)}
            </a>
            <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Menu">
              <Icon name={open ? "close" : "menu"} />
            </button>
          </div>
        </div>
        <div className="mobile-nav">
          {WW.nav.map((n) => (
            <a key={n.id} href="#" className={route === n.id ? "active" : ""}
              onClick={(e) => { e.preventDefault(); go(n.id); setOpen(false); }}>{L(n.label)}</a>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            {["en", "fr", "nl"].map((lg) => (
              <button key={lg} className="type-chip" style={lang === lg ? { background: "var(--primary)", color: "var(--primary-ink)", borderColor: "var(--primary)" } : {}} onClick={() => setLang(lg)}>{lg.toUpperCase()}</button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

export function Footer({ lang, go }) {
  const L = (o) => t(o, lang);
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="brand"><DropLogo className="drop" /><span>Water<b style={{ color: "var(--hero-eyebrow)" }}>Works</b></span></div>
            <p className="footer-tag">{L({ en: "Honest plumbing, heating and water-softening for Brussels homes — punctual, fairly priced, and a little kinder to the planet.", fr: "Plomberie, chauffage et adoucissement de l'eau honnêtes pour les foyers bruxellois — ponctuel, à prix juste, et un peu plus respectueux de la planète.", nl: "Eerlijk loodgieters-, verwarmings- en waterontharidingswerk voor Brusselse woningen — stipt, eerlijk geprijsd en wat vriendelijker voor de planeet." })}</p>
            <a className="btn btn-accent" href="#" style={{ marginTop: 22 }} onClick={(e) => { e.preventDefault(); go("contact"); }}>
              {L(WW.ui.quote)} <Icon name="arrow" size={17} />
            </a>
          </div>
          <div>
            <h4>{L({ en: "Explore", fr: "Explorer", nl: "Verkennen" })}</h4>
            <ul>{WW.nav.map((n) => <li key={n.id}><a href="#" onClick={(e) => { e.preventDefault(); go(n.id); }}>{L(n.label)}</a></li>)}</ul>
          </div>
          <div>
            <h4>{L({ en: "Get in touch", fr: "Contact", nl: "Contact" })}</h4>
            <ul>
              <li><a href="tel:0478205025">{WW.ui.phone}</a></li>
              <li><a href={"mailto:" + WW.ui.email}>{WW.ui.email}</a></li>
              <li style={{ color: "color-mix(in srgb,var(--hero-ink) 82%,transparent)" }}>{L(WW.ui.since)}</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} WaterWorks — Wayne Pettit. {L({ en: "Brussels, Belgium.", fr: "Bruxelles, Belgique.", nl: "Brussel, België." })}</span>
          <span>{L({ en: "Registered for plumbing & gas with the Belgian authorities.", fr: "Agréé plomberie & gaz auprès des autorités belges.", nl: "Erkend voor loodgieterij & gas bij de Belgische autoriteiten." })}</span>
        </div>
      </div>
    </footer>
  );
}
