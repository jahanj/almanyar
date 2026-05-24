import Image from 'next/image';
import { UNIVERSITIES, type University } from '@/config/universities';

/**
 * Horizontal scrolling band of Turkish private universities Almanyar can
 * get students into. CSS-only marquee — no JS, no library. Pauses on hover.
 * Respects prefers-reduced-motion (renders as a static row).
 *
 * Per-uni rendering: tries `/universities/<slug>.svg` via next/image; until
 * the owner drops the real logo file in `public/universities/`, the slot
 * shows a stylized typographic chip (`shortLabel` from the data file).
 * No attempt to recreate official wordmark designs — the chip is a neutral
 * placeholder, not a logo derivative.
 *
 * Position on /fa: rendered between the cinematic hero and TrustModel
 * (see HomeClient.tsx). Headline above the band is intentionally cautious:
 * "از دانشگاه‌های همکار ترکیه پذیرش می‌گیریم" — describes what we do, not
 * a partnership claim.
 */

// Detect whether a logo file likely exists. Since Next can't stat /public at
// render time, we treat the absence of an explicit `hasLogo` field as
// "use the placeholder chip". Owner sets `hasLogo: true` per uni once they
// drop the corresponding SVG in /public/universities/<slug>.svg.
function hasLogo(_u: University): boolean {
  return false; // TODO: flip per-uni when real logo files land in /public.
}

function UniLogoSlot({ u }: { u: University }) {
  if (hasLogo(u)) {
    return (
      <Image
        src={`/universities/${u.slug}.svg`}
        alt={u.name}
        width={140}
        height={48}
        className="h-10 w-auto opacity-80 grayscale transition hover:grayscale-0 hover:opacity-100"
      />
    );
  }
  // Stylized typographic placeholder. Persian-RTL site, so we keep the
  // wordmark in Latin to match how the universities brand themselves.
  return (
    <div
      title={u.name}
      className="flex h-10 min-w-[88px] items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold tracking-wide text-slate-700 transition hover:border-emerald-400 hover:text-emerald-900"
      aria-label={u.name}
    >
      {u.shortLabel}
    </div>
  );
}

export default function UniversityMarquee() {
  // Duplicate the list so the CSS translate -50% loop is seamless.
  const reel = [...UNIVERSITIES, ...UNIVERSITIES];

  return (
    <section
      aria-labelledby="universities-marquee-title"
      className="border-y border-slate-200/80 bg-slate-50 py-10"
      data-testid="universities-marquee"
    >
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <h2
          id="universities-marquee-title"
          className="text-center text-base font-semibold text-slate-700 md:text-lg"
        >
          از دانشگاه‌های همکار ترکیه پذیرش می‌گیریم
        </h2>
        <p className="mt-1 text-center text-xs leading-6 text-slate-400">
          فهرست بالا گزیده‌ای از دانشگاه‌های خصوصی فعال در استانبول، آنکارا، ازمیر و آنتالیا است.
        </p>
      </div>

      <div className="cj-marquee-frame mt-6 overflow-hidden">
        <div className="cj-marquee-track flex w-max items-center gap-4" aria-hidden="true">
          {reel.map((u, i) => (
            <UniLogoSlot key={`${u.slug}-${i}`} u={u} />
          ))}
        </div>
      </div>

      {/* Sub-disclaimer: names/marks belong to the schools; we're independent. */}
      <p className="container mx-auto mt-5 max-w-3xl px-4 text-center text-[11px] leading-5 text-slate-400 sm:px-6">
        نام و نشان‌های این دانشگاه‌ها متعلق به مالکان قانونی آن‌هاست. آلمانیار وابسته به هیچ‌یک نیست.
      </p>
    </section>
  );
}
