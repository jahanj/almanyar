/**
 * Turkish private universities Almanyar can place students into.
 *
 * Starter list (Phase-4 §SEO marquee). Owner trims/adds and replaces
 * placeholder wordmarks with official SVG logos at any time:
 *   1. Drop the official logo SVG at `public/universities/<slug>.svg`
 *   2. The marquee component checks `logo` first, then falls back to
 *      a typographic chip rendered from `name` + `shortLabel`.
 *
 * `slug` is used for the logo filename. `shortLabel` is what the
 * typographic placeholder shows (3–4 chars). Keep both alphanumeric
 * + Latin so the file system stays portable.
 *
 * Cities covered per the spec: Istanbul, Antalya, Ankara, Izmir.
 * If a name is wrong or a uni is missing, edit this file — no other
 * change required.
 */

export type University = {
  /** Used as the filename for an optional official logo SVG. */
  slug: string;
  /** Display name (Turkish official). */
  name: string;
  /** 3–4 char wordmark for the placeholder chip. */
  shortLabel: string;
  city: 'İstanbul' | 'Antalya' | 'Ankara' | 'İzmir';
};

export const UNIVERSITIES: University[] = [
  // İstanbul
  { slug: 'medipol',         name: 'İstanbul Medipol Üniversitesi',           shortLabel: 'MED',  city: 'İstanbul' },
  { slug: 'bahcesehir',      name: 'Bahçeşehir Üniversitesi',                 shortLabel: 'BAU',  city: 'İstanbul' },
  { slug: 'bilgi',           name: 'İstanbul Bilgi Üniversitesi',             shortLabel: 'BİLGİ',city: 'İstanbul' },
  { slug: 'yeditepe',        name: 'Yeditepe Üniversitesi',                   shortLabel: 'YED',  city: 'İstanbul' },
  { slug: 'koc',             name: 'Koç Üniversitesi',                        shortLabel: 'KOÇ',  city: 'İstanbul' },
  { slug: 'sabanci',         name: 'Sabancı Üniversitesi',                    shortLabel: 'SU',   city: 'İstanbul' },
  { slug: 'ozyegin',         name: 'Özyeğin Üniversitesi',                    shortLabel: 'ÖZÜ',  city: 'İstanbul' },
  { slug: 'aydin',           name: 'İstanbul Aydın Üniversitesi',             shortLabel: 'IAU',  city: 'İstanbul' },
  { slug: 'okan',            name: 'İstanbul Okan Üniversitesi',              shortLabel: 'OKAN', city: 'İstanbul' },
  { slug: 'kultur',          name: 'İstanbul Kültür Üniversitesi',            shortLabel: 'İKÜ',  city: 'İstanbul' },
  { slug: 'kemerburgaz',     name: 'Altınbaş Üniversitesi',                   shortLabel: 'ALT',  city: 'İstanbul' },
  { slug: 'isik',            name: 'Işık Üniversitesi',                       shortLabel: 'IŞK',  city: 'İstanbul' },
  { slug: 'maltepe',         name: 'Maltepe Üniversitesi',                    shortLabel: 'MLT',  city: 'İstanbul' },
  { slug: 'beykent',         name: 'Beykent Üniversitesi',                    shortLabel: 'BEY',  city: 'İstanbul' },
  { slug: 'arel',            name: 'İstanbul Arel Üniversitesi',              shortLabel: 'AREL', city: 'İstanbul' },

  // Ankara
  { slug: 'bilkent',         name: 'İhsan Doğramacı Bilkent Üniversitesi',    shortLabel: 'BİLK', city: 'Ankara' },
  { slug: 'tedu',            name: 'TED Üniversitesi',                        shortLabel: 'TEDÜ', city: 'Ankara' },
  { slug: 'atilim',          name: 'Atılım Üniversitesi',                     shortLabel: 'ATI',  city: 'Ankara' },
  { slug: 'cankaya',         name: 'Çankaya Üniversitesi',                    shortLabel: 'ÇNK',  city: 'Ankara' },
  { slug: 'baskent',         name: 'Başkent Üniversitesi',                    shortLabel: 'BAŞ',  city: 'Ankara' },
  { slug: 'ufuk',            name: 'Ufuk Üniversitesi',                       shortLabel: 'UFK',  city: 'Ankara' },

  // İzmir
  { slug: 'yasar',           name: 'Yaşar Üniversitesi',                      shortLabel: 'YŞR',  city: 'İzmir' },
  { slug: 'iue',             name: 'İzmir Ekonomi Üniversitesi',              shortLabel: 'IUE',  city: 'İzmir' },
  { slug: 'gediz',           name: 'İzmir Tınaztepe Üniversitesi',            shortLabel: 'TIN',  city: 'İzmir' },

  // Antalya
  { slug: 'antalya-bilim',   name: 'Antalya Bilim Üniversitesi',              shortLabel: 'ABÜ',  city: 'Antalya' },
  { slug: 'akev',            name: 'Antalya AKEV Üniversitesi',               shortLabel: 'AKEV', city: 'Antalya' },
];
