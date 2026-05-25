import Link from 'next/link';
import PostForm from '@/components/admin/PostForm';

export default function NewPostPage() {
  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/posts" className="text-sm text-blue-600 hover:underline">← بازگشت به فهرست</Link>
        <h1 className="text-3xl font-bold mt-2">پست جدید</h1>
      </div>
      <PostForm />
    </div>
  );
}
