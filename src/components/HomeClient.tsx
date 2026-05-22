'use client';

import { useState } from 'react';
import Header from './Header';
import Hero from './Hero';
import TrustBar from './TrustBar';
import Services from './Services';
import Process from './Process';
import Education from './Education';
import TurkeyResidence from './TurkeyResidence';
import Testimonials from './Testimonials';
import ContactForm from './ContactForm';
import CtaBanner from './CtaBanner';
import Footer from './Footer';
import ReviewModal from './ReviewModal';
import type { Dictionary, Locale } from '@/lib/i18n';

type Review = {
  id: string;
  authorName: string;
  rating: number;
  title?: string | null;
  content: string;
  createdAt: string;
};

export default function HomeClient({
  dict,
  locale,
  initialReviews,
  averageRating,
  totalReviews,
}: {
  dict: Dictionary;
  locale: Locale;
  initialReviews: Review[];
  averageRating: number;
  totalReviews: number;
}) {
  const [open, setOpen] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0);

  return (
    <>
      <Header dict={dict} locale={locale} />
      <main>
        <Hero
          dict={dict}
          locale={locale}
          averageRating={averageRating}
          totalReviews={totalReviews}
          onReviewClick={() => setOpen(true)}
        />
        <TrustBar dict={dict} />
        <Services dict={dict} />
        <Process dict={dict} />
        <Education dict={dict} locale={locale} />
        <TurkeyResidence dict={dict} locale={locale} />
        <Testimonials dict={dict} initialReviews={initialReviews} refreshSignal={refreshSignal} />
        <CtaBanner dict={dict} locale={locale} />
        <ContactForm dict={dict} />
      </main>
      <Footer dict={dict} locale={locale} />
      <ReviewModal
        open={open}
        onClose={() => setOpen(false)}
        dict={dict}
        onSubmitted={() => setRefreshSignal((n) => n + 1)}
      />
    </>
  );
}
