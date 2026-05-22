/**
 * Rich, structured content for each SEO topic page.
 *
 * Keyed by the topic `href` (see `@/lib/germany-topics`). The topic-route
 * template renders these sections in order, themed by the topic's group color.
 *
 * Authoring rules (house style):
 *  - Persian (fa), warm but expert tone. Helpful and realistic — never spammy
 *    or exaggerated ("بهترین"، "تضمینی"، "۱۰۰٪"). No invented statistics.
 *  - For figures that change yearly (salary thresholds, fees, block-account
 *    amount), phrase as approximate and time-bound ("در سال‌های اخیر حدود…")
 *    rather than a hard promise.
 *  - intro: 2–3 sentences, sets context + reassures.
 *  - highlights: 3–4 scannable facts (the "at a glance" row).
 *  - sections: the body. Each has a heading and prose; bullets optional.
 *  - steps: only when the topic is a process (apply, get appointment, etc.).
 *  - faqs: 4–6 real questions Iranians ask, with concrete answers.
 */

export type TopicHighlight = {
  /** Emoji or short symbol. */
  icon: string;
  title: string;
  desc: string;
};

export type TopicSection = {
  heading: string;
  /** One or more paragraphs. Use \n\n to separate paragraphs. */
  body: string;
  /** Optional bullet list rendered under the prose. */
  bullets?: string[];
};

export type TopicStep = {
  title: string;
  desc: string;
};

export type TopicFaq = {
  q: string;
  a: string;
};

export type TopicContent = {
  /** Lead paragraph shown directly under the hero. */
  intro: string;
  /** Scannable "at a glance" facts. */
  highlights?: TopicHighlight[];
  /** Main prose body. */
  sections: TopicSection[];
  /** Step-by-step process, when applicable. */
  steps?: TopicStep[];
  /** Frequently asked questions (also emitted as FAQ JSON-LD). */
  faqs?: TopicFaq[];
  /** Optional override for the closing call-to-action. */
  cta?: { title: string; desc: string };
};

export type TopicContentMap = Record<string, TopicContent>;
