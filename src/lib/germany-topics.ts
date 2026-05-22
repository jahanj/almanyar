/**
 * Internal-linking topic graph for "دانستنی‌های کاربردی آلمان".
 *
 * Single source of truth for:
 *  - the footer/section card grid (GermanyTopics component), and
 *  - the data-driven placeholder pages (topic-route factory).
 *
 * All hrefs are root-level SEO landing routes (allow-listed in middleware).
 */

export type TopicGroup = 'visa' | 'study' | 'work' | 'jobs' | 'life' | 'exams';

export type Topic = {
  title: string;
  href: string;
  desc: string;
  icon: string;
  group: TopicGroup;
};

/** Gradient + accent per topic group (matches AlmanYar visual style). */
export const GROUP_STYLE: Record<TopicGroup, { gradient: string; label: string }> = {
  visa: { gradient: 'from-blue-600 to-purple-600', label: 'ویزای آلمان' },
  study: { gradient: 'from-indigo-600 to-cyan-600', label: 'تحصیل در آلمان' },
  work: { gradient: 'from-emerald-600 to-green-600', label: 'کار در آلمان' },
  jobs: { gradient: 'from-teal-600 to-emerald-600', label: 'بازار کار آلمان' },
  life: { gradient: 'from-amber-500 to-orange-600', label: 'زندگی در آلمان' },
  exams: { gradient: 'from-red-600 to-yellow-500', label: 'آزمون‌های آلمانی' },
};

/** Persian label per top-level route segment (for breadcrumbs). */
export const SEGMENT_LABEL: Record<string, string> = {
  'germany-visa': 'ویزای آلمان',
  'study-germany': 'تحصیل در آلمان',
  'work-germany': 'کار در آلمان',
  'jobs-germany': 'بازار کار آلمان',
  'life-germany': 'زندگی در آلمان',
  'germany-embassy': 'سفارت آلمان',
  services: 'خدمات آلمانیار',
  faq: 'سوالات متداول',
  ausbildung: 'آوسبیلدونگ',
  exams: 'آزمون‌ها',
};

export const TOPICS: Topic[] = [
  // ── Visa ──────────────────────────────────────────────
  { title: 'ویزای آلمان چیست؟', href: '/germany-visa', icon: '🛂', group: 'visa', desc: 'آشنایی با انواع ویزای آلمان و کاربرد هرکدام برای ایرانیان.' },
  { title: 'شرایط دریافت ویزای آلمان', href: '/germany-visa/requirements', icon: '✅', group: 'visa', desc: 'مهم‌ترین شرایط و پیش‌نیازهای اخذ ویزای آلمان.' },
  { title: 'مدارک لازم برای ویزای آلمان', href: '/germany-visa/documents', icon: '📄', group: 'visa', desc: 'فهرست کامل مدارک موردنیاز برای درخواست ویزا.' },
  { title: 'وقت سفارت آلمان از ترکیه', href: '/germany-visa/appointment-from-turkey', icon: '📅', group: 'visa', desc: 'نحوه گرفتن وقت سفارت آلمان از ترکیه و نکات آن.' },
  { title: 'ویزامتریک چیست؟', href: '/germany-visa/visametric', icon: '🏢', group: 'visa', desc: 'نقش مرکز ویزامتریک در فرآیند درخواست ویزای آلمان.' },
  { title: 'ویزای ملی آلمان نوع D', href: '/germany-visa/national-visa-type-d', icon: '🇩🇪', group: 'visa', desc: 'ویزای بلندمدت ملی (نوع D) برای اقامت و تحصیل در آلمان.' },
  { title: 'ویزای پیوست خانواده آلمان', href: '/germany-visa/family-reunion', icon: '👨‍👩‍👧', group: 'visa', desc: 'شرایط آوردن همسر و فرزندان به آلمان.' },
  { title: 'ویزای درمانی آلمان', href: '/germany-visa/medical-visa', icon: '🏥', group: 'visa', desc: 'ویزای آلمان برای درمان و خدمات پزشکی.' },
  { title: 'ویزای دوره زبان آلمانی', href: '/germany-visa/language-course-visa', icon: '🗣️', group: 'visa', desc: 'ویزای شرکت در دوره‌های زبان آلمانی در آلمان.' },
  { title: 'ویزای توریستی آلمان', href: '/germany-visa/tourist-visa', icon: '🧳', group: 'visa', desc: 'ویزای شنگن توریستی برای سفر به آلمان.' },
  { title: 'ویزای نمایشگاهی آلمان', href: '/germany-visa/exhibition-visa', icon: '🎪', group: 'visa', desc: 'ویزای حضور در نمایشگاه‌ها و رویدادهای تجاری آلمان.' },
  { title: 'ویزای ترانزیت آلمان', href: '/germany-visa/transit-visa', icon: '🔁', group: 'visa', desc: 'ویزای عبور از خاک آلمان به مقصد دیگر.' },
  { title: 'آدرس سفارت آلمان در تهران', href: '/germany-embassy/tehran', icon: '📍', group: 'visa', desc: 'نشانی و اطلاعات تماس سفارت آلمان در تهران.' },
  { title: 'خدمات آلمانیار برای ویزای آلمان', href: '/services/germany-visa', icon: '🤝', group: 'visa', desc: 'همراهی کامل آلمانیار در فرآیند اخذ ویزای آلمان.' },
  { title: 'سوالات متداول ویزای آلمان', href: '/faq/germany-visa', icon: '❓', group: 'visa', desc: 'پاسخ پرتکرارترین پرسش‌ها درباره ویزای آلمان.' },
  { title: 'ویزای آوسبیلدونگ آلمان', href: '/ausbildung/visa', icon: '🛠️', group: 'visa', desc: 'ویزای دوره‌های آموزش حرفه‌ای (آوسبیلدونگ) در آلمان.' },

  // ── Study ─────────────────────────────────────────────
  { title: 'ویزای تحصیلی آلمان', href: '/study-germany/student-visa', icon: '🎓', group: 'study', desc: 'مسیر و شرایط اخذ ویزای دانشجویی آلمان.' },
  { title: 'تحصیل کارشناسی ارشد در آلمان', href: '/study-germany/master', icon: '📚', group: 'study', desc: 'شرایط، رشته‌ها و مراحل پذیرش مقطع ارشد در آلمان.' },
  { title: 'تحصیل مهندسی در آلمان', href: '/study-germany/engineering', icon: '⚙️', group: 'study', desc: 'تحصیل رشته‌های مهندسی در دانشگاه‌های آلمان.' },
  { title: 'اپلای آلمان', href: '/study-germany/apply', icon: '📝', group: 'study', desc: 'فرآیند اپلای و درخواست پذیرش از دانشگاه‌های آلمان.' },
  { title: 'شرایط سنی تحصیل در آلمان', href: '/study-germany/age-limit', icon: '⏳', group: 'study', desc: 'محدودیت‌ها و واقعیت‌های سن برای تحصیل در آلمان.' },
  { title: 'اقامت پس از تحصیل در آلمان', href: '/study-germany/post-study-residence', icon: '🔓', group: 'study', desc: 'اقامت کار و آینده شغلی پس از فارغ‌التحصیلی.' },

  // ── Work ──────────────────────────────────────────────
  { title: 'ویزای کاری آلمان', href: '/work-germany/work-visa', icon: '💼', group: 'work', desc: 'شرایط و مدارک ویزای کار آلمان برای متخصصان.' },
  { title: 'ویزای جستجوی کار آلمان', href: '/work-germany/job-seeker-visa', icon: '🔎', group: 'work', desc: 'ویزای ورود به آلمان برای یافتن شغل.' },
  { title: 'بلوکارت آلمان', href: '/work-germany/eu-blue-card', icon: '🔵', group: 'work', desc: 'کارت آبی اتحادیه اروپا برای متخصصان با درآمد بالا.' },
  { title: 'کارت شانس آلمان', href: '/work-germany/opportunity-card', icon: '🎯', group: 'work', desc: 'Chancenkarte؛ مسیر امتیازی جدید برای کار در آلمان.' },
  { title: 'ویزای کاری آلمان برای مهندسین', href: '/work-germany/engineers', icon: '👷', group: 'work', desc: 'فرصت‌ها و شرایط ویزای کار مهندسان در آلمان.' },

  // ── Jobs market ───────────────────────────────────────
  { title: 'بازار کار مهندسی صنایع در آلمان', href: '/jobs-germany/industrial-engineering', icon: '🏭', group: 'jobs', desc: 'وضعیت و درآمد مهندسی صنایع در بازار کار آلمان.' },
  { title: 'بازار کار مهندسی مکانیک در آلمان', href: '/jobs-germany/mechanical-engineering', icon: '🔧', group: 'jobs', desc: 'تقاضا و حقوق مهندسی مکانیک در آلمان.' },
  { title: 'بازار کار مهندسی برق در آلمان', href: '/jobs-germany/electrical-engineering', icon: '⚡', group: 'jobs', desc: 'فرصت‌های شغلی مهندسی برق در آلمان.' },
  { title: 'مشاغل مورد نیاز آلمان', href: '/jobs-germany/in-demand-jobs', icon: '📈', group: 'jobs', desc: 'لیست مشاغل پرتقاضا و کمبود نیرو در آلمان.' },

  // ── Life ──────────────────────────────────────────────
  { title: 'انواع خوابگاه و خانه در آلمان', href: '/life-germany/housing', icon: '🏠', group: 'life', desc: 'گزینه‌های اسکان و یافتن خانه برای دانشجویان و کارگران.' },
  { title: 'اقتصاد آلمان و مسیرهای موفقیت', href: '/life-germany/economy', icon: '💶', group: 'life', desc: 'نگاهی به اقتصاد آلمان و فرصت‌های پیشرفت.' },

  // ── Exams ─────────────────────────────────────────────
  { title: 'آزمون DSH چیست؟', href: '/exams/dsh', icon: '🏛️', group: 'exams', desc: 'آزمون زبان آلمانی دانشگاهی DSH و کاربرد آن.' },
  { title: 'آزمون FSP چیست؟', href: '/exams/fsp', icon: '🎓', group: 'exams', desc: 'آزمون Feststellungsprüfung پس از کالج (Studienkolleg).' },
];

/** Path → topic lookup (used by the placeholder pages). */
export const TOPIC_BY_PATH: Record<string, Topic> = Object.fromEntries(
  TOPICS.map((t) => [t.href, t]),
);

/** All distinct top-level segments that need a catch-all route + middleware allow. */
export const TOPIC_SEGMENTS = Array.from(
  new Set(TOPICS.map((t) => t.href.split('/')[1]!)),
);
