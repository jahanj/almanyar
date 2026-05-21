'use client';

import { useEffect, useRef, useState } from 'react';

export default function Counter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver((entries) => {
      const e = entries[0];
      if (e && e.isIntersecting && !started.current) {
        started.current = true;
        const startTime = performance.now();
        const animate = (t: number) => {
          const elapsed = t - startTime;
          const ratio = Math.min(elapsed / duration, 1);
          setValue(Math.round(ratio * target));
          if (ratio < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{value.toLocaleString()}</span>;
}
