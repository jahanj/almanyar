'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

/**
 * Phase-8C — TipTap rich-text editor for the post form.
 *
 * RTL Persian-first. Persists both HTML (for SSR) and JSON (for
 * lossless re-edit) through `onChange`.
 *
 * Minimal toolbar — Notion/Linear-style: headings, bold/italic, lists,
 * blockquote, link, code. Image insertion lands in 8G.
 */

export interface EditorChange {
  html: string;
  json: object;
}

export default function PostEditor({
  initialHtml,
  initialJson,
  onChange,
}: {
  initialHtml?: string;
  initialJson?: object | null;
  onChange: (next: EditorChange) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener', class: 'text-emerald-700 underline' },
      }),
      Placeholder.configure({ placeholder: 'متن پست را اینجا بنویسید…' }),
    ],
    // Prefer JSON when available — it round-trips formatting exactly.
    // Fall back to HTML for posts authored under Phase 8B (textarea).
    content: initialJson ?? initialHtml ?? '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        dir: 'rtl',
        class: 'prose prose-slate max-w-none min-h-[280px] focus:outline-none p-4 leading-8',
      },
    },
    onUpdate({ editor }) {
      onChange({ html: editor.getHTML(), json: editor.getJSON() });
    },
  });

  // If parent swaps in a new post (edit page navigates between two posts),
  // reset content to the new initial values.
  useEffect(() => {
    if (!editor) return;
    // Suppress onUpdate during initial hydration so we don't overwrite the
    // parent's initial state with the editor's empty render.
    if (initialJson) editor.commands.setContent(initialJson, { emitUpdate: false });
    else if (initialHtml !== undefined) editor.commands.setContent(initialHtml, { emitUpdate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden bg-white">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
      <Btn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Btn>
      <Btn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</Btn>
      <Sep />
      <Btn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="پررنگ"><b>B</b></Btn>
      <Btn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="کج"><i>I</i></Btn>
      <Sep />
      <Btn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="لیست">•‒</Btn>
      <Btn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="لیست شماره‌دار">1.</Btn>
      <Btn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="نقل قول">❝</Btn>
      <Btn active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="کد">{'</>'}</Btn>
      <Sep />
      <Btn
        active={editor.isActive('link')}
        onClick={() => {
          const previous = editor.getAttributes('link').href as string | undefined;
          const url = window.prompt('آدرس لینک (با https:// شروع شود):', previous ?? '');
          if (url === null) return; // cancelled
          if (url === '') {
            editor.chain().focus().unsetLink().run();
            return;
          }
          editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }}
        title="لینک"
      >🔗</Btn>
      <div className="ms-auto text-xs text-slate-500">
        TipTap • RTL
      </div>
    </div>
  );
}

function Btn({
  children, onClick, active = false, title,
}: { children: React.ReactNode; onClick: () => void; active?: boolean; title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-2 py-1 text-xs rounded transition ${active ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-200'}`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="w-px h-5 bg-slate-300 mx-1" aria-hidden="true" />;
}
