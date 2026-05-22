'use client';

/**
 * Lightweight, dependency-free atmospheric layers for the migration journey.
 * Pure CSS animations (transform/opacity only) so they stay GPU-cheap and
 * automatically pause under `prefers-reduced-motion` via the global rule.
 */

/** A field of soft "city lights / stars" — deterministic positions (SSR-safe). */
export function Starfield({ className = '' }: { className?: string }) {
  // Deterministic pseudo-random so server and client markup match.
  const dots = Array.from({ length: 48 }, (_, i) => {
    const x = ((i * 53) % 100);
    const y = ((i * 29) % 100);
    const s = (i % 3) + 1;
    const delay = (i % 7) * 0.4;
    const dur = 3 + (i % 5);
    return { x, y, s, delay, dur };
  });
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {dots.map((d, i) => (
        <span
          key={i}
          className="journey-twinkle absolute rounded-full bg-white"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.s,
            height: d.s,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.dur}s`,
            opacity: 0.5,
          }}
        />
      ))}
    </div>
  );
}

/** A soft radial glow used to add cinematic depth/lighting to a scene. */
export function Glow({
  className = '',
  color = 'rgba(255,255,255,0.18)',
}: {
  className?: string;
  color?: string;
}) {
  return (
    <div
      className={`pointer-events-none absolute ${className}`}
      aria-hidden="true"
      style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
    />
  );
}
