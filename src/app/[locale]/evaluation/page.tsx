import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary, locales, type Locale } from '@/lib/i18n';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EvaluationWizard from '@/components/EvaluationWizard';

export const metadata: Metadata = {
  title: 'فرم ارزیابی تحصیل در آلمان | مهاجرت آلمان',
  description: 'فرم ارزیابی رایگان مهاجرت تحصیلی به آلمان. شرایط خود را وارد کنید تا کارشناسان ما بهترین مسیر را به شما پیشنهاد دهند.',
};

export default async function EvaluationPage({ params }: { params: { locale: Locale } }) {
  if (!locales.includes(params.locale)) notFound();
  const dict = await getDictionary(params.locale);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header dict={dict} locale={params.locale} />

      <section className="pt-32 pb-10 text-center container mx-auto px-6">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">
          فرم ارزیابی اولیه تحصیل در آلمان
        </h1>
        <p className="text-lg text-gray-700 font-medium">
          انتخاب بهترین مسیر تحصیلی با توجه به شرایط شما
        </p>
        <div className="max-w-3xl mx-auto mt-6 space-y-2 text-sm text-gray-600 leading-7">
          <p>
            تمامی اطلاعات وارد شده توسط شما در این فرم محرمانه تلقی شده و فقط جهت بررسی امکان مهاجرت
            مورد بررسی قرار می‌گیرد و در اختیار شخص یا سازمان دیگری قرار نخواهد گرفت.
          </p>
          <p>
            پس از تکمیل و ارسال فرم، شرایط شما توسط کارشناسان ما به دقت بررسی شده و مناسب‌ترین روش
            تحصیلی مختص شما، از طریق ایمیل برایتان ارسال می‌شود.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-6 pb-20">
        <EvaluationWizard />
      </main>

      <Footer dict={dict} />
    </div>
  );
}
