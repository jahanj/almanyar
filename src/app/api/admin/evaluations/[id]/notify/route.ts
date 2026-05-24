import { handleNotify } from '@/lib/admin-notify';

export const POST = (req: Request, { params }: { params: { id: string } }) =>
  handleNotify(req, 'EVALUATION', params.id);
