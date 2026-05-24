# University logos

Phase-4 marquee ships with stylized text wordmarks as placeholders.

To use a real logo:

1. Place the official SVG at `public/universities/<slug>.svg` —
   where `<slug>` matches a `University.slug` value in
   `src/config/universities.ts`.
2. Open `src/components/UniversityMarquee.tsx` and update the
   `hasLogo()` function to return `true` for that uni's slug
   (or, for many at once, switch to a `Set` lookup).

Original wordmarks belong to the respective universities; we use
them only to inform prospective students which schools we can place
them into. No partnership implied.
