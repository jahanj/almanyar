import type { Metadata } from 'next';
import Link from 'next/link';
import { getDictionary, localePath, type Locale } from '@/lib/i18n';
import FaqAccordion, { type FaqItem } from '@/components/FaqAccordion';
import JsonLd from '@/components/JsonLd';
import { absoluteUrl, breadcrumbLd, faqLd, localizedUrl, pageMetadata, SITE } from '@/lib/seo';
import { PAGE_SEO } from '@/lib/seo-content';

const pagePath = '/germany-visa-from-turkey';
const seo = PAGE_SEO.germanyVisaFromTurkey;

const keyPoints = [
  'داشتن ویزای توریستی ترکیه برای درخواست ویزای آلمان کافی نیست.',
  'متقاضی ایرانی معمولاً باید اقامت بلندمدت و قابل اثبات ترکیه داشته باشد.',
  'سفارت بررسی می‌کند که ترکیه محل اصلی زندگی و اقامت واقعی متقاضی باشد.',
  'کارت اقامت معتبر، سابقه سکونت، آدرس و مدارک زندگی در ترکیه اهمیت زیادی دارد.',
  'نوع درخواست می‌تواند تحصیلی، کاری، آوسبیلدونگ، پیوست خانواده، کارت شانس یا کوتاه‌مدت شنگن باشد.',
  'iDATA در ترکیه برای برخی مسیرهای وقت و دریافت مدارک نقش کارگزار رسمی دارد.',
  'هزینه اقامت و زندگی در ترکیه باید پیش از شروع مسیر با واقع‌بینی محاسبه شود.',
  'اشتباه کوچک در انتخاب مسیر، مدارک یا وقت می‌تواند باعث رد پرونده و اتلاف زمان و هزینه شود.',
];

const processSteps = [
  'بررسی شرایط فردی',
  'دریافت یا داشتن اقامت معتبر ترکیه',
  'انتخاب نوع ویزای آلمان',
  'آماده‌سازی مدارک',
  'دریافت پذیرش، قرارداد کاری یا مدارک لازم',
  'رزرو وقت از مسیر مناسب مثل iDATA یا سامانه رسمی مربوطه',
  'حضور در مصاحبه و تحویل پرونده',
  'انتظار برای نتیجه ویزا',
  'آماده‌سازی سفر به آلمان',
];

const visaTypes = [
  {
    icon: '🎓',
    title: 'ویزای تحصیلی آلمان',
    text: 'برای ورود به دانشگاه، کالج، دوره زبان یا مسیر آموزشی معتبر در آلمان.',
    requirement: 'پذیرش معتبر، تمکن مالی و مدارک تحصیلی کامل',
    documents: 'فرم VIDEX، پذیرش، پاسپورت، اقامت ترکیه، تمکن مالی، زبان، رزومه و بیمه',
    time: 'معمولاً حدود ۴ تا ۵ هفته پس از تکمیل پرونده؛ زمان انتظار وقت جداگانه است.',
  },
  {
    icon: '💼',
    title: 'ویزای کاری آلمان',
    text: 'برای متخصصانی که از کارفرمای آلمانی پیشنهاد یا قرارداد کاری معتبر دارند.',
    requirement: 'قرارداد کاری، تناسب شغل با سابقه و در صورت نیاز تایید مدارک',
    documents: 'فرم درخواست، پاسپورت، اقامت ترکیه، قرارداد کار، رزومه، مدارک تحصیلی و بیمه',
    time: 'حدود ۴ هفته برای پرونده‌های کامل؛ بسته به نوع شغل و بررسی‌ها متغیر است.',
  },
  {
    icon: '🛠️',
    title: 'ویزای آوسبیلدونگ',
    text: 'برای دوره‌های آموزش حرفه‌ای آلمان که هم آموزش نظری و هم کار عملی دارند.',
    requirement: 'قرارداد آوسبیلدونگ و معمولاً زبان آلمانی حداقل B1',
    documents: 'قرارداد، برنامه آموزشی، مدرک زبان، تمکن مالی در صورت نیاز، بیمه و مدارک اقامت ترکیه',
    time: 'بسته به زمان شروع دوره و ظرفیت سفارت متغیر است؛ اقدام زودهنگام ضروری است.',
  },
  {
    icon: '🧭',
    title: 'کارت شانس آلمان',
    text: 'مسیر امتیازمحور برای جستجوی کار در آلمان، مخصوص متقاضیان واجد شرایط.',
    requirement: 'امتیاز کافی بر اساس مدرک، سابقه کار، زبان، سن و تمکن مالی',
    documents: 'مدارک تحصیلی، سابقه کاری، زبان، تمکن مالی، بیمه، پاسپورت و اقامت ترکیه',
    time: 'در گروه ویزاهای کاری بررسی می‌شود و زمان آن به پرونده و وقت بستگی دارد.',
  },
  {
    icon: '👨‍👩‍👧‍👦',
    title: 'ویزای پیوست خانواده',
    text: 'برای پیوستن به همسر، والدین یا اعضای خانواده واجد شرایط در آلمان.',
    requirement: 'رابطه خانوادگی قابل اثبات، مدارک هویتی و شرایط اقامت فرد مقیم آلمان',
    documents: 'مدارک ازدواج یا تولد، پاسپورت، اقامت ترکیه، مدارک زبان در صورت نیاز و مدارک فرد دعوت‌کننده',
    time: 'حدود ۸ تا ۱۲ هفته یا بیشتر؛ بسته به بررسی اداره مهاجرت آلمان.',
  },
  {
    icon: '✈️',
    title: 'ویزای توریستی یا کوتاه‌مدت شنگن',
    text: 'برای سفرهای کوتاه تا ۹۰ روز؛ مثل گردشگری، دیدار خانواده، رویداد یا سفر کاری کوتاه.',
    requirement: 'هدف سفر روشن، برنامه بازگشت، تمکن مالی و پیوند کافی با محل اقامت',
    documents: 'فرم شنگن، پاسپورت، اقامت ترکیه، بیمه سفر، رزروها، مدارک مالی و شغلی',
    time: 'حداقل حدود ۱۵ روز کاری و در موارد خاص طولانی‌تر؛ وقت گرفتن ممکن است جداگانه زمان ببرد.',
  },
];

const studentDocs = [
  'فرم VIDEX تکمیل‌شده',
  'پاسپورت معتبر',
  'عکس بیومتریک',
  'کارت و مدارک اقامت ترکیه',
  'نامه پذیرش دانشگاه، کالج یا دوره آموزشی',
  'اثبات تمکن مالی یا حساب مسدودشده',
  'مدرک زبان آلمانی یا انگلیسی',
  'ترجمه مدارک تحصیلی و ریزنمرات',
  'انگیزه‌نامه',
  'رزومه',
  'بیمه درمانی معتبر',
];

const workDocs = [
  'فرم درخواست ویزا',
  'پاسپورت معتبر',
  'عکس بیومتریک',
  'کارت اقامت ترکیه',
  'قرارداد کار یا پیشنهاد کاری معتبر از کارفرمای آلمانی',
  'مدارک تحصیلی، سوابق کاری و تاییدیه‌های لازم',
  'رزومه حرفه‌ای',
  'بیمه درمانی',
];

const ausbildungDocs = [
  'قرارداد آوسبیلدونگ',
  'برنامه آموزشی یا اطلاعات دوره',
  'مدرک زبان آلمانی، معمولاً حداقل B1',
  'اثبات تمکن مالی در صورت نیاز',
  'بیمه درمانی',
  'مدارک اقامت ترکیه و مدارک هویتی',
];

const costRows = [
  ['هزینه اقامت ترکیه', 'تقریبی و قابل تغییر', 'وابسته به نوع اقامت، بیمه، مالیات کارت و شهر محل سکونت'],
  ['هزینه زندگی ماهانه در ترکیه', 'تقریبی', 'اجاره، خوراک، حمل‌ونقل و بیمه باید حداقل برای چند ماه محاسبه شود'],
  ['هزینه رزرو وقت', 'قابل تغییر', 'برخی مسیرها ممکن است هزینه ثبت یا رزرو جداگانه داشته باشند'],
  ['هزینه خدمات iDATA', 'وابسته به نوع درخواست', 'طبق اعلام رسمی ممکن است برای خدمات یا وقت، به یورو و معادل لیر دریافت شود'],
  ['هزینه کنسولگری', 'وابسته به نوع ویزا', 'برای شنگن معمولاً تا ۹۰ یورو و برای برخی ویزاهای ملی متفاوت است'],
  ['هزینه بیمه', 'تقریبی', 'بسته به شنگن، دانشجویی، کاری یا دوره انتظار فرق می‌کند'],
  ['هزینه ترجمه مدارک', 'تقریبی', 'وابسته به تعداد مدارک، زبان ترجمه و تاییدات لازم'],
  ['هزینه حساب مسدودشده', 'قابل تغییر', 'شامل مبلغ تمکن و کارمزد ارائه‌دهنده حساب مسدودشده'],
  ['هزینه خدمات اختیاری', 'اختیاری', 'مشاوره، آماده‌سازی پرونده، VIP یا خدمات اضافه باید شفاف و جداگانه محاسبه شود'],
];

const processingRows = [
  ['ویزای تحصیلی', 'حدود ۴ تا ۵ هفته پس از تکمیل مدارک'],
  ['ویزای کاری و Blue Card', 'حدود ۴ هفته برای پرونده کامل'],
  ['ویزای پیوست خانواده', 'حدود ۸ تا ۱۲ هفته یا بیشتر'],
];

const faqItems: FaqItem[] = [
  {
    q: 'آیا با ویزای توریستی ترکیه می‌توانم برای ویزای آلمان اقدام کنم؟',
    a: 'در حالت معمول خیر. ورود توریستی یا اقامت کوتاه‌مدت ترکیه معمولاً برای تغییر محل صلاحیت سفارت کافی نیست. سفارت بررسی می‌کند که محل زندگی واقعی و قانونی شما کجاست.',
  },
  {
    q: 'شرط اصلی ایرانیان برای درخواست ویزای آلمان از ترکیه چیست؟',
    a: 'عامل اصلی، داشتن اقامت قانونی و قابل اثبات در ترکیه است؛ به‌گونه‌ای که ترکیه محل اصلی زندگی شما محسوب شود، نه فقط محل حضور موقت.',
  },
  {
    q: 'آیا داشتن اقامت ترکیه کافی است؟',
    a: 'اقامت ترکیه شرط مهمی است، اما به‌تنهایی تضمین‌کننده پذیرش پرونده نیست. نوع اقامت، مدت و سابقه سکونت، آدرس، مدارک مالی و هدف سفر نیز بررسی می‌شود.',
  },
  {
    q: 'آیا باید حداقل ۶ ماه در ترکیه زندگی کرده باشم؟',
    a: 'عدد ثابتی برای همه پرونده‌ها وجود ندارد. با این حال، هرچه سابقه زندگی، آدرس، کارت اقامت و مدارک حضور واقعی شما در ترکیه قوی‌تر باشد، پرونده قابل دفاع‌تر است.',
  },
  {
    q: 'از طریق ترکیه برای چه نوع ویزاهایی می‌توان اقدام کرد؟',
    a: 'در صورت داشتن شرایط، می‌توان مسیرهایی مثل ویزای تحصیلی، کاری، آوسبیلدونگ، کارت شانس، پیوست خانواده و ویزای کوتاه‌مدت شنگن را بررسی کرد.',
  },
  {
    q: 'iDATA چیست؟',
    a: 'iDATA کارگزار رسمی مورد استفاده نمایندگی‌های آلمان در ترکیه برای برخی خدمات ویزا است. با این حال، تصمیم نهایی درباره ویزا با نمایندگی آلمان است، نه iDATA.',
  },
  {
    q: 'هزینه درخواست ویزای آلمان از ترکیه چقدر است؟',
    a: 'هزینه نهایی به نوع ویزا، هزینه کنسولی، خدمات iDATA، بیمه، ترجمه، حساب مسدودشده و هزینه اقامت یا زندگی در ترکیه بستگی دارد. پیش از اقدام باید برآورد اختصاصی انجام شود.',
  },
  {
    q: 'گرفتن ویزای آلمان از ترکیه چقدر زمان می‌برد؟',
    a: 'زمان بررسی پس از تکمیل پرونده می‌تواند از چند هفته تا چند ماه متغیر باشد. علاوه بر آن، زمان انتظار برای دریافت وقت نیز باید جداگانه محاسبه شود.',
  },
  {
    q: 'آیا دوره زبان آلمانی در ترکیه باعث دریافت اقامت ترکیه می‌شود؟',
    a: 'شرکت در دوره زبان آلمانی می‌تواند برای آمادگی زبان مفید باشد، اما به‌صورت خودکار حق دریافت اقامت ترکیه یا امکان درخواست ویزای آلمان از ترکیه ایجاد نمی‌کند.',
  },
  {
    q: 'آیا آلمانیار در آماده‌سازی پرونده کمک می‌کند؟',
    a: 'بله. آلمانیار شرایط شما را بررسی می‌کند، مسیر مناسب را توضیح می‌دهد و در آماده‌سازی مدارک، ثبت‌نام آزمون‌ها، زمان‌بندی و فرم‌ها کنار شماست؛ اما نتیجه ویزا فقط با سفارت است.',
  },
];

const officialLinks = [
  ['اطلاعات ویزا در نمایندگی‌های آلمان در ترکیه', 'https://tuerkei.diplo.de/tr-tr/service/05-visaeinreise'],
  ['اطلاعات وضعیت سفارت آلمان در تهران', 'https://teheran.diplo.de/ir-de/2752046-2752046'],
  ['وب‌سایت رسمی iDATA ترکیه', 'https://idata.com.tr/de/tr'],
  ['فرم‌ها و اطلاعات عمومی ویزا در Make it in Germany', 'https://www.make-it-in-germany.com/en/visa-residence/procedure/application-forms'],
  ['Goethe-Institut ترکیه', 'https://www.goethe.de/ins/tr/de/ueb.html'],
];

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  return pageMetadata({
    locale: params.locale,
    path: pagePath,
    title: seo.title,
    description: seo.description,
    type: 'article',
  });
}

export default async function GermanyVisaFromTurkeyPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const { locale } = params;
  const dict = await getDictionary(locale);
  const canonical = localizedUrl(locale, pagePath);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: seo.title,
    description: seo.description,
    inLanguage: 'fa',
    image: absoluteUrl(SITE.ogImage),
    mainEntityOfPage: canonical,
    author: { '@id': `${SITE.url}/#organization` },
    publisher: { '@id': `${SITE.url}/#organization` },
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'مشاوره و آماده‌سازی پرونده ویزای آلمان از ترکیه',
    serviceType: 'ویزای آلمان از طریق ترکیه برای ایرانیان',
    description: seo.description,
    areaServed: ['IR', 'TR', 'DE'],
    provider: { '@id': `${SITE.url}/#organization` },
    url: canonical,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'مسیرهای قابل بررسی ویزای آلمان از ترکیه',
      itemListElement: visaTypes.map((item) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: item.title,
          description: item.text,
        },
      })),
    },
  };

  return (
    <div className="bg-gray-50">
      <JsonLd
        data={[
          articleSchema,
          serviceSchema,
          faqLd(faqItems),
          breadcrumbLd([
            { name: 'خانه', url: localizedUrl(locale) },
            { name: 'ویزای آلمان از طریق ترکیه', url: canonical },
          ]),
        ]}
      />

      <section className="flag-bg text-white pt-32 pb-20 md:pt-40 md:pb-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-5xl text-center">
            <span className="inline-block rounded-full bg-yellow-500 px-4 py-1 text-sm font-bold text-gray-900">
              راهنمای ویژه ایرانیان مقیم یا متقاضی اقامت ترکیه
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-shadow md:text-6xl">
              ویزای آلمان از طریق ترکیه
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 opacity-95 md:text-xl">
              راهنمای کامل شرایط، مدارک، هزینه‌ها و مراحل درخواست ویزای آلمان از ترکیه برای ایرانیان
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/fa#contact" className="rounded-xl bg-yellow-500 px-8 py-3 font-bold text-gray-900 shadow-lg transition hover:bg-yellow-600 hover:scale-105">
                دریافت مشاوره رایگان
              </Link>
              <Link href="/fa/evaluation" className="glass-effect rounded-xl px-8 py-3 font-bold transition hover:bg-white/20 hover:scale-105">
                بررسی شرایط من
              </Link>
            </div>
            <div className="mx-auto mt-8 max-w-4xl rounded-2xl border border-yellow-300/40 bg-yellow-500/15 p-5 text-right leading-8">
              <b>هشدار مهم:</b> درخواست ویزای آلمان از ترکیه برای ایرانیان فقط در شرایط مشخص امکان‌پذیر است و معمولاً نیاز به اقامت بلندمدت ترکیه دارد.
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto max-w-6xl space-y-20 px-6 py-16">
        <AlertBox title="قبل از شروع هزینه نکنید">
          اگر فقط با ویزای توریستی وارد ترکیه شده‌اید، احتمالاً ترکیه محل صالح برای بررسی پرونده شما نیست.
          ابتدا باید وضعیت اقامت، محل زندگی واقعی و نوع ویزای آلمان دقیق بررسی شود.
        </AlertBox>

        <Section title="۸ نکته مهم درباره ویزای آلمان از ترکیه" subtitle="خلاصه چیزهایی که باید پیش از هر تصمیم بدانید">
          <div className="grid gap-4 md:grid-cols-2">
            {keyPoints.map((point, index) => (
              <div key={point} className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow card-hover">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 font-bold text-white">
                  {toFaNumber(index + 1)}
                </div>
                <p className="leading-8 text-gray-700">{point}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="چه کسانی می‌توانند از ترکیه برای ویزای آلمان اقدام کنند؟" subtitle="اصل ماجرا، محل اقامت واقعی و قانونی متقاضی است">
          <ContentCard>
            <p>
              شهروندان ایرانی در حالت عادی باید از کشور محل تابعیت یا محل اقامت معمول خود برای ویزای آلمان اقدام کنند.
              اگر متقاضی اقامت بلندمدت کشور دیگری مثل ترکیه را داشته باشد و بتواند نشان دهد زندگی واقعی او در ترکیه است،
              ممکن است امکان بررسی پرونده از همان کشور وجود داشته باشد.
            </p>
            <p>
              اقامت کوتاه‌مدت، سفر توریستی یا حضور چندروزه در ترکیه معمولاً برای تغییر مسیر کافی نیست. سفارت می‌تواند
              مدارکی مثل کارت اقامت، آدرس ثبت‌شده، سابقه زندگی، حساب بانکی، بیمه و دلیل حضور بلندمدت در ترکیه را بررسی کند.
            </p>
            <Notice>
              قوانین سفارت ممکن است تغییر کند؛ قبل از هر اقدام باید آخرین اطلاعات رسمی سفارت آلمان، iDATA و در صورت مرتبط بودن،
              اطلاعیه‌های سفارت آلمان در تهران بررسی شود.
            </Notice>
          </ContentCard>
        </Section>

        <Section title="آیا با شرایط فعلی ایران می‌توان از ترکیه درخواست ویزای آلمان داد؟" subtitle="پاسخ کوتاه: فقط با بررسی وضعیت اقامت و مسیر رسمی">
          <ContentCard>
            <p>
              اگر فعالیت بخش ویزای سفارت آلمان در ایران محدود یا موقتاً غیرفعال باشد، این موضوع به‌تنهایی به معنی امکان اقدام مستقیم
              از ترکیه نیست. طبق اطلاعیه‌های رسمی، متقاضیانی که محل اقامت قانونی و معمول آن‌ها ایران است، معمولاً نباید بدون اعلام
              مسیر رسمی به کشورهای همسایه برای ثبت پرونده مراجعه کنند.
            </p>
            <p>
              تا زمانی که مسیر جایگزین رسمی برای گروه خاصی از متقاضیان ایرانی اعلام نشده باشد، داشتن اقامت معتبر و قابل دفاع ترکیه
              همچنان عامل تعیین‌کننده است. در شرایط خاص سیاسی یا بسته‌شدن کامل سفارت، باید دید دولت آلمان کدام کشور، نهاد یا سازوکار
              را برای دریافت و بررسی پرونده اتباع ایرانی تعیین می‌کند.
            </p>
            <Notice>
              این بخش وعده یا تفسیر حقوقی قطعی نیست. وضعیت سفارت‌ها و مسیرهای پذیرش پرونده می‌تواند در زمان کوتاه تغییر کند.
            </Notice>
          </ContentCard>
        </Section>

        <Section title="مراحل اخذ ویزای آلمان از طریق ترکیه" subtitle="از ارزیابی اولیه تا آمادگی سفر">
          <div className="space-y-4">
            {processSteps.map((step, index) => (
              <div key={step} className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-blue-600 text-lg font-bold text-white">
                  {toFaNumber(index + 1)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{step}</h3>
                  <p className="mt-1 text-sm leading-7 text-gray-600">{stepDescriptions[index]}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="چه نوع ویزای آلمان را می‌توان از ترکیه درخواست داد؟" subtitle="نوع ویزا باید با هدف واقعی سفر و مدارک شما هماهنگ باشد">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visaTypes.map((visa) => (
              <div key={visa.title} className="rounded-2xl border-r-4 border-blue-500 bg-white p-6 shadow-xl card-hover">
                <div className="mb-3 text-4xl">{visa.icon}</div>
                <h3 className="mb-2 text-xl font-bold text-gray-800">{visa.title}</h3>
                <p className="mb-4 text-sm leading-7 text-gray-600">{visa.text}</p>
                <Fact label="شرط اصلی" value={visa.requirement} />
                <Fact label="خلاصه مدارک" value={visa.documents} />
                <Fact label="زمان تقریبی" value={visa.time} />
              </div>
            ))}
          </div>
        </Section>

        <Section title="ویزای تحصیلی آلمان از ترکیه" subtitle="برای دانشگاه، کالج، دوره زبان یا مسیر آموزشی معتبر">
          <TwoColumnCard
            intro="برای ویزای تحصیلی، داشتن پذیرش معتبر از دانشگاه، کالج یا دوره آموزشی در آلمان نقطه شروع پرونده است. زمان‌بندی اپلای اهمیت زیادی دارد، چون هم دریافت پذیرش و هم گرفتن وقت می‌تواند زمان‌بر باشد."
            items={studentDocs}
            asideTitle="نکته آلمانیار"
            asideText="اگر هم‌زمان باید مدرک زبان، ترجمه مدارک، حساب مسدودشده و وقت سفارت را مدیریت کنید، بهتر است تقویم اقدام از ابتدا طراحی شود تا مهلت پذیرش یا شروع ترم از دست نرود."
          />
        </Section>

        <Section title="ویزای کاری آلمان از ترکیه" subtitle="برای متقاضیانی که پیشنهاد کاری معتبر دارند">
          <TwoColumnCard
            intro="ویزای کاری معمولاً به قرارداد یا پیشنهاد کاری معتبر از کارفرمای آلمانی نیاز دارد. بسته به موقعیت شغلی، سطح زبان آلمانی یا انگلیسی، تایید مدارک دانشگاهی و تناسب سابقه کاری اهمیت پیدا می‌کند."
            items={workDocs}
            asideTitle="برای Blue Card"
            asideText="در مسیر کارت آبی اروپا، مدرک دانشگاهی، قرارداد کاری و حداقل حقوق قانونی نقش کلیدی دارد. اعداد حقوق و شرایط باید بر اساس مقررات همان سال بررسی شود."
          />
        </Section>

        <Section title="ویزای آوسبیلدونگ آلمان از ترکیه" subtitle="مسیر آموزش حرفه‌ای با قرارداد مشخص">
          <TwoColumnCard
            intro="برای آوسبیلدونگ، قرارداد معتبر با مرکز یا کارفرمای آلمانی و هماهنگی با تاریخ شروع دوره حیاتی است. بسیاری از پرونده‌ها به مدرک زبان آلمانی حداقل B1 نیاز دارند."
            items={ausbildungDocs}
            asideTitle="ریسک رایج"
            asideText="اگر وقت سفارت دیرتر از شروع دوره برسد، ممکن است قرارداد یا برنامه آموزشی نیاز به اصلاح داشته باشد. زمان‌بندی باید قبل از امضا و پرداخت هزینه‌ها بررسی شود."
          />
        </Section>

        <Section title="کارت شانس آلمان از ترکیه" subtitle="مسیر امتیازمحور برای جستجوی کار در آلمان">
          <ContentCard>
            <p>
              کارت شانس آلمان بر پایه امتیازدهی طراحی شده و عواملی مثل مدرک تحصیلی، سابقه کاری، سن، زبان آلمانی یا انگلیسی و تمکن مالی را در نظر می‌گیرد.
              اگر متقاضی ایرانی اقامت معتبر و قابل اثبات ترکیه داشته باشد، امکان اقدام از ترکیه باید بر اساس مسیر رسمی و نوع اقامت او بررسی شود.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {['مدرک تحصیلی', 'سابقه کاری', 'زبان', 'تمکن مالی'].map((item) => (
                <div key={item} className="rounded-xl bg-blue-50 p-4 text-center font-bold text-blue-800">{item}</div>
              ))}
            </div>
          </ContentCard>
        </Section>

        <Section title="رزرو وقت سفارت آلمان از طریق iDATA در ترکیه" subtitle="مسیر وقت و تحویل مدارک بسته به نوع ویزا متفاوت است">
          <ContentCard>
            <p>
              iDATA برای برخی درخواست‌های ویزای آلمان در ترکیه نقش کارگزار رسمی دارد و ممکن است ثبت‌نام در فهرست انتظار، دریافت مدارک،
              بیومتریک یا بازگرداندن پاسپورت از طریق آن انجام شود. با این حال تصمیم نهایی درباره ویزا را نمایندگی آلمان می‌گیرد.
            </p>
            <p>
              روش رزرو وقت برای شنگن، ویزای تحصیلی، کاری، خانواده یا کارت شانس یکسان نیست. بخشی از ویزاهای ملی نیز ممکن است از طریق
              پرتال خدمات کنسولی آلمان یا مسیرهای رسمی دیگر مدیریت شود. هزینه‌ها، دفتر محل مراجعه و روند ثبت‌نام هم قابل تغییر است.
            </p>
            <Notice>
              قبل از پرداخت هر هزینه‌ای، آخرین اطلاعات را فقط از وب‌سایت رسمی iDATA و نمایندگی‌های آلمان در ترکیه بررسی کنید.
            </Notice>
          </ContentCard>
        </Section>

        <Section title="هزینه‌های درخواست ویزای آلمان از ترکیه" subtitle="اعداد دقیق وابسته به نوع ویزا، شهر، مرکز درخواست و تاریخ اقدام هستند">
          <div className="overflow-x-auto rounded-2xl bg-white shadow">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                <tr>
                  <th className="px-5 py-4 text-right">دسته هزینه</th>
                  <th className="px-5 py-4 text-right">برچسب</th>
                  <th className="px-5 py-4 text-right">توضیح</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {costRows.map((row) => (
                  <tr key={row[0]} className="transition hover:bg-blue-50">
                    <td className="px-5 py-4 font-bold text-gray-800">{row[0]}</td>
                    <td className="px-5 py-4 text-blue-700">{row[1]}</td>
                    <td className="px-5 py-4 leading-7 text-gray-600">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="گرفتن ویزای آلمان از ترکیه چقدر طول می‌کشد؟" subtitle="زمان بررسی با زمان انتظار برای وقت فرق دارد">
          <div className="grid gap-5 md:grid-cols-3">
            {processingRows.map((row) => (
              <div key={row[0]} className="rounded-2xl bg-white p-6 text-center shadow card-hover">
                <h3 className="mb-3 font-bold text-gray-800">{row[0]}</h3>
                <p className="leading-8 text-blue-700">{row[1]}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 rounded-2xl border-r-4 border-amber-500 bg-amber-50 p-5 leading-8 text-amber-900">
            این زمان‌ها تقریبی هستند و بسته به پرونده، نوع ویزا، کامل بودن مدارک، پاسخ اداره‌های آلمان و شرایط سفارت تغییر می‌کنند.
            در ترکیه، زمان انتظار برای دریافت وقت ممکن است از خود زمان بررسی پرونده طولانی‌تر باشد.
          </p>
        </Section>

        <Section title="آموزش زبان آلمانی و آزمون‌های زبان در ترکیه" subtitle="زبان، هم برای پذیرش و هم برای ویزا اثر مستقیم دارد">
          <ContentCard>
            <p>
              Goethe-Institut در ترکیه در شهرهای استانبول، آنکارا و ازمیر فعال است و دوره‌ها و آزمون‌های زبان آلمانی برگزار می‌کند.
              شرکت در کلاس زبان می‌تواند آمادگی شما را بهتر کند، اما به‌صورت خودکار حق دریافت اقامت ترکیه یا صلاحیت درخواست ویزای آلمان از ترکیه ایجاد نمی‌کند.
            </p>
            <p>
              آلمانیار می‌تواند برای ثبت‌نام آزمون‌های زبان و مسیرهای مرتبط مثل Goethe، telc، TestDaF، TestAS و ÖSD به شما کمک کند؛
              از انتخاب آزمون و تاریخ مناسب تا ثبت‌نام و هماهنگی پرداخت.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {['Goethe', 'telc', 'TestDaF', 'TestAS', 'ÖSD'].map((exam) => (
                <span key={exam} className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-bold text-yellow-800">{exam}</span>
              ))}
            </div>
          </ContentCard>
        </Section>

        <Section title="لینک‌های داخلی پیشنهادی" subtitle="مسیرهای مرتبط در آلمانیار">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InternalLink href="/fa#services" label="خدمات ما" />
            <InternalLink href="/fa#contact" label="مشاوره مهاجرت تحصیلی" />
            <InternalLink href="/fa/exams" label="ثبت‌نام آزمون‌های بین‌المللی" />
            <InternalLink href="/fa/turkey-residence" label="اقامت ترکیه" />
            <InternalLink href="/fa/guide" label="ویزای تحصیلی آلمان" />
            <InternalLink href="/fa#ausbildung" label="آوسبیلدونگ" />
            <InternalLink href="/fa/evaluation" label="بررسی شرایط من" />
            <InternalLink href="/fa#contact" label="تماس با ما" />
          </div>
        </Section>

        <Section title="سوالات متداول" subtitle="پاسخ کوتاه به پرسش‌های رایج ایرانیان">
          <FaqAccordion items={faqItems} />
        </Section>

        <Section title="منابع رسمی برای بررسی آخرین وضعیت" subtitle="پیش از اقدام، این لینک‌ها را دوباره چک کنید">
          <div className="grid gap-4 md:grid-cols-2">
            {officialLinks.map(([label, href]) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-gray-100 bg-white p-5 font-bold text-gray-800 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                {label}
                <span className="mr-2 text-blue-600">↗</span>
              </a>
            ))}
          </div>
        </Section>

        <section className="rounded-3xl bg-gradient-to-br from-blue-600 to-purple-700 p-8 text-center text-white shadow-2xl md:p-10">
          <h2 className="mb-4 text-2xl font-bold md:text-3xl">
            اگر قصد دارید از ترکیه برای ویزای آلمان اقدام کنید، قبل از هر هزینه‌ای شرایط خود را بررسی کنید.
          </h2>
          <p className="mx-auto mb-7 max-w-3xl leading-8 opacity-90">
            ما ابتدا امکان‌پذیری مسیر، نوع اقامت ترکیه، زمان‌بندی و مدارک شما را بررسی می‌کنیم تا تصمیم‌تان واقع‌بینانه باشد.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/fa#contact" className="rounded-xl bg-yellow-500 px-8 py-3 font-bold text-gray-900 transition hover:bg-yellow-600 hover:scale-105">
              دریافت مشاوره رایگان
            </Link>
            <Link href="/fa/evaluation" className="rounded-xl bg-white px-8 py-3 font-bold text-blue-700 transition hover:bg-blue-50 hover:scale-105">
              درخواست بررسی پرونده
            </Link>
          </div>
        </section>

        <div className="rounded-2xl border-r-4 border-red-500 bg-red-50 p-5 text-sm leading-8 text-red-900">
          <b>سلب مسئولیت:</b> اطلاعات این صفحه جنبه راهنمایی عمومی دارد و جایگزین مشاوره حقوقی یا بررسی رسمی سفارت نیست.
          قوانین و هزینه‌ها ممکن است تغییر کنند؛ بنابراین پیش از هر اقدام، آخرین اطلاعیه‌های رسمی سفارت آلمان، iDATA و مراجع مربوطه را بررسی کنید.
        </div>
      </main>

    </div>
  );
}

const stepDescriptions = [
  'تابعیت، محل اقامت، هدف سفر، سابقه ویزا و ریسک‌های پرونده بررسی می‌شود.',
  'اگر اقامت ترکیه ندارید، باید ببینید آیا اصلاً مسیر ترکیه برای شما منطقی و قانونی است یا نه.',
  'تحصیلی، کاری، آوسبیلدونگ، پیوست، کارت شانس یا شنگن هرکدام مدارک و زمان‌بندی متفاوت دارند.',
  'مدارک هویتی، اقامتی، مالی، تحصیلی یا کاری باید کامل، ترجمه‌شده و هماهنگ باشند.',
  'پرونده بدون پذیرش، قرارداد یا مدرک هدف سفر معمولاً قابل دفاع نیست.',
  'مسیر وقت بسته به نوع ویزا می‌تواند از iDATA، پرتال کنسولی یا سازوکار رسمی دیگر باشد.',
  'در روز مراجعه، نسخه‌های کامل مدارک، فرم‌ها، عکس و هزینه‌ها باید آماده باشد.',
  'پس از ثبت پرونده، سفارت یا مرکز درخواست درباره نتیجه و تکمیل مدارک اطلاع‌رسانی می‌کند.',
  'پس از دریافت ویزا، بیمه، بلیت، محل اقامت و برنامه ورود به آلمان نهایی می‌شود.',
];

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-10 text-center">
        <h2 className="mb-2 text-3xl font-bold gradient-text md:text-4xl">{title}</h2>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
        <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
      </div>
      {children}
    </section>
  );
}

function ContentCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5 rounded-2xl bg-white p-6 leading-8 text-gray-700 shadow-xl md:p-8">
      {children}
    </div>
  );
}

function AlertBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-r-4 border-red-500 bg-white p-6 shadow-xl">
      <h2 className="mb-3 text-xl font-bold text-red-700">{title}</h2>
      <p className="leading-8 text-gray-700">{children}</p>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border-r-4 border-amber-500 bg-amber-50 p-4 text-sm leading-8 text-amber-900">
      {children}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3 border-t border-gray-100 pt-3">
      <p className="text-xs font-bold text-blue-600">{label}</p>
      <p className="mt-1 text-sm leading-7 text-gray-700">{value}</p>
    </div>
  );
}

function TwoColumnCard({
  intro,
  items,
  asideTitle,
  asideText,
}: {
  intro: string;
  items: string[];
  asideTitle: string;
  asideText: string;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="rounded-2xl bg-white p-6 shadow-xl md:p-8">
        <p className="mb-5 leading-8 text-gray-700">{intro}</p>
        <h3 className="mb-4 font-bold text-gray-800">مدارک اصلی</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item} className="flex items-start gap-2 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
              <span className="mt-0.5 text-green-500">✓</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border-r-4 border-blue-500 bg-blue-50 p-6 shadow">
        <h3 className="mb-3 text-lg font-bold text-blue-900">{asideTitle}</h3>
        <p className="leading-8 text-blue-900/80">{asideText}</p>
      </div>
    </div>
  );
}

function InternalLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="rounded-2xl bg-white p-5 text-center font-bold text-gray-800 shadow transition hover:-translate-y-1 hover:text-blue-700 hover:shadow-lg">
      {label}
    </Link>
  );
}

function toFaNumber(value: number) {
  return new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(value);
}
