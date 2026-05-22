/**
 * Renders one or more JSON-LD structured-data blocks.
 * Server component — emits a <script type="application/ld+json"> per object so
 * Google and AI search engines (ChatGPT, Gemini, Claude, Perplexity) can parse
 * the page's entities. Pass objects from the builders in `@/lib/seo`.
 */
export default function JsonLd({ data }: { data: object | object[] }) {
  const blocks = Array.isArray(data) ? data : [data];
  return (
    <>
      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Structured data is trusted, server-built content (no user input).
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  );
}
