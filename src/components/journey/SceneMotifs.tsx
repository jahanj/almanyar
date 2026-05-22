import React from 'react';

/**
 * Supplementary SVG motifs for the cinematic journey:
 *  - AirportTower (Iran)         — IKA-style control tower silhouette
 *  - Passport / BoardingPass     — flight transition props
 *  - ExamPaper                   — Turkey preparation prop
 *  - TrainSBahn                  — Germany arrival prop
 *  - UniversityGate              — Germany aspiration prop
 *  - FlagRibbon                  — narrow flag strip used as scene accent
 *
 * All motifs use `fill="currentColor"` (or accept a `tone` prop) so they
 * inherit the active scene's flag accent.
 */

export function AirportTower(props: { className?: string }): JSX.Element {
  return (
    <svg
      viewBox="0 0 200 260"
      preserveAspectRatio="xMidYMax meet"
      fill="currentColor"
      aria-hidden="true"
      className={props.className}
    >
      {/* terminal base */}
      <rect x="20" y="220" width="160" height="40" rx="3" />
      {/* tower shaft */}
      <rect x="92" y="60" width="16" height="170" />
      {/* control deck */}
      <path d="M70,60 L130,60 L120,30 L80,30 Z" />
      {/* observation cap */}
      <rect x="84" y="14" width="32" height="14" rx="3" />
      {/* antenna */}
      <rect x="98" y="0" width="4" height="16" />
      <circle cx="100" cy="2" r="3" fill="white" fillOpacity="0.9" />
      {/* deck lights */}
      <circle cx="80" cy="46" r="2" fill="white" fillOpacity="0.7" />
      <circle cx="100" cy="46" r="2" fill="white" fillOpacity="0.7" />
      <circle cx="120" cy="46" r="2" fill="white" fillOpacity="0.7" />
    </svg>
  );
}

export function Passport(props: { className?: string }): JSX.Element {
  return (
    <svg
      viewBox="0 0 220 280"
      fill="currentColor"
      aria-hidden="true"
      className={props.className}
    >
      <rect x="14" y="14" width="192" height="252" rx="14" />
      <rect x="14" y="14" width="192" height="252" rx="14" fill="white" fillOpacity="0.06" />
      <circle cx="110" cy="120" r="34" fill="white" fillOpacity="0.85" />
      <circle cx="110" cy="120" r="22" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M110,86 L110,154 M76,120 L144,120 M86,98 Q110,86 134,98 M86,142 Q110,154 134,142" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="48" y="186" width="124" height="6" fill="white" fillOpacity="0.85" />
      <rect x="48" y="202" width="92" height="5" fill="white" fillOpacity="0.6" />
      <rect x="48" y="218" width="108" height="5" fill="white" fillOpacity="0.6" />
      <rect x="48" y="234" width="72" height="5" fill="white" fillOpacity="0.4" />
    </svg>
  );
}

export function BoardingPass(props: { className?: string }): JSX.Element {
  return (
    <svg
      viewBox="0 0 360 160"
      fill="currentColor"
      aria-hidden="true"
      className={props.className}
    >
      <rect x="6" y="6" width="348" height="148" rx="10" fill="white" fillOpacity="0.95" />
      <rect x="6" y="6" width="348" height="148" rx="10" fill="none" stroke="currentColor" strokeOpacity="0.2" />
      <text x="22" y="42" fontSize="14" fontFamily="system-ui" fontWeight="700" fill="currentColor">BOARDING PASS</text>
      <line x1="22" y1="56" x2="338" y2="56" stroke="currentColor" strokeOpacity="0.15" />
      <text x="22" y="92" fontSize="34" fontFamily="system-ui" fontWeight="800" fill="currentColor">IKA</text>
      <path d="M88,86 L132,86 M124,80 L132,86 L124,92" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <text x="142" y="92" fontSize="34" fontFamily="system-ui" fontWeight="800" fill="currentColor">IST</text>
      <path d="M202,86 L246,86 M238,80 L246,86 L238,92" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <text x="256" y="92" fontSize="34" fontFamily="system-ui" fontWeight="800" fill="currentColor">BER</text>
      <text x="22" y="124" fontSize="11" fontFamily="system-ui" fill="currentColor" fillOpacity="0.6">PASSENGER · ALMANYAR</text>
      <rect x="270" y="108" width="68" height="24" fill="currentColor" fillOpacity="0.12" />
      <text x="278" y="125" fontSize="11" fontFamily="system-ui" fontWeight="700" fill="currentColor">GATE 22B</text>
    </svg>
  );
}

export function ExamPaper(props: { className?: string }): JSX.Element {
  return (
    <svg
      viewBox="0 0 220 280"
      fill="currentColor"
      aria-hidden="true"
      className={props.className}
    >
      <rect x="18" y="14" width="184" height="252" rx="6" fill="white" fillOpacity="0.96" />
      <rect x="18" y="14" width="184" height="252" rx="6" fill="none" stroke="currentColor" strokeOpacity="0.2" />
      <rect x="36" y="36" width="120" height="10" fill="currentColor" fillOpacity="0.85" />
      <rect x="36" y="58" width="148" height="5" fill="currentColor" fillOpacity="0.35" />
      <rect x="36" y="70" width="120" height="5" fill="currentColor" fillOpacity="0.35" />

      {[100, 130, 160, 190, 220].map((y) => (
        <g key={y}>
          <circle cx="46" cy={y} r="7" fill="none" stroke="currentColor" strokeWidth="2" />
          <rect x="62" y={y - 4} width="120" height="8" fill="currentColor" fillOpacity="0.5" />
        </g>
      ))}
      <path d="M40,158 L48,166 L58,150" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M40,188 L48,196 L58,180" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function TrainSBahn(props: { className?: string }): JSX.Element {
  return (
    <svg
      viewBox="0 0 480 160"
      fill="currentColor"
      aria-hidden="true"
      className={props.className}
    >
      {/* body */}
      <path d="M14,46 Q14,30 34,30 L444,30 Q468,30 466,52 L466,118 Q466,128 454,128 L26,128 Q14,128 14,118 Z" />
      {/* aerodynamic nose highlight */}
      <path d="M444,30 Q468,30 466,52 L466,72 L420,52 Z" fill="white" fillOpacity="0.18" />
      {/* windshield */}
      <path d="M420,46 Q446,46 452,66 L452,86 L410,86 Z" fill="white" fillOpacity="0.85" />
      {/* side windows */}
      {[40, 100, 160, 220, 280, 340].map((x) => (
        <rect key={x} x={x} y="56" width="44" height="28" rx="2" fill="white" fillOpacity="0.78" />
      ))}
      {/* doors */}
      <rect x="220" y="56" width="6" height="56" fill="currentColor" fillOpacity="0.45" />
      <rect x="86" y="56" width="6" height="56" fill="currentColor" fillOpacity="0.45" />
      {/* skirt */}
      <rect x="14" y="116" width="452" height="14" fill="currentColor" fillOpacity="0.45" />
      {/* wheels */}
      <circle cx="80" cy="138" r="14" />
      <circle cx="80" cy="138" r="6" fill="white" fillOpacity="0.85" />
      <circle cx="380" cy="138" r="14" />
      <circle cx="380" cy="138" r="6" fill="white" fillOpacity="0.85" />
      {/* S-Bahn roundel */}
      <circle cx="42" cy="42" r="11" fill="white" fillOpacity="0.9" />
      <text x="42" y="46" fontSize="14" textAnchor="middle" fontFamily="system-ui" fontWeight="900" fill="currentColor">S</text>
    </svg>
  );
}

export function UniversityGate(props: { className?: string }): JSX.Element {
  return (
    <svg
      viewBox="0 0 320 260"
      preserveAspectRatio="xMidYMax meet"
      fill="currentColor"
      aria-hidden="true"
      className={props.className}
    >
      {/* base */}
      <rect x="0" y="240" width="320" height="20" />
      {/* steps */}
      <rect x="20" y="226" width="280" height="14" fillOpacity="0.85" />
      <rect x="40" y="212" width="240" height="14" fillOpacity="0.7" />
      {/* portico floor */}
      <rect x="50" y="200" width="220" height="12" />
      {/* columns */}
      {[68, 110, 152, 194, 236].map((x) => (
        <g key={x}>
          <rect x={x - 8} y="100" width="16" height="100" />
          <rect x={x - 12} y="96" width="24" height="6" fillOpacity="0.85" />
          <rect x={x - 12} y="200" width="24" height="6" fillOpacity="0.85" />
        </g>
      ))}
      {/* architrave */}
      <rect x="36" y="84" width="248" height="14" />
      {/* pediment */}
      <polygon points="36,84 160,30 284,84" />
      {/* roundel */}
      <circle cx="160" cy="64" r="10" fill="white" fillOpacity="0.9" />
      <text x="160" y="68" fontSize="12" fontFamily="system-ui" fontWeight="900" textAnchor="middle" fill="currentColor">U</text>
    </svg>
  );
}

export function FlagRibbon({
  className,
  stops,
  vertical = false,
}: {
  className?: string;
  stops: string[];
  vertical?: boolean;
}): JSX.Element {
  const direction = vertical ? 'to bottom' : 'to right';
  const bg = `linear-gradient(${direction}, ${stops.map((c, i) => `${c} ${(i / (stops.length - 1)) * 100}%`).join(', ')})`;
  return <div className={className} style={{ background: bg }} aria-hidden="true" />;
}

/** A soft film-grain overlay rendered via SVG turbulence — gives every scene a
 *  filmic, premium feel. ~6kb DOM cost; SSR-safe; GPU-cheap. */
export function FilmGrain({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      className={className}
      aria-hidden="true"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
    >
      <filter id="cinematic-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#cinematic-grain)" opacity="0.6" />
    </svg>
  );
}
