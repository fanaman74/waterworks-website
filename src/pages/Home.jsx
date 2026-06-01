import React from 'react';
import { WW, t } from '../data';
import { Icon } from '../components/Icons';
import { Img, Eyebrow, SectionHead, Wave } from '../components/Shared';

/* Hero Split Layout */
function HeroSplit({ lang, go, L }) {
  const h = WW.home;
  return (
    <section className="hero hero-split split">
      <div className="wrap">
        <div className="grid">
          <div className="reveal">
            <Eyebrow className="hero-eyebrow">{L(h.eyebrow)}</Eyebrow>
            <h1 className="hl" style={{ margin: "20px 0 24px" }}>{L(h.headline)}</h1>
            <p className="hero-sub">{L(h.sub)}</p>
            <div className="cta-row" style={{ marginTop: 32 }}>
              <a className="btn btn-accent btn-lg" href="#" onClick={(e) => { e.preventDefault(); go("contact"); }}>
                {L(WW.ui.quote)} <Icon name="arrow" size={18} />
              </a>
              <a className="btn btn-on-dark btn-lg" href="tel:0478205025">
                <Icon name="phone" size={18} /> {WW.ui.phone}
              </a>
            </div>
            <div className="statrow">
              {h.stats.map((s, i) => (
                <div className="stat" key={i}>
                  <div className="n" style={{ color: "var(--hero-eyebrow)" }}>{s.n}</div>
                  <div className="l" style={{ color: "color-mix(in srgb,var(--hero-ink) 70%,transparent)" }}>{L(s.l)}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-photo reveal">
            <div className="frame"><Img src={WW.IMG.bathroom} alt="Recent bathroom work" /></div>
            <div className="hero-badge">
              <div className="big">{L(WW.ui.since)}</div>
            </div>
          </div>
        </div>
      </div>
      <Wave />
    </section>
  );
}

/* Hero Overlay Layout */
function HeroOverlay({ lang, go, L }) {
  const h = WW.home;
  return (
    <section className="hero hero-overlay">
      <div className="bgimg"><Img src={WW.IMG.bathroom} alt="" /></div>
      <div className="scrim"></div>
      <div className="wrap inner">
        <div className="reveal" style={{ maxWidth: 760 }}>
          <Eyebrow className="hero-eyebrow" style={{ color: "#fff" }}><span style={{ color: "#fff" }}>{L(h.eyebrow)}</span></Eyebrow>
          <h1 className="hl" style={{ margin: "18px 0 22px", color: "#fff" }}>{L(h.headline)}</h1>
          <p className="hero-sub">{L(h.sub)}</p>
          <div className="cta-row" style={{ marginTop: 30 }}>
            <a className="btn btn-accent btn-lg" href="#" onClick={(e) => { e.preventDefault(); go("contact"); }}>
              {L(WW.ui.quote)} <Icon name="arrow" size={18} />
            </a>
            <a className="btn btn-on-dark btn-lg" href="tel:0478205025">
              <Icon name="phone" size={18} /> {WW.ui.phone}
            </a>
          </div>
        </div>
        <div className="infobar reveal">
          {h.stats.map((s, i) => (
            <div className="cell" key={i}>
              <div className="stat">
                <div className="n">{s.n}</div>
                <div className="l">{L(s.l)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Hero Editorial Layout */
function HeroEditorial({ lang, go, L }) {
  const h = WW.home;
  return (
    <section className="hero hero-editorial editorial">
      <div className="wrap inner">
        <div className="reveal">
          <Eyebrow>{L(h.eyebrow)}</Eyebrow>
          <h1 className="hl" style={{ margin: "22px 0 0" }}>{L(h.headline)}</h1>
        </div>
        <div className="reveal" style={{ display: "flex", flexWrap: "wrap", gap: 28, alignItems: "flex-end", justifyContent: "space-between", marginTop: 26 }}>
          <p className="hero-sub" style={{ color: "var(--muted)", maxWidth: "42ch" }}>{L(h.sub)}</p>
          <div className="cta-row">
            <a className="btn btn-accent btn-lg" href="#" onClick={(e) => { e.preventDefault(); go("contact"); }}>
              {L(WW.ui.quote)} <Icon name="arrow" size={18} />
            </a>
            <a className="btn btn-ghost btn-lg" href="tel:0478205025">
              <Icon name="phone" size={18} /> {WW.ui.phone}
            </a>
          </div>
        </div>
        <div className="photo-card reveal">
          <Img src={WW.IMG.bathroom} alt="Recent work" />
          <div className="photo-tag">
            <Icon name="pin" size={16} style={{ color: "var(--primary)" }} /> Brussels · {L({ en: "recent work", fr: "travaux récents", nl: "recent werk" })}
          </div>
        </div>
        <div className="statrow reveal" style={{ paddingBottom: 8 }}>
          {h.stats.map((s, i) => (
            <div className="stat" key={i}>
              <div className="n">{s.n}</div>
              <div className="l">{L(s.l)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Service Ticker Marquee */
function ServiceTicker() {
  const names = WW.services.map((s) => s.t.en);
  const run = [...names, ...names];
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {run.map((n, i) => <span key={i}>{n}</span>)}
      </div>
    </div>
  );
}

/* Home Component */
export default function Home({ lang, go, hero }) {
  const L = (o) => t(o, lang);
  const h = WW.home;
  const HeroComp = hero === "overlay" ? HeroOverlay : hero === "editorial" ? HeroEditorial : HeroSplit;

  return (
    <div>
      <HeroComp lang={lang} go={go} L={L} />
      <ServiceTicker />

      {/* intro + promises */}
      <section className="section">
        <div className="wrap">
          <div className="grid-2" style={{ gap: 56, alignItems: "center" }}>
            <div className="reveal">
              <Eyebrow>{L(h.introTitle)}</Eyebrow>
              <h2 style={{ fontSize: "clamp(28px,3.6vw,42px)", margin: "16px 0 18px" }}>
                {L({
                  en: "An English plumber who treats your home like his own.",
                  fr: "Un plombier anglais qui traite votre maison comme la sienne.",
                  nl: "Een Engelse loodgieter die uw huis behandelt als het zijne."
                })}
              </h2>
              <p style={{ color: "var(--muted)", fontSize: 17.5 }}>{L(h.intro)}</p>
            </div>
            <div className="reveal" style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 12px 36px rgba(0, 0, 0, 0.12)", border: "1px solid var(--line)", width: "100%" }}>
                <Img src={WW.IMG.work} alt="Wayne Pettit plumbing work" style={{ width: "100%", height: "auto", display: "block" }} />
              </div>
            </div>
          </div>

          {/* Smaller promise cards at the bottom */}
          <div className="grid-3" style={{ marginTop: 48, gap: 24 }}>
            {h.promises.map((p, i) => (
              <div className="promise-card reveal" style={{ padding: "20px 24px" }} key={i}>
                <div className="num" style={{ fontSize: 13, letterSpacing: ".08em" }}>0{i + 1}</div>
                <h3 style={{ fontSize: 18, margin: "8px 0" }}>{L(p.t)}</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.4 }}>{L(p.d)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* eco */}
      <section className="eco" style={{ paddingBottom: 92 }}>
        <Wave up />
        <div className="wrap" style={{ paddingTop: 28 }}>
          <div className="eco-grid">
            <div className="reveal">
              <Eyebrow>{L({ en: "Sustainability", fr: "Durabilité", nl: "Duurzaamheid" })}</Eyebrow>
              <h2 style={{ marginTop: 16 }}>{L(h.ecoTitle)}</h2>
              <p className="eco-lead">{L(h.ecoLead)}</p>
              <ul className="eco-list">
                {h.ecoPoints.map((pt, i) => (
                  <li key={i}>
                    <span className="tick"><Icon name="check" size={14} /></span>
                    {L(pt)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="eco-photo reveal">
              <Img src={WW.IMG.bike} alt="Wayne's e-bike for quotes" />
            </div>
          </div>
        </div>
      </section>

      {/* services preview */}
      <section className="section">
        <div className="wrap">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20, marginBottom: 34 }}>
            <SectionHead 
              eyebrow={L({ en: "What I do", fr: "Ce que je fais", nl: "Wat ik doe" })} 
              title={L({ en: "Everything from a dripping tap to a full renovation.", fr: "Du robinet qui goutte à la rénovation complète.", nl: "Van een lekkende kraan tot een volledige renovatie." })} 
            />
            <a className="btn btn-ghost reveal" href="#" onClick={(e) => { e.preventDefault(); go("services"); }}>
              {L(WW.ui.viewAll)} <Icon name="arrow" size={17} />
            </a>
          </div>
          <div className="grid-3">
            {WW.services.slice(0, 6).map((s, i) => (
              <div className="card reveal" key={i}>
                <div className="icon-badge"><Icon name={s.icon} size={26} /></div>
                <h3>{L(s.t)}</h3>
                <p>{L(s.d)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* featured work */}
      <section className="section" style={{ background: "var(--surface-2)", paddingTop: 80, paddingBottom: 80 }}>
        <div className="wrap">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20, marginBottom: 34 }}>
            <SectionHead 
              eyebrow={L({ en: "Previous work", fr: "Réalisations", nl: "Realisaties" })} 
              title={L({ en: "A few jobs I'm proud of.", fr: "Quelques chantiers dont je suis fier.", nl: "Enkele klussen waar ik trots op ben." })} 
            />
            <a className="btn btn-ghost reveal" href="#" onClick={(e) => { e.preventDefault(); go("work"); }}>
              {L(WW.ui.viewWork)} <Icon name="arrow" size={17} />
            </a>
          </div>
          <div className="work-grid">
            {WW.projects.slice(0, 2).map((p) => (
              <div className="work-card reveal" key={p.id} onClick={() => go("work/" + p.id)}>
                <div className="ph"><Img src={p.img} alt={L(p.t)} /></div>
                <div className="meta">
                  <h3>{L(p.t)}</h3>
                  <p>{L(p.blurb)}</p>
                  <span className="go">{L(WW.ui.learnMore)} <Icon name="arrowR" size={16} /></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="cta-band reveal">
            <div>
              <h2>{L(h.ctaTitle)}</h2>
              <p>{L(h.ctaSub)}</p>
            </div>
            <div className="cta-row">
              <a className="btn btn-ghost btn-lg" href="#" onClick={(e) => { e.preventDefault(); go("contact"); }}>
                {L(WW.ui.quote)} <Icon name="arrow" size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
