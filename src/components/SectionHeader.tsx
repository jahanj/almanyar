type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'start';
  className?: string;
};

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className = '',
}: SectionHeaderProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-start';

  return (
    <div className={`max-w-3xl mb-12 md:mb-16 ${alignClass} ${className}`}>
      {eyebrow && (
        <p className="mb-3 inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-lg">{subtitle}</p>
      )}
    </div>
  );
}
