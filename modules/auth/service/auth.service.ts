import bcrypt from 'bcryptjs';
import { AuthRepository } from '../repository/auth.repository';
import { signToken } from './jwt.service';
import { AppError } from '@/core/errors';
import { registerSchema, loginSchema } from '../schema/auth.schema';

export class AuthService {
  private repository: AuthRepository;

  constructor() {
    this.repository = new AuthRepository();
  }

  async register(data: any) {
    const validatedData = registerSchema.parse(data);
    
    const existingUser = await this.repository.findByEmail(validatedData.email);
    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    
    const [user] = await this.repository.create({
      ...validatedData,
      password: hashedPassword,
    });

    const token = signToken({ userId: user.id, email: user.email });
    return { user: { id: user.id, name: user.name, email: user.email }, token };
  }

  async login(credentials: any) {
    const validatedData = loginSchema.parse(credentials);
    
    const user = await this.repository.findByEmail(validatedData.email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = signToken({ userId: user.id, email: user.email });
    return { user: { id: user.id, name: user.name, email: user.email }, token };
  }

  async getMe(userId: string) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return { id: user.id, name: user.name, email: user.email };
  }
}
