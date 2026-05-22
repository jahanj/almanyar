import React from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   TehranSkyline
   Landmarks: Milad Tower, Azadi Tower (inverted-Y arch), Alborz mountains,
              modern high-rises, night sky with moon.
   viewBox: 0 0 1440 360   buildings rise from the bottom edge.
───────────────────────────────────────────────────────────────────────────── */
export function TehranSkyline(props: { className?: string }): JSX.Element {
  return (
    <svg
      viewBox="0 0 1440 360"
      preserveAspectRatio="xMidYMax meet"
      fill="currentColor"
      aria-hidden="true"
      className={props.className}
    >
      {/* ── Alborz mountain range ── */}
      <polygon points="0,220 80,140 160,170 260,100 360,155 460,90 560,145 660,110 760,150 860,95 960,145 1060,105 1160,155 1260,120 1360,160 1440,130 1440,360 0,360" fillOpacity="0.35" />
      {/* second closer ridge */}
      <polygon points="0,250 100,190 200,215 300,175 400,205 500,170 600,200 700,185 800,215 900,178 1000,210 1100,185 1200,218 1300,195 1440,215 1440,360 0,360" fillOpacity="0.55" />

      {/* ── Generic city blocks – left cluster ── */}
      <rect x="30" y="280" width="45" height="80" />
      <rect x="85" y="265" width="35" height="95" />
      <rect x="130" y="275" width="50" height="85" />
      <rect x="190" y="255" width="30" height="105" />
      <rect x="230" y="270" width="40" height="90" />
      <rect x="280" y="260" width="28" height="100" />

      {/* ── Azadi Tower (inverted-Y arch monument) center-left ── */}
      {/* arch legs */}
      <path d="M370,360 L390,290 Q400,270 410,260 Q420,250 430,260 Q440,270 450,290 L470,360 Z" />
      {/* arch bridge / cap */}
      <path d="M385,285 Q420,235 455,285 L458,305 Q420,255 382,305 Z" />
      {/* center column rising from arch */}
      <rect x="414" y="235" width="12" height="30" />
      {/* top platform detail */}
      <rect x="408" y="230" width="24" height="8" />
      <rect x="415" y="210" width="10" height="22" />

      {/* ── Mid-city blocks ── */}
      <rect x="500" y="272" width="38" height="88" />
      <rect x="548" y="258" width="32" height="102" />
      <rect x="590" y="268" width="44" height="92" />
      <rect x="644" y="248" width="36" height="112" />
      <rect x="690" y="265" width="28" height="95" />

      {/* ── Milad Tower (shaft + bulbous pod + antenna) ── */}
      {/* base / foundation */}
      <rect x="742" y="330" width="36" height="30" />
      {/* tapered shaft */}
      <path d="M750,330 L752,220 L758,160 L760,120 L762,160 L768,220 L770,330 Z" />
      {/* observation pod (fat ovoid) */}
      <ellipse cx="760" cy="110" rx="22" ry="16" />
      {/* pod deck ring */}
      <rect x="736" y="119" width="48" height="6" />
      {/* secondary deck */}
      <rect x="740" y="126" width="40" height="5" />
      {/* antenna */}
      <rect x="758" y="60" width="4" height="52" />
      {/* antenna tip blink */}
      <circle cx="760" cy="58" r="3" fill="white" fillOpacity="0.85" />

      {/* ── Right city cluster ── */}
      <rect x="810" y="265" width="42" height="95" />
      <rect x="862" y="250" width="34" height="110" />
      <rect x="906" y="270" width="48" height="90" />
      <rect x="964" y="255" width="30" height="105" />
      <rect x="1004" y="268" width="40" height="92" />
      <rect x="1054" y="260" width="36" height="100" />
      <rect x="1100" y="272" width="44" height="88" />
      <rect x="1154" y="255" width="32" height="105" />
      <rect x="1196" y="268" width="50" height="92" />
      <rect x="1256" y="260" width="38" height="100" />
      <rect x="1304" y="275" width="46" height="85" />
      <rect x="1360" y="265" width="40" height="95" />
      <rect x="1410" y="278" width="30" height="82" />

      {/* ── Lit windows – scattered dots of warm amber light ── */}
      {[
        [97,275],[103,285],[97,295],[103,305],
        [143,285],[143,295],[295,270],[295,280],
        [515,280],[515,292],[555,268],[555,280],
        [605,278],[605,290],[650,258],[650,270],
        [700,275],[700,285],[820,275],[820,287],
        [875,260],[875,272],[915,280],[915,292],
        [970,265],[970,277],[1010,278],[1010,290],
        [1060,270],[1060,282],[1160,265],[1160,277],
        [1205,278],[1205,290],[1262,270],[1262,282],
      ].map(([x, y], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width="4"
          height="4"
          fill="white"
          fillOpacity="0.5"
        />
      ))}

      {/* ── Moon ── */}
      <circle cx="1340" cy="70" r="28" fill="white" fillOpacity="0.18" />
      <circle cx="1328" cy="62" r="24" fillOpacity="1" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   IstanbulSkyline
   Landmarks: Hagia Sophia/Blue Mosque silhouette (large dome + 4 minarets),
              Galata Tower (cylinder + cone), Bosphorus suspension bridge,
              generic buildings. Warm golden-hour mood with sun circle.
   viewBox: 0 0 1440 360
───────────────────────────────────────────────────────────────────────────── */
export function IstanbulSkyline(props: { className?: string }): JSX.Element {
  return (
    <svg
      viewBox="0 0 1440 360"
      preserveAspectRatio="xMidYMax meet"
      fill="currentColor"
      aria-hidden="true"
      className={props.className}
    >
      {/* ── Golden sun ── */}
      <circle cx="180" cy="90" r="44" fill="white" fillOpacity="0.22" />
      <circle cx="180" cy="90" r="32" fill="white" fillOpacity="0.18" />

      {/* ── Water / Bosphorus horizon line ── */}
      <rect x="0" y="318" width="1440" height="42" fillOpacity="0.25" />

      {/* ── Left bank buildings ── */}
      <rect x="0" y="280" width="40" height="80" />
      <rect x="50" y="265" width="35" height="95" />
      <rect x="95" y="275" width="28" height="85" />

      {/* ── Galata Tower ── */}
      {/* cylindrical body */}
      <rect x="130" y="220" width="40" height="140" rx="4" />
      {/* conical roof */}
      <polygon points="130,220 170,220 150,170" />
      {/* tiny flag */}
      <rect x="149" y="160" width="2" height="12" />
      <polygon points="151,162 162,166 151,170" fill="white" fillOpacity="0.7" />
      {/* balcony band */}
      <rect x="126" y="225" width="48" height="6" fillOpacity="0.6" />

      {/* ── Buildings between Galata and mosque ── */}
      <rect x="180" y="278" width="36" height="82" />
      <rect x="226" y="265" width="30" height="95" />
      <rect x="266" y="272" width="44" height="88" />
      <rect x="320" y="258" width="32" height="102" />

      {/* ── Grand Mosque (Hagia Sophia / Blue Mosque feel) ── */}
      {/* main body */}
      <rect x="380" y="268" width="180" height="92" />
      {/* large central dome */}
      <ellipse cx="470" cy="268" rx="58" ry="42" />
      {/* half-dome buttresses */}
      <ellipse cx="400" cy="285" rx="30" ry="22" />
      <ellipse cx="540" cy="285" rx="30" ry="22" />
      {/* minaret 1 – far left */}
      <rect x="368" y="190" width="12" height="130" />
      <polygon points="362,190 386,190 374,162" />
      <rect x="372" y="155" width="4" height="10" />
      {/* minaret 2 – near left */}
      <rect x="398" y="205" width="10" height="115" />
      <polygon points="393,205 413,205 403,182" />
      <rect x="401" y="176" width="4" height="9" />
      {/* minaret 3 – near right */}
      <rect x="530" y="205" width="10" height="115" />
      <polygon points="525,205 545,205 535,182" />
      <rect x="533" y="176" width="4" height="9" />
      {/* minaret 4 – far right */}
      <rect x="558" y="190" width="12" height="130" />
      <polygon points="552,190 576,190 564,162" />
      <rect x="562" y="155" width="4" height="10" />
      {/* crescent on main dome */}
      <path d="M476,240 Q478,230 484,234 Q478,228 470,232 Q472,238 476,240 Z" fill="white" fillOpacity="0.7" />

      {/* ── Mid skyline ── */}
      <rect x="575" y="268" width="38" height="92" />
      <rect x="623" y="255" width="30" height="105" />
      <rect x="663" y="265" width="44" height="95" />
      <rect x="717" y="250" width="34" height="110" />
      <rect x="761" y="268" width="28" height="92" />

      {/* ── Suspension bridge (Bosphorus) ── */}
      {/* deck */}
      <rect x="790" y="300" width="350" height="8" />
      {/* left tower */}
      <rect x="826" y="240" width="14" height="68" />
      <rect x="820" y="238" width="26" height="6" />
      {/* right tower */}
      <rect x="1102" y="240" width="14" height="68" />
      <rect x="1096" y="238" width="26" height="6" />
      {/* main cables – left side */}
      <path d="M833,244 Q900,310 1000,304 Q1100,310 1109,244" fill="none" stroke="currentColor" strokeWidth="2.5" />
      {/* hanger cables */}
      {[850,880,910,940,970,1000,1030,1060,1090].map((x, i) => {
        const midY = 300 + Math.round(Math.abs(x - 970) * 0.04);
        return (
          <line key={i} x1={x} y1={midY} x2={x} y2={308} stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
        );
      })}

      {/* ── Right bank buildings ── */}
      <rect x="1150" y="272" width="40" height="88" />
      <rect x="1200" y="260" width="34" height="100" />
      <rect x="1244" y="270" width="48" height="90" />
      <rect x="1302" y="255" width="36" height="105" />
      <rect x="1348" y="268" width="42" height="92" />
      <rect x="1400" y="275" width="40" height="85" />

      {/* ── Windows – warm amber ── */}
      {[
        [52,275],[52,287],[97,283],[195,285],[195,297],
        [235,272],[270,280],[270,292],[330,265],[330,277],
        [580,278],[628,262],[628,274],[670,272],[720,258],
        [1158,280],[1208,268],[1208,280],[1252,278],[1310,262],
        [1310,274],[1357,278],[1357,290],
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="4" height="4" fill="white" fillOpacity="0.55" />
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   BerlinSkyline
   Landmarks: Brandenburg Gate (6 columns + quadriga), Fernsehturm TV Tower
              (needle + sphere), clean modern rectangular towers.
   viewBox: 0 0 1440 360
───────────────────────────────────────────────────────────────────────────── */
export function BerlinSkyline(props: { className?: string }): JSX.Element {
  return (
    <svg
      viewBox="0 0 1440 360"
      preserveAspectRatio="xMidYMax meet"
      fill="currentColor"
      aria-hidden="true"
      className={props.className}
    >
      {/* ── Clean modern buildings – left ── */}
      <rect x="0" y="270" width="55" height="90" />
      <rect x="65" y="250" width="42" height="110" />
      <rect x="117" y="262" width="60" height="98" />
      <rect x="187" y="240" width="38" height="120" />
      <rect x="235" y="255" width="50" height="105" />

      {/* ── Brandenburg Gate ── */}
      {/* Pediment / top horizontal beam */}
      <rect x="295" y="248" width="160" height="18" />
      {/* Attic story above columns */}
      <rect x="305" y="230" width="140" height="20" />
      {/* 6 columns */}
      {[310, 332, 354, 376, 398, 420].map((x, i) => (
        <rect key={i} x={x} y={248} width="12" height="112" />
      ))}
      {/* Column base plinth */}
      <rect x="302" y="358" width="146" height="8" />
      {/* Quadriga silhouette (horses + chariot on top) */}
      {/* chariot body */}
      <ellipse cx="350" cy="226" rx="18" ry="8" />
      <ellipse cx="390" cy="226" rx="12" ry="6" />
      {/* horses */}
      <path d="M308,228 Q316,214 324,222 Q316,216 320,228 Z" />
      <path d="M322,226 Q330,212 338,220 Q330,214 334,226 Z" />
      <path d="M336,224 Q344,210 352,218 Q344,212 348,224 Z" />
      <path d="M350,224 Q358,210 366,218 Q358,212 362,224 Z" />
      {/* rider figure */}
      <rect x="386" y="214" width="6" height="14" />
      <circle cx="389" cy="212" r="4" />

      {/* ── Buildings between gate and TV tower ── */}
      <rect x="470" y="260" width="44" height="100" />
      <rect x="524" y="245" width="36" height="115" />
      <rect x="570" y="258" width="52" height="102" />
      <rect x="632" y="240" width="40" height="120" />
      <rect x="682" y="255" width="30" height="105" />

      {/* ── Fernsehturm TV Tower ── */}
      {/* wide base section */}
      <path d="M728,360 L730,320 L736,290 L738,270 L740,250 L742,240 L744,250 L746,270 L748,290 L754,320 L756,360 Z" />
      {/* sphere */}
      <circle cx="742" cy="210" r="32" />
      {/* sphere cross detail / reflection */}
      <path d="M742,182 L742,238" stroke="white" strokeWidth="2" strokeOpacity="0.2" />
      <path d="M710,210 L774,210" stroke="white" strokeWidth="2" strokeOpacity="0.2" />
      {/* needle above sphere */}
      <rect x="740" y="130" width="4" height="82" />
      {/* blinking light */}
      <circle cx="742" cy="128" r="3" fill="white" fillOpacity="0.9" />

      {/* ── Buildings right of TV tower ── */}
      <rect x="790" y="255" width="50" height="105" />
      <rect x="850" y="240" width="44" height="120" />
      <rect x="904" y="258" width="60" height="102" />
      <rect x="974" y="244" width="36" height="116" />
      <rect x="1020" y="260" width="52" height="100" />
      <rect x="1082" y="248" width="42" height="112" />
      <rect x="1134" y="262" width="56" height="98" />
      <rect x="1200" y="250" width="38" height="110" />
      <rect x="1248" y="260" width="48" height="100" />
      <rect x="1306" y="245" width="44" height="115" />
      <rect x="1360" y="258" width="50" height="102" />
      <rect x="1420" y="268" width="20" height="92" />

      {/* ── Crisp lit windows ── */}
      {[
        [72,258],[72,270],[72,282],[130,270],[130,282],
        [196,248],[196,260],[196,272],[242,263],[242,275],
        [478,268],[478,280],[528,253],[528,265],[578,266],
        [578,278],[638,248],[638,260],[638,272],[858,248],
        [858,260],[858,272],[910,266],[910,278],[980,252],
        [980,264],[1028,268],[1028,280],[1090,256],[1090,268],
        [1142,270],[1142,282],[1208,258],[1208,270],[1256,268],
        [1256,280],[1314,253],[1314,265],[1368,266],[1368,278],
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="5" height="5" fill="white" fillOpacity="0.45" />
      ))}

      {/* ── Subtle moon / crescent ── */}
      <circle cx="1380" cy="60" r="22" fill="white" fillOpacity="0.15" />
      <circle cx="1370" cy="54" r="19" fillOpacity="1" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Clouds
   3–5 layered cloud blobs spread across a wide canvas for parallax layering.
   viewBox: 0 0 1440 200
───────────────────────────────────────────────────────────────────────────── */
export function Clouds(props: { className?: string }): JSX.Element {
  return (
    <svg
      viewBox="0 0 1440 200"
      preserveAspectRatio="xMidYMid meet"
      fill="currentColor"
      aria-hidden="true"
      className={props.className}
    >
      {/* Cloud 1 – far left */}
      <g transform="translate(60,60)">
        <ellipse cx="0" cy="30" rx="70" ry="28" />
        <ellipse cx="-30" cy="22" rx="46" ry="32" />
        <ellipse cx="30" cy="18" rx="52" ry="36" />
        <ellipse cx="10" cy="10" rx="38" ry="30" />
      </g>

      {/* Cloud 2 – center-left */}
      <g transform="translate(400,40)">
        <ellipse cx="0" cy="36" rx="90" ry="32" />
        <ellipse cx="-40" cy="26" rx="56" ry="38" />
        <ellipse cx="38" cy="22" rx="64" ry="40" />
        <ellipse cx="12" cy="12" rx="46" ry="34" />
        <ellipse cx="-10" cy="8" rx="34" ry="26" />
      </g>

      {/* Cloud 3 – center */}
      <g transform="translate(780,70)">
        <ellipse cx="0" cy="28" rx="80" ry="26" />
        <ellipse cx="-36" cy="20" rx="50" ry="34" />
        <ellipse cx="34" cy="18" rx="56" ry="36" />
        <ellipse cx="8" cy="8" rx="40" ry="28" />
      </g>

      {/* Cloud 4 – center-right */}
      <g transform="translate(1100,50)">
        <ellipse cx="0" cy="34" rx="84" ry="30" />
        <ellipse cx="-38" cy="24" rx="54" ry="36" />
        <ellipse cx="36" cy="20" rx="60" ry="38" />
        <ellipse cx="10" cy="10" rx="42" ry="30" />
        <ellipse cx="-12" cy="6" rx="30" ry="22" />
      </g>

      {/* Cloud 5 – far right */}
      <g transform="translate(1360,65)">
        <ellipse cx="0" cy="26" rx="68" ry="24" />
        <ellipse cx="-28" cy="18" rx="44" ry="30" />
        <ellipse cx="26" cy="16" rx="50" ry="32" />
        <ellipse cx="6" cy="8" rx="36" ry="26" />
      </g>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Plane
   Sleek passenger aircraft silhouette, nose pointing RIGHT (L→R travel).
   viewBox: 0 0 200 80
───────────────────────────────────────────────────────────────────────────── */
export function Plane(props: { className?: string }): JSX.Element {
  return (
    <svg
      viewBox="0 0 200 80"
      preserveAspectRatio="xMidYMid meet"
      fill="currentColor"
      aria-hidden="true"
      className={props.className}
    >
      {/* ── Fuselage ── */}
      <path d="M20,38 Q30,32 60,30 L148,30 Q168,30 180,36 Q190,40 188,44 Q186,48 168,50 L60,52 Q30,52 20,46 Q14,42 20,38 Z" />

      {/* ── Nose cone ── */}
      <path d="M168,30 Q182,30 192,38 Q196,40 192,44 Q186,48 168,50 L168,30 Z" />

      {/* ── Main swept wing (under fuselage center) ── */}
      <path d="M75,50 Q90,52 100,52 L120,80 Q118,80 114,78 L92,52 Q82,52 70,50 Z" />
      <path d="M75,30 Q82,28 92,28 L114,2 Q118,0 120,0 L100,28 Q90,28 75,30 Z" />

      {/* ── Horizontal stabilizer (tail) ── */}
      <path d="M28,50 Q35,52 44,52 L52,66 Q50,67 48,66 L36,52 Q28,52 22,50 Z" />
      <path d="M28,30 Q35,28 44,28 L52,14 Q50,13 48,14 L36,28 Q28,28 22,30 Z" />

      {/* ── Vertical tail fin ── */}
      <path d="M22,30 Q24,20 32,12 Q36,8 40,10 L40,30 Z" />

      {/* ── Engines (under main wings) ── */}
      <ellipse cx="98" cy="57" rx="10" ry="4" />
      <ellipse cx="82" cy="56" rx="8" ry="3" />

      {/* ── Windows – small circles along fuselage ── */}
      {[80, 96, 112, 128, 144, 158].map((x, i) => (
        <circle key={i} cx={x} cy="38" r="2.5" fill="white" fillOpacity="0.65" />
      ))}

      {/* ── Door accent ── */}
      <rect x="62" y="33" width="5" height="14" rx="1" fill="white" fillOpacity="0.2" />
    </svg>
  );
}
