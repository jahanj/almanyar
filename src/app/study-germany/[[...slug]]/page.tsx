import { topicRoute } from '@/lib/topic-route';

const route = topicRoute('study-germany');

export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
