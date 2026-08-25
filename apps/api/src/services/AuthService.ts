import jwt from 'jsonwebtoken';
import { UserRole } from '@aquaflow/types';

export interface AuthUserPayload {
  id: string;
  phone?: string;
  zaloId?: string;
  fullName: string;
  role: UserRole;
}

export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'aquaflow_jwt_secret_dev_2026';
  private readonly jwtExpiresIn = '7d';

  public generateToken(user: AuthUserPayload): string {
    return jwt.sign(user, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
  }

  public verifyToken(token: string): AuthUserPayload | null {
    try {
      return jwt.verify(token, this.jwtSecret) as AuthUserPayload;
    } catch {
      return null;
    }
  }

  public async authenticateZalo(accessToken: string): Promise<{ token: string; user: AuthUserPayload }> {
    // Trong che do Mock / Development
    const mockUser: AuthUserPayload = {
      id: 'usr-zalo-8891',
      zaloId: 'zalo_uid_' + accessToken.slice(0, 8),
      fullName: 'Nguyễn Văn An',
      phone: '0918234567',
      role: 'CITIZEN',
    };

    const token = this.generateToken(mockUser);
    return { token, user: mockUser };
  }
}
