import React, { useState, useEffect } from 'react';
import { Header, Footer, useReveal } from './components/Shared';
import { applyTheme } from './theme';
import Home from './pages/Home';
import { Services, Work, WorkDetail, Press, Training, Links, Contact } from './pages/InnerPages';
import AdminCRM from './pages/AdminCRM';
import VisitorAuthModal from './components/VisitorAuthModal';

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
  
  // Persist language in localStorage
  const lang0 = (typeof localStorage !== "undefined" && localStorage.getItem("ww-lang")) || "en";
  const [lang, setLangState] = useState(lang0);

  const [visitor, setVisitor] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const setLang = (lg) => {
    setLangState(lg);
    try {
      localStorage.setItem("ww-lang", lg);
    } catch (e) {
      console.warn("Could not save language to localStorage:", e);
    }
  };

  // Re-apply theme dynamically when theme or font settings change
  useEffect(() => {
    applyTheme(t_.theme, t_.font);
  }, [t_.theme, t_.font]);

  // Route updates
  useEffect(() => {
    const onHash = () => setRoute(parseRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Validate session token on page load
  useEffect(() => {
    const storedToken = localStorage.getItem('ww-visitor-token');
    if (storedToken) {
      fetch('/api/visitor/me', {
        headers: { 'Authorization': `Bearer ${storedToken}` }
      })
      .then(res => {
        if (!res.ok) throw new Error('Session invalid');
        return res.json();
      })
      .then(data => {
        setVisitor(data.user);
      })
      .catch(() => {
        localStorage.removeItem('ww-visitor-token');
      });
    }
  }, []);

  // Listen for postMessage events from the Google Sign-in popup
  useEffect(() => {
    const handleGoogleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data && event.data.type === 'GOOGLE_LOGIN_SUCCESS') {
        const { email, name } = event.data.user;
        
        fetch('/api/visitor/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name })
        })
        .then(res => {
          if (!res.ok) throw new Error('Backend failed to create Google visitor session');
          return res.json();
        })
        .then(data => {
          localStorage.setItem('ww-visitor-token', data.token);
          setVisitor(data.user);
          setIsAuthModalOpen(false);
        })
        .catch(err => {
          console.error('Google Auth backend error:', err);
          alert('Failed to sign in with Google. Please try again.');
        });
      }
    };

    window.addEventListener('message', handleGoogleMessage);
    return () => window.removeEventListener('message', handleGoogleMessage);
  }, []);

  const handleVisitorAuthSuccess = (user, token) => {
    localStorage.setItem('ww-visitor-token', token);
    setVisitor(user);
  };

  const handleVisitorLogout = () => {
    localStorage.removeItem('ww-visitor-token');
    setVisitor(null);
  };

  const go = (r) => {
    window.location.hash = "#" + r;
    setRoute(r);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  // Register reveal effect hook
  useReveal(route + ":" + t_.hero + ":" + lang);

  const base = route.split("/")[0];
  let page;
  
  if (base === "services") {
    page = <Services lang={lang} go={go} />;
  } else if (base === "work" && route.includes("/")) {
    page = <WorkDetail lang={lang} go={go} id={route.split("/")[1]} />;
  } else if (base === "work") {
    page = <Work lang={lang} go={go} />;
  } else if (base === "press") {
    page = <Press lang={lang} go={go} />;
  } else if (base === "training") {
    page = <Training lang={lang} go={go} />;
  } else if (base === "links") {
    page = <Links lang={lang} go={go} />;
  } else if (base === "contact") {
    page = <Contact lang={lang} go={go} />;
  } else if (base === "admin") {
    page = <AdminCRM lang={lang} go={go} />;
  } else {
    page = <Home lang={lang} go={go} hero={t_.hero} />;
  }

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
