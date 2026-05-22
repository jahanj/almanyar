/**
 * Merged rich content for every SEO topic page, keyed by topic `href`.
 * Each group file exports a default TopicContentMap; we spread them together.
 *
 * The topic-route template looks up TOPIC_CONTENT[topic.href]; topics without
 * an entry fall back to a graceful generic body (handled in the template).
 */
import type { TopicContent, TopicContentMap } from './types';
import visaCore from './visa-core';
import visaServices from './visa-services';
import study from './study';
import work from './work';
import jobs from './jobs';
import lifeExams from './life-exams';

export const TOPIC_CONTENT: TopicContentMap = {
  ...visaCore,
  ...visaServices,
  ...study,
  ...work,
  ...jobs,
  ...lifeExams,
};

export type { TopicContent, TopicContentMap } from './types';

export function getTopicContent(href: string): TopicContent | undefined {
  return TOPIC_CONTENT[href];
}
