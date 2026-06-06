import { headers } from 'next/headers';
import { verifyToken } from '@/modules/auth/service/jwt.service';
import { AppError } from './errors';

export async function getCurrentUser() {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Unauthorized', 401);
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (!payload) {
    throw new AppError('Unauthorized', 401);
  }

  return payload;
}
