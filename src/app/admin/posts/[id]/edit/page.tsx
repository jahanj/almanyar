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
          bodyHtml: post.bodyHtml,
          bodyJson: (post.bodyJson as object | null) ?? null,
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
