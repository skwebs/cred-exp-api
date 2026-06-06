import { verifyToken } from '@/modules/auth/service/jwt.service';

export default async function proxy(request: Request) {
  const url = new URL(request.url);
  
  // Public routes
  if (
    url.pathname.startsWith('/api/auth/login') || 
    url.pathname.startsWith('/api/auth/register') ||
    url.pathname.startsWith('/docs') ||
    !url.pathname.startsWith('/api')
  ) {
    return;
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (!payload) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting logic could be added here (e.g., using Upstash Redis)
  
  return;
}

