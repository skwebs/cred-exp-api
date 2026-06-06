import { POST as loginPOST } from '@/app/api/auth/login/route';
import { GET as meGET } from '@/app/api/auth/me/route';
import { AuthService } from '@/modules/auth/service/auth.service';
import { verifyToken } from '@/modules/auth/service/jwt.service';

jest.mock('@/modules/auth/service/auth.service');
jest.mock('@/modules/auth/service/jwt.service');
jest.mock('next/headers', () => ({
  headers: jest.fn().mockResolvedValue({
    get: jest.fn().mockReturnValue('Bearer valid-token'),
  }),
}));

describe('Auth API Routes', () => {
  describe('POST /api/auth/login', () => {
    it('should login a user', async () => {
      const mockResult = { user: { id: '1', email: 'test@example.com' }, token: 'token' };
      (AuthService.prototype.login as jest.Mock).mockResolvedValue(mockResult);

      const request = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
      });

      const response = await loginPOST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual(mockResult);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user', async () => {
      const mockUser = { id: '1', name: 'Test', email: 'test@example.com' };
      (verifyToken as jest.Mock).mockReturnValue({ userId: '1', email: 'test@example.com' });
      (AuthService.prototype.getMe as jest.Mock).mockResolvedValue(mockUser);

      const response = await meGET();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual(mockUser);
    });

    it('should return 401 if unauthorized', async () => {
      const { headers } = require('next/headers');
      headers.mockResolvedValueOnce({
        get: jest.fn().mockReturnValue(null),
      });

      const response = await meGET();
      expect(response.status).toBe(401);
    });
  });
});
