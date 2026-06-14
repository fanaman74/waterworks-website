import React, { useState, useEffect } from 'react';
import { Header, Footer, useReveal } from './components/Shared';
import { applyTheme } from './theme';
import Home from './pages/Home';
import { Services, Work, WorkDetail, Press, Training, Links, Contact } from './pages/InnerPages';
import AdminCRM from './pages/AdminCRM';
import VisitorAuthModal from './components/VisitorAuthModal';
import { supabase } from './supabase';

const TWEAK_DEFAULTS = {
  theme: "tide",
  font: "modern",
  hero: "split"
};

function parseRoute() {
  const h = (window.location.hash || "#home").replace(/^#\/?/, "");
  return h || "home";
}

export default function App() {
  const t_ = TWEAK_DEFAULTS;
  const [route, setRoute] = useState(parseRoute());

  const lang0 = (typeof localStorage !== "undefined" && localStorage.getItem("ww-lang")) || "en";
  const [lang, setLangState] = useState(lang0);

  const [visitor, setVisitor] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const setLang = (lg) => {
    setLangState(lg);
    try { localStorage.setItem("ww-lang", lg); } catch (e) {}
  };

  useEffect(() => {
    applyTheme(t_.theme, t_.font);
  }, [t_.theme, t_.font]);

  useEffect(() => {
    const onHash = () => setRoute(parseRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Restore visitor session from Supabase on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        setVisitor({ email: u.email, name: u.email.split('@')[0], provider: 'email' });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        setVisitor({ email: u.email, name: u.email.split('@')[0], provider: 'email' });
      } else {
        setVisitor(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleVisitorAuthSuccess = (user) => {
    setVisitor(user);
  };

  const handleVisitorLogout = async () => {
    await supabase.auth.signOut();
    setVisitor(null);
  };

  const go = (r) => {
    window.location.hash = "#" + r;
    setRoute(r);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  useReveal(route + ":" + t_.hero + ":" + lang);

  const base = route.split("/")[0];
  let page;

  if (base === "services") page = <Services lang={lang} go={go} />;
  else if (base === "work" && route.includes("/")) page = <WorkDetail lang={lang} go={go} id={route.split("/")[1]} />;
  else if (base === "work") page = <Work lang={lang} go={go} />;
  else if (base === "press") page = <Press lang={lang} go={go} />;
  else if (base === "training") page = <Training lang={lang} go={go} />;
  else if (base === "links") page = <Links lang={lang} go={go} />;
  else if (base === "contact") page = <Contact lang={lang} go={go} />;
  else if (base === "admin") page = <AdminCRM lang={lang} go={go} />;
  else page = <Home lang={lang} go={go} hero={t_.hero} />;

  return (
    <div className="app">
      <Header
        lang={lang}
        setLang={setLang}
        route={base}
        go={go}
        visitor={visitor}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleVisitorLogout}
      />
      <main style={{ flex: 1 }}>{page}</main>
      <Footer lang={lang} go={go} />
      <VisitorAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleVisitorAuthSuccess}
      />
      <div className="floating-lang">
        {["en", "fr", "nl"].map((lg) => (
          <button key={lg} className={lang === lg ? "on" : ""} onClick={() => setLang(lg)}>{lg.toUpperCase()}</button>
        ))}
      </div>
    </div>
  );
}
