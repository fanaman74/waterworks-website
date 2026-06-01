/* WaterWorks — theme system: 3 directions, 3 font pairings, hero layouts. */
export const WW_THEMES = {
  tide: {
    name: "Tide",
    desc: "Fresh water",
    dark: false,
    vars: {
      "--bg": "#eef6f8",
      "--surface": "#ffffff",
      "--surface-2": "#f3fafb",
      "--ink": "#0c2a33",
      "--muted": "#4d6a72",
      "--line": "#d4e7ec",
      "--primary": "#0e8aa0",
      "--primary-2": "#0a6e80",
      "--primary-ink": "#ffffff",
      "--accent": "#ff6a4d",
      "--accent-2": "#ef4f30",
      "--accent-ink": "#ffffff",
      "--hero-bg": "#0c2a33",
      "--hero-ink": "#eaf7fa",
      "--hero-eyebrow": "#7fd6e3",
      "--wave": "#bfe4ea",
      "--chip": "#e2f1f4",
      "--ring": "rgba(14,138,160,.35)",
    },
  },
  meadow: {
    name: "Meadow",
    desc: "Eco / natural",
    dark: false,
    vars: {
      "--bg": "#f5f2e7",
      "--surface": "#fffefa",
      "--surface-2": "#f1efe2",
      "--ink": "#1b2a1f",
      "--muted": "#566453",
      "--line": "#e1dcc8",
      "--primary": "#2f7d52",
      "--primary-2": "#266642",
      "--primary-ink": "#ffffff",
      "--accent": "#d9663b",
      "--accent-2": "#c2522a",
      "--accent-ink": "#ffffff",
      "--hero-bg": "#1b2a1f",
      "--hero-ink": "#f0efe2",
      "--hero-eyebrow": "#9bcfa6",
      "--wave": "#d7e6c8",
      "--chip": "#e8ecdb",
      "--ring": "rgba(47,125,82,.35)",
    },
  },
  current: {
    name: "Current",
    desc: "Bold energy",
    dark: true,
    vars: {
      "--bg": "#0b1822",
      "--surface": "#10222f",
      "--surface-2": "#0e1d28",
      "--ink": "#e9f6f8",
      "--muted": "#90b1bd",
      "--line": "rgba(255,255,255,.12)",
      "--primary": "#2fe3c7",
      "--primary-2": "#19c9ad",
      "--primary-ink": "#04221d",
      "--accent": "#ff6a4d",
      "--accent-2": "#ff4f30",
      "--accent-ink": "#22100b",
      "--hero-bg": "#081019",
      "--hero-ink": "#eafafb",
      "--hero-eyebrow": "#2fe3c7",
      "--wave": "rgba(47,227,199,.18)",
      "--chip": "rgba(47,227,199,.12)",
      "--ring": "rgba(47,227,199,.4)",
    },
  },
};

export const WW_FONTS = {
  modern: {
    name: "Modern grotesk",
    vars: {
      "--font-display": "'Bricolage Grotesque', sans-serif",
      "--font-body": "'Hanken Grotesk', sans-serif",
      "--display-weight": "700",
      "--display-spacing": "-0.02em",
    },
  },
  technical: {
    name: "Technical",
    vars: {
      "--font-display": "'Space Grotesk', sans-serif",
      "--font-body": "'IBM Plex Sans', sans-serif",
      "--display-weight": "600",
      "--display-spacing": "-0.015em",
    },
  },
  editorial: {
    name: "Editorial",
    vars: {
      "--font-display": "'Instrument Serif', serif",
      "--font-body": "'Hanken Grotesk', sans-serif",
      "--display-weight": "400",
      "--display-spacing": "0em",
    },
  },
};

export const WW_HEROES = ["split", "overlay", "editorial"];

export function applyTheme(themeKey, fontKey) {
  const root = document.documentElement;
  const theme = WW_THEMES[themeKey] || WW_THEMES.tide;
  const font = WW_FONTS[fontKey] || WW_FONTS.modern;
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  Object.entries(font.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  root.setAttribute("data-theme-dark", theme.dark ? "true" : "false");
}
