import React, { useState } from 'react';
import { supabase } from '../supabase';
import { WW, t } from '../data';
import { Icon } from '../components/Icons';
import { Img, Eyebrow, Wave } from '../components/Shared';

/* Page Hero layout */
function PageHero({ eyebrow, title, sub }) {
  return (
    <section className="eco" style={{ paddingTop: 0 }}>
      <div className="wrap" style={{ padding: "64px 28px 76px" }}>
        <div className="reveal" style={{ maxWidth: 720 }}>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="hl" style={{ fontSize: "clamp(36px,5vw,62px)", margin: "18px 0 0" }}>{title}</h1>
          {sub && <p className="eco-lead" style={{ maxWidth: "52ch" }}>{sub}</p>}
        </div>
      </div>
      <Wave />
    </section>
  );
}

/* Mini CTA Band */
function MiniCTA({ lang, go }) {
  const L = (o) => t(o, lang);
  return (
    <section className="section" style={{ paddingTop: 16 }}>
      <div className="wrap">
        <div className="cta-band reveal">
          <div>
            <h2>{L(WW.home.ctaTitle)}</h2>
            <p>{L(WW.home.ctaSub)}</p>
          </div>
          <div className="cta-row">
            <a className="btn btn-ghost btn-lg" href="#" onClick={(e) => { e.preventDefault(); go("contact"); }}>
              {L(WW.ui.quote)} <Icon name="arrow" size={18} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Services Page */
export function Services({ lang, go }) {
  const L = (o) => t(o, lang);
  const photos = [WW.IMG.s1, WW.IMG.s2, WW.IMG.s3, WW.IMG.s4];
  return (
    <div>
      <PageHero 
        eyebrow={L({ en: "Services provided", fr: "Services proposés", nl: "Aangeboden diensten" })}
        title={L({ en: "General plumbing & heating, across Brussels.", fr: "Plomberie & chauffage, partout à Bruxelles.", nl: "Algemeen loodgieters- & verwarmingswerk in Brussel." })}
        sub={L(WW.servicesIntro)} 
      />
      <section className="section" style={{ paddingTop: 72 }}>
        <div className="wrap">
          <div className="grid-3">
            {WW.services.map((s, i) => (
              <div className="card reveal" key={i}>
                <div className="icon-badge"><Icon name={s.icon} size={26} /></div>
                <h3>{L(s.t)}</h3>
                <p>{L(s.d)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section-sm">
        <div className="wrap">
          <div className="gallery">
            {photos.map((src, i) => <div className="g reveal" key={i}><Img src={src} alt="Work in progress" /></div>)}
          </div>
        </div>
      </section>
      <MiniCTA lang={lang} go={go} />
    </div>
  );
}

/* Work grid page */
export function Work({ lang, go }) {
  const L = (o) => t(o, lang);
  return (
    <div>
      <PageHero 
        eyebrow={L({ en: "Previous work", fr: "Réalisations", nl: "Realisaties" })}
        title={L({ en: "Real Brussels homes, properly looked after.", fr: "De vrais foyers bruxellois, bien entretenus.", nl: "Echte Brusselse woningen, goed verzorgd." })}
        sub={L({ en: "A selection of projects — tap any one to see how it came together.", fr: "Une sélection de projets — cliquez pour voir comment chacun s'est concrétisé.", nl: "Een selectie projecten — klik op een project om te zien hoe het tot stand kwam." })} 
      />
      <section className="section" style={{ paddingTop: 72 }}>
        <div className="wrap">
          <div className="work-grid">
            {WW.projects.map((p) => (
              <div className="work-card reveal" key={p.id} onClick={() => go("work/" + p.id)}>
                <div className="ph">
                  <span className="tag">{L({ en: "Project", fr: "Projet", nl: "Project" })}</span>
                  <Img src={p.img} alt={L(p.t)} />
                </div>
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
      <MiniCTA lang={lang} go={go} />
    </div>
  );
}

/* WorkDetail page with dynamic project content */
export function WorkDetail({ lang, go, id }) {
  const L = (o) => t(o, lang);
  const idx = WW.projects.findIndex((p) => p.id === id);
  const p = WW.projects[idx] || WW.projects[0];
  const next = WW.projects[(idx + 1) % WW.projects.length];
  return (
    <div>
      <section className="section" style={{ paddingBottom: 40 }}>
        <div className="wrap">
          <a className="backlink reveal" href="#" onClick={(e) => { e.preventDefault(); go("work"); }}>
            <Icon name="arrow" size={16} style={{ transform: "rotate(180deg)" }} /> {L(WW.ui.backTo)}
          </a>
          <div className="detail-hero reveal" style={{ marginTop: 28 }}>
            <div>
              <Eyebrow>{L({ en: "Previous work", fr: "Réalisations", nl: "Realisaties" })}</Eyebrow>
              <h1 className="hl" style={{ fontSize: "clamp(32px,4.4vw,56px)", margin: "16px 0 18px" }}>{L(p.t)}</h1>
              <p style={{ fontSize: 18.5, color: "var(--muted)" }}>{L(p.blurb)}</p>
              <p style={{ marginTop: 18 }}>{L(p.body)}</p>
              <a className="btn btn-accent" href="#" style={{ marginTop: 26 }} onClick={(e) => { e.preventDefault(); go("contact"); }}>
                {L({ en: "Start a similar project", fr: "Lancer un projet similaire", nl: "Start een gelijkaardig project" })} <Icon name="arrow" size={17} />
              </a>
            </div>
            <div className="img"><Img src={p.img} alt={L(p.t)} /></div>
          </div>
        </div>
      </section>
      <section className="section-sm" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="gallery">
            {p.gallery.map((src, i) => <div className="g reveal" key={i}><Img src={src} alt="" /></div>)}
          </div>
        </div>
      </section>
      <section className="section-sm">
        <div className="wrap">
          <div className="row-item reveal" style={{ cursor: "pointer", alignItems: "center" }} onClick={() => go("work/" + next.id)}>
            <div className="lead-ico"><Icon name="arrowR" size={24} /></div>
            <div style={{ flex: 1 }}>
              <span className="out">{L({ en: "Next project", fr: "Projet suivant", nl: "Volgend project" })}</span>
              <h3 style={{ marginTop: 4 }}>{L(next.t)}</h3>
            </div>
          </div>
        </div>
      </section>
      <MiniCTA lang={lang} go={go} />
    </div>
  );
}

/* Press Page */
export function Press({ lang, go }) {
  const L = (o) => t(o, lang);
  return (
    <div>
      <PageHero eyebrow={L(WW.press.title)} title={L({ en: "In the press.", fr: "Dans la presse.", nl: "In de pers." })} sub={L(WW.press.lead)} />
      <section className="section" style={{ paddingTop: 72 }}>
        <div className="wrap">
          <div className="row-list" style={{ maxWidth: 880, margin: "0 auto" }}>
            {WW.press.items.map((it, i) => (
              <div className="row-item reveal" key={i}>
                <div className="lead-ico"><Icon name="doc" size={24} /></div>
                <div>
                  <span className="out">{it.outlet} · {it.date}</span>
                  <h3 style={{ marginTop: 6 }}>{L(it.t)}</h3>
                  <p>{L(it.d)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <MiniCTA lang={lang} go={go} />
    </div>
  );
}

/* Training / Credentials Page */
export function Training({ lang, go }) {
  const L = (o) => t(o, lang);
  const icons = ["award", "spark", "water", "heat"];
  return (
    <div>
      <PageHero 
        eyebrow={L({ en: "Training & updates", fr: "Formations & mises à jour", nl: "Opleidingen & updates" })} 
        title={L({ en: "Always up to code.", fr: "Toujours aux normes.", nl: "Altijd conform." })} 
        sub={L(WW.training.lead)} 
      />
      <section className="section" style={{ paddingTop: 72 }}>
        <div className="wrap">
          <div className="grid-2">
            {WW.training.items.map((it, i) => (
              <div className="row-item reveal" key={i}>
                <div className="lead-ico"><Icon name={icons[i % icons.length]} size={24} /></div>
                <div>
                  <h3>{L(it.t)}</h3>
                  <p>{L(it.d)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <MiniCTA lang={lang} go={go} />
    </div>
  );
}

/* Links Page */
export function Links({ lang, go }) {
  const L = (o) => t(o, lang);
  return (
    <div>
      <PageHero eyebrow={L(WW.links.title)} title={L({ en: "Useful links.", fr: "Liens utiles.", nl: "Nuttige links." })} sub={L(WW.links.lead)} />
      <section className="section" style={{ paddingTop: 72 }}>
        <div className="wrap">
          <div className="grid-2">
            {WW.links.items.map((it, i) => (
              <a className="row-item reveal" key={i} href="#" onClick={(e) => e.preventDefault()}>
                <div className="lead-ico"><Icon name="link" size={24} /></div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {it.t} <Icon name="arrowR" size={17} style={{ color: "var(--primary)" }} />
                  </h3>
                  <p>{L(it.d)}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
      <MiniCTA lang={lang} go={go} />
    </div>
  );
}

/* Contact Page with chip inputs and validation error indicators */
export function Contact({ lang, go }) {
  const L = (o) => t(o, lang);
  const C = WW.contact;
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", message: "" });
  const [type, setType] = useState(0);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = true;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = true;
    setErrors(errs);

    if (Object.keys(errs).length === 0) {
      const service_type = C.types[type] ? L(C.types[type]) : 'General';
      const { error } = await supabase.from('leads').insert({
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        message: form.message,
        service_type
      });
      if (error) {
        console.error(error);
        alert('Could not send message. Please try again or call directly.');
      } else {
        setSent(true);
      }
    }
  };

  return (
    <div>
      <section className="section">
        <div className="wrap">
          <div className="contact-grid">
            <aside className="contact-aside reveal">
              <Eyebrow>{L({ en: "Contact", fr: "Contact", nl: "Contact" })}</Eyebrow>
              <h2>{L(C.title)}</h2>
              <p>{L(C.lead)}</p>
              <div className="emergency-box">
                <div className="lbl">{L(WW.ui.emergency)}</div>
                <a className="num" href="tel:0478205025" style={{ color: "var(--accent-ink)" }}>
                  <Icon name="phone" size={26} /> {WW.ui.phone}
                </a>
              </div>
              <div className="contact-line">
                <Icon name="mail" /> <a href={"mailto:" + WW.ui.email} style={{ color: "inherit" }}>{WW.ui.email}</a>
              </div>
              <div className="contact-line">
                <Icon name="pin" /> {L({ en: "Brussels & surrounding areas", fr: "Bruxelles & environs", nl: "Brussel & omgeving" })}
              </div>
              <div className="contact-line">
                <Icon name="bike" /> {L({ en: "Quotes by e-bike where possible", fr: "Devis à vélo électrique si possible", nl: "Offertes met de e-bike waar mogelijk" })}
              </div>
              <div className="contact-line">
                <Icon name="clock" /> {L(WW.ui.since)}
              </div>
            </aside>

            <div className="form-card reveal">
              {sent ? (
                <div className="success">
                  <div className="ok"><Icon name="check" size={34} /></div>
                  <h3>{L(C.success)}</h3>
                  <p>{L({ en: "I'll usually reply within a day.", fr: "Je réponds généralement sous un jour.", nl: "Ik antwoord meestal binnen een dag." })}</p>
                  <p className="note">{L(C.successNote)}</p>
                  <a className="btn btn-ghost" href="#" style={{ marginTop: 20 }} onClick={(e) => {
                    e.preventDefault();
                    setSent(false);
                    setForm({ name: "", email: "", phone: "", address: "", message: "" });
                  }}>{L({ en: "Send another", fr: "Envoyer un autre", nl: "Nog een versturen" })}</a>
                </div>
              ) : (
                <form onSubmit={submit} noValidate>
                  <div className="field">
                    <label>{L(C.fields.type)}</label>
                    <div className="type-chips">
                      {C.types.map((ty, i) => (
                        <button type="button" key={i} className={"type-chip" + (type === i ? " on" : "")} onClick={() => setType(i)}>{L(ty)}</button>
                      ))}
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label>{L(C.fields.name)}</label>
                      <input 
                        value={form.name} 
                        onChange={set("name")} 
                        style={errors.name ? { borderColor: "var(--accent)" } : {}} 
                        placeholder="Wayne Pettit" 
                      />
                    </div>
                    <div className="field">
                      <label>{L(C.fields.email)}</label>
                      <input 
                        value={form.email} 
                        onChange={set("email")} 
                        type="email" 
                        style={errors.email ? { borderColor: "var(--accent)" } : {}} 
                        placeholder="you@email.com" 
                      />
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label>{L(C.fields.phone)}</label>
                      <input value={form.phone} onChange={set("phone")} placeholder="+32 …" />
                    </div>
                    <div className="field">
                      <label>{L(C.fields.address)}</label>
                      <input value={form.address} onChange={set("address")} placeholder="1050 Ixelles" />
                    </div>
                  </div>
                  <div className="field">
                    <label>{L(C.fields.message)}</label>
                    <textarea 
                      value={form.message} 
                      onChange={set("message")} 
                      placeholder={L({ en: "A few details about the job…", fr: "Quelques détails sur le chantier…", nl: "Wat details over de klus…" })}
                    ></textarea>
                  </div>
                  <button className="btn btn-accent btn-lg" type="submit" style={{ width: "100%" }}>
                    {L(C.fields.send)} <Icon name="arrow" size={18} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
