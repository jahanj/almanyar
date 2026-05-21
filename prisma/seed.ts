import { PrismaClient, Role, ReviewStatus, ServiceType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@germanbiz.com';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'ChangeMe!2026';

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.ADMIN },
    create: {
      email: adminEmail,
      name: 'Site Admin',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      contactEmail: 'info@germanbiz.com',
      contactPhone: '+90 555 000 0000',
      whatsappNumber: '+905550000000',
    },
  });

  const sampleReviews = [
    {
      authorName: 'علی محمدی',
      rating: 5,
      title: 'تجربه فوق‌العاده',
      content: 'با کمک این تیم تونستم اقامت تحصیلی ترکیه و سپس ویزای آلمان رو بگیرم. ممنون از همه زحمات.',
      serviceType: ServiceType.STUDENT_RESIDENCE,
    },
    {
      authorName: 'مریم احمدی',
      rating: 5,
      title: 'مشاوره دقیق و دلسوزانه',
      content: 'مشاوره‌ها واقعا حرفه‌ای بود. الان دانشجوی دانشگاه TUM هستم.',
      serviceType: ServiceType.UNIVERSITY_SELECTION,
    },
    {
      authorName: 'حسین رضایی',
      rating: 4,
      title: 'پشتیبانی خوب',
      content: 'پشتیبانی پس از ورود به آلمان خیلی کمک‌کننده بود.',
      serviceType: ServiceType.HOUSING,
    },
  ];

  for (const review of sampleReviews) {
    await prisma.review.create({
      data: { ...review, status: ReviewStatus.APPROVED },
    });
  }

  console.log(`✅ Seed completed. Admin: ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
