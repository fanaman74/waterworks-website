import React from 'react';

const ICONS = {
  drop: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" />,
  camera: <g><rect x="3" y="7" width="18" height="13" rx="2.5" /><path d="M8 7l1.6-2.5h4.8L16 7" /><circle cx="12" cy="13.5" r="3.2" /></g>,
  quote: <g><path d="M4 5h16v11H8l-4 4z" /><path d="M8 9.5h8M8 12.5h5" /></g>,
  bath: <g><path d="M4 12h16v3a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-3Z" /><path d="M6 12V6a2 2 0 0 1 2-2c1.2 0 1.8.8 2 1.6" /><path d="M5 18l-1 2M19 18l1 2" /></g>,
  heat: <g><path d="M8 3c1.5 2 .5 3.5 0 4.5C7 9.5 8.5 11 10 9" transform="translate(0 0)" /><path d="M9 4c.8 4-2 5-2 8a4.5 4.5 0 0 0 9 0c0-1.8-1-3-1.5-4" /></g>,
  tax: <g><circle cx="12" cy="12" r="9" /><path d="M8.5 8.5l7 7" /><circle cx="9" cy="9" r="1.3" /><circle cx="15" cy="15" r="1.3" /></g>,
  boiler: <g><rect x="6" y="3" width="12" height="18" rx="2.5" /><path d="M9 8h6M9 8v3.5a3 3 0 0 0 6 0V8" /><path d="M10 17h4" /></g>,
  water: <g><path d="M12 3s5 5.5 5 9.5A5 5 0 0 1 7 12.5C7 8.5 12 3 12 3Z" /><path d="M9.5 13a2.5 2.5 0 0 0 2.5 2.5" /></g>,
  team: <g><circle cx="8" cy="9" r="2.6" /><circle cx="16" cy="9" r="2.6" /><path d="M3.5 19c0-2.8 2-4.5 4.5-4.5s4.5 1.7 4.5 4.5M13 18.5c.3-2.2 2-3.6 3.8-3.6 2.3 0 3.7 1.6 3.7 4" /></g>,
  check: <path d="M5 12.5l4.5 4.5L19 6.5" />,
  phone: <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2 4 1.5v3c0 1-.8 1.8-1.8 1.7C12.6 19.7 4.3 11.4 3.8 5.3 3.7 4.3 4.5 3.5 5.5 3.5Z" />,
  mail: <g><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M4 7l8 6 8-6" /></g>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowR: <path d="M5 12h13M12 6l6 6-6 6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  leaf: <g><path d="M5 19c0-8 6-13 14-13 0 8-5 14-13 14" /><path d="M5 19c3-4 6-6 9-7" /></g>,
  bike: <g><circle cx="6" cy="16" r="3.2" /><circle cx="18" cy="16" r="3.2" /><path d="M6 16l4-7h5l2 7M9 9h5M14.5 6h2.5" /></g>,
  clock: <g><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></g>,
  tag: <g><path d="M4 4h7l9 9-7 7-9-9z" /><circle cx="8" cy="8" r="1.4" /></g>,
  doc: <g><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 15.5h6" /></g>,
  link: <g><path d="M10 14a4 4 0 0 0 5.7 0l2.3-2.3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0L6 12.3a4 4 0 0 0 5.7 5.7l1-1" /></g>,
  spark: <path d="M12 3l2 6 6 1-4.5 4 1.2 6L12 17l-5.7 3 1.2-6L3 10l6-1z" />,
  award: <g><circle cx="12" cy="9" r="5.5" /><path d="M9 13l-1.5 7L12 18l4.5 2L15 13" /></g>,
  pin: <g><path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></g>,
};

export function Icon({ name, size, stroke, fill, style, className }) {
  return (
    <svg viewBox="0 0 24 24" width={size || 24} height={size || 24}
      fill={fill || "none"} stroke={stroke || "currentColor"} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      {ICONS[name] || ICONS.drop}
    </svg>
  );
}

export function DropLogo({ className }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ggrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--primary-2)" />
        </linearGradient>
      </defs>
      <path d="M20 3.5S33 16 33 26a13 13 0 0 1-26 0C7 16 20 3.5 20 3.5Z" fill="url(#ggrad)" />
      <path d="M14 24a6 6 0 0 0 6 6" fill="none" stroke="var(--primary-ink)" strokeWidth="2.4" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}
