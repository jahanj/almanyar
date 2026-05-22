/**
 * Per-page SEO copy (Persian). Centralized so titles/descriptions are
 * editable in one place and reused by each page's generateMetadata via
 * pageMetadata().
 *
 * Keep titles ≤ ~60 chars and descriptions ≤ 155 chars for clean SERP display.
 * `pageMetadata` will whitespace-truncate any oversize description at runtime,
 * but the source should be authored to fit naturally.
 *
 * `<meta name="keywords">` is intentionally NOT emitted — Google deprecated the
 * signal in 2009 and the other major engines ignore it. Topical relevance is
 * established by the actual page body + title + description.
 */

export type PageSeo = {
  /** Path without locale prefix. '' = home. */
  path: string;
  title: string;
  description: string;
};

export const PAGE_SEO = {
  home: {
    path: '',
    title: 'مهاجرت تحصیلی به آلمان از ترکیه | آلمانیار',
    description:
      'آلمانیار، مشاور تخصصی مهاجرت تحصیلی به آلمان از مسیر ترکیه: انتخاب دانشگاه، ثبت‌نام آزمون گوته و telc، پذیرش، ویزای دانشجویی، اسکان و استقرار.',
  },
  guide: {
    path: '/guide',
    title: 'راهنمای جامع تحصیل در آلمان ۲۰۲۵ | آلمانیار',
    description:
      'راهنمای کامل تحصیل در آلمان: مقاطع و دانشگاه‌ها، مدارک لازم، مراحل اقدام، نمره زبان، هزینه‌ها، تحصیل رایگان، بورسیه DAAD، کار حین تحصیل و سوالات متداول.',
  },
  turkeyResidence: {
    path: '/turkey-residence',
    title: 'اقامت تحصیلی ترکیه؛ مسیر ورود به آلمان | آلمانیار',
    description:
      'اقامت تحصیلی ترکیه به‌عنوان پلی مطمئن برای مهاجرت تحصیلی به آلمان: شرایط، مدارک، هزینه‌ها و مراحل اخذ اقامت دانشجویی ترکیه.',
  },
  turkeyCosts: {
    path: '/turkey-costs',
    title: 'هزینه‌های زندگی و تحصیل در ترکیه | آلمانیار',
    description:
      'بررسی کامل هزینه‌های زندگی، مسکن، تحصیل و اقامت در ترکیه برای دانشجویان ایرانی در مسیر مهاجرت تحصیلی به آلمان.',
  },
  exams: {
    path: '/exams',
    title: 'ثبت‌نام آزمون گوته، telc و TestDaF در ترکیه | آلمانیار',
    description:
      'خدمات ثبت‌نام آزمون‌های زبان آلمانی (گوته، telc، TestDaF، TestAS، DSH و ÖSD) در ترکیه و آلمان: یافتن تاریخ و مرکز، رزرو صندلی و پشتیبانی کامل.',
  },
  germanyVisaFromTurkey: {
    path: '/germany-visa-from-turkey',
    title: 'ویزای آلمان از ترکیه برای ایرانیان | شرایط، مدارک و هزینه‌ها',
    description:
      'راهنمای کامل درخواست ویزای آلمان از ترکیه برای ایرانیان: شرایط اقامت ترکیه، مدارک لازم، هزینه‌ها، وقت سفارت، iDATA و انواع ویزای تحصیلی و کاری.',
  },
  evaluation: {
    path: '/evaluation',
    title: 'فرم ارزیابی رایگان مهاجرت تحصیلی به آلمان | آلمانیار',
    description:
      'شرایط مهاجرت تحصیلی خود به آلمان را رایگان ارزیابی کنید. فرم ارزیابی آلمانیار شانس پذیرش و بهترین مسیر شما را مشخص می‌کند.',
  },
} satisfies Record<string, PageSeo>;
