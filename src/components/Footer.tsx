import type { Dictionary } from '@/lib/i18n';

export default function Footer({ dict }: { dict: Dictionary }) {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-0">
      <div className="container mx-auto px-6 text-center">
        <p className="text-lg font-bold mb-2">🇩🇪 {dict.meta.title}</p>
        <p className="text-sm opacity-80">© {year} — {dict.footer.rights}</p>
      </div>
    </footer>
  );
}
