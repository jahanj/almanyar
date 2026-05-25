'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Phase-8B — reusable create/edit form for posts.
 *
 * Plain textarea for body in this phase; Phase 8C swaps it for TipTap.
 * Tag input is comma-separated for now; Phase 8C will add a multi-select
 * with autocomplete.
 */

type Category = { id: string; slug: string; name: string };

export interface PostInitial {
  id?: string;
  title?: string;
  slug?: string;
  categoryId?: string;
  excerpt?: string | null;
  body?: string;
  seoTitle?: string | null;
  metaDescription?: string | null;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  tagSlugs?: string[];
}

export default function PostForm({ initial }: { initial?: PostInitial }) {
  const router = useRouter();
  const isEdit = !!initial?.id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle ?? '');
  const [metaDescription, setMetaDescription] = useState(initial?.metaDescription ?? '');
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl ?? '');
  const [coverImageAlt, setCoverImageAlt] = useState(initial?.coverImageAlt ?? '');
  const [tagsText, setTagsText] = useState((initial?.tagSlugs ?? []).join(', '));
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>(initial?.status ?? 'DRAFT');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch('/api/admin/post-categories')
      .then((r) => r.json())
      .then((d) => {
        setCategories(d.categories ?? []);
        if (!categoryId && d.categories?.length) setCategoryId(d.categories[0].id);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    setError(null);
    if (title.trim().length < 1) { setError('عنوان لازم است'); return; }
    if (!categoryId) { setError('دسته‌بندی را انتخاب کنید'); return; }

    setBusy(true);
    try {
      const tagSlugs = tagsText.split(',').map((s) => s.trim()).filter(Boolean);
      const payload = {
        title, slug: slug.trim() || undefined,
        categoryId, excerpt: excerpt || null, body,
        seoTitle: seoTitle || null,
        metaDescription: metaDescription || null,
        coverImageUrl: coverImageUrl || null,
        coverImageAlt: coverImageAlt || null,
        status,
        tagSlugs,
      };

      const url = isEdit ? `/api/admin/posts/${initial!.id}` : '/api/admin/posts';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as { error?: string }));
        setError(data.error ?? `خطا (HTTP ${res.status})`);
        return;
      }
      router.push('/admin/posts');
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!isEdit) return;
    if (!confirm('این پست حذف شود؟ غیرقابل بازگشت است.')) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/posts/${initial!.id}`, { method: 'DELETE' });
      if (!res.ok) {
        alert('حذف ناموفق');
        return;
      }
      router.push('/admin/posts');
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <Field label="عنوان">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثلاً: تغییرات جدید قانون اقامت آلمان در سال ۱۴۰۵"
          className="w-full border rounded-lg px-3 py-2"
        />
      </Field>

      <Field label="Slug (اختیاری — خالی بگذارید تا از عنوان ساخته شود)">
        <input
          dir="ltr"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="germany-residence-changes-2026"
          className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
        />
      </Field>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="دسته‌بندی">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">— انتخاب کنید —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="وضعیت">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED')}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="DRAFT">پیش‌نویس</option>
            <option value="PUBLISHED">منتشرشده</option>
            <option value="ARCHIVED">بایگانی</option>
          </select>
        </Field>
      </div>

      <Field label="خلاصه (excerpt) — برای کارت‌های feed">
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          maxLength={300}
          placeholder="یک یا دو جمله‌ی کوتاه که زیر تیتر کارت می‌آید."
          className="w-full border rounded-lg px-3 py-2"
        />
      </Field>

      <Field label="متن (هر پاراگراف را با یک خط خالی جدا کنید)">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={14}
          className="w-full border rounded-lg px-3 py-2 leading-7"
        />
        <p className="text-xs text-gray-500 mt-1">ویرایشگر غنی در Phase 8C می‌آید — فعلاً متن ساده.</p>
      </Field>

      <Field label="برچسب‌ها (با ویرگول جدا کنید)">
        <input
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder="visa, embassy, news"
          className="w-full border rounded-lg px-3 py-2"
        />
      </Field>

      <details className="border rounded-lg p-3">
        <summary className="cursor-pointer font-medium text-sm">⚙️ SEO و تصویر کاور (اختیاری)</summary>
        <div className="space-y-4 mt-4">
          <Field label="SEO Title (اگر خالی بود از عنوان استفاده می‌شود)">
            <input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </Field>
          <Field label="Meta description">
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={2}
              maxLength={300}
              className="w-full border rounded-lg px-3 py-2"
            />
          </Field>
          <Field label="URL تصویر کاور (Phase 8C: آپلود مستقیم)">
            <input
              dir="ltr"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="/posts/cover.jpg"
              className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
            />
          </Field>
          <Field label="Alt تصویر کاور">
            <input
              value={coverImageAlt}
              onChange={(e) => setCoverImageAlt(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </Field>
        </div>
      </details>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex items-center gap-3 pt-2 border-t">
        <button
          onClick={submit}
          disabled={busy}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-5 py-2 rounded-lg font-medium"
        >
          {busy ? '...' : (isEdit ? 'ذخیره تغییرات' : 'ایجاد پست')}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border px-5 py-2 rounded-lg"
        >
          انصراف
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="mr-auto text-red-600 hover:underline text-sm"
          >
            حذف پست
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      {children}
    </label>
  );
}
