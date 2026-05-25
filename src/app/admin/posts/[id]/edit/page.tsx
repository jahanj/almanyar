import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import PostForm from '@/components/admin/PostForm';

export const dynamic = 'force-dynamic';

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login?callbackUrl=/admin/posts');
  }

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: { tags: { select: { tag: { select: { slug: true } } } } },
  });
  if (!post) notFound();

  // The textarea expects the original prose; pre-Phase-8C we round-trip
  // by stripping the simple <p>/<br/> wrappers we wrote on create. This
  // is acceptable for plain-text-authored posts; once TipTap is in,
  // bodyJson becomes the source for editing and this fallback is unused.
  const bodyText = post.bodyHtml
    .replace(/<\/p>\s*<p>/g, '\n\n')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<\/?p>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .trim();

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/posts" className="text-sm text-blue-600 hover:underline">← بازگشت به فهرست</Link>
        <h1 className="text-3xl font-bold mt-2">ویرایش پست</h1>
        <p className="text-xs text-gray-500 mt-1 font-mono" dir="ltr">/{post.slug}</p>
      </div>
      <PostForm
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          categoryId: post.categoryId,
          excerpt: post.excerpt,
          body: bodyText,
          seoTitle: post.seoTitle,
          metaDescription: post.metaDescription,
          coverImageUrl: post.coverImageUrl,
          coverImageAlt: post.coverImageAlt,
          status: post.status,
          tagSlugs: post.tags.map((t) => t.tag.slug),
        }}
      />
    </div>
  );
}
