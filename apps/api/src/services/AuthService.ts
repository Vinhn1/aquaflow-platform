import jwt from 'jsonwebtoken';
import axios from 'axios';
import { UserRole } from '@aquaflow/types';
import { prisma } from '../lib/prisma.js';

export interface AuthUserPayload {
  id: string;
  phone?: string;
  zaloId?: string;
  fullName: string;
  role: UserRole;
}

export interface ZaloGraphMeResponse {
  id: string;
  name: string;
  picture?: {
    data?: {
      url?: string;
    };
  };
  error?: number;
  message?: string;
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

  /**
   * Xac thuc nguoi dung qua Zalo OAuth that su dung Zalo Graph API
   * Tu dong tao moi hoac cap nhat tai khoan nguoi dung vao co so du lieu PostgreSQL
   */
  public async authenticateZalo(accessToken: string): Promise<{ token: string; user: AuthUserPayload }> {
    const isMockAuth = process.env.MOCK_ZALO_AUTH === 'true';

    let zaloId: string;
    let fullName: string;
    let avatarUrl: string | undefined;

    if (!isMockAuth && !accessToken.startsWith('test_')) {
      try {
        // Goi truc tiep den Zalo Open Platform Graph API de lay thong tin nguoi dung that
        const response = await axios.get<ZaloGraphMeResponse>('https://graph.zalo.me/v2.0/me', {
          headers: {
            access_token: accessToken,
          },
          params: {
            fields: 'id,name,picture',
          },
          timeout: 10000,
        });

        if (response.data.error) {
          throw new Error(`Zalo Graph API Error [${response.data.error}]: ${response.data.message}`);
        }

        zaloId = response.data.id;
        fullName = response.data.name || 'Người dùng Zalo';
        avatarUrl = response.data.picture?.data?.url;
      } catch (err: any) {
        console.error('[AuthService] Loi khi goi Zalo Graph API:', err?.response?.data || err?.message);
        throw new Error('XÁC_THỰC_ZALO_THẤT_BẠI: Không thể xác thực Access Token với máy chủ Zalo');
      }
    } else {
      // Che do phat trien offline / test
      zaloId = 'zalo_user_cawaco_01';
      fullName = 'Nguyễn Văn An';
    }

    // Tim kiem nguoi dung trong co so du lieu PostgreSQL theo zaloId
    let dbUser = await prisma.user.findUnique({
      where: { zaloId },
    });

    if (!dbUser) {
      // Tao nguoi dung moi neu chua ton tai
      dbUser = await prisma.user.create({
        data: {
          zaloId,
          fullName,
          avatarUrl,
          role: 'CITIZEN',
        },
      });
      console.log(`[AuthService] Da tao nguoi dung moi tu Zalo OAuth: ${dbUser.fullName} (ID: ${dbUser.id})`);
    } else {
      // Cap nhat ten hoac avatar neu co thay doi
      if (dbUser.fullName !== fullName || (avatarUrl && dbUser.avatarUrl !== avatarUrl)) {
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: { fullName, avatarUrl },
        });
      }
    }

    const authPayload: AuthUserPayload = {
      id: dbUser.id,
      phone: dbUser.phone ?? undefined,
      zaloId: dbUser.zaloId ?? undefined,
      fullName: dbUser.fullName,
      role: dbUser.role as UserRole,
    };

    const token = this.generateToken(authPayload);
    return { token, user: authPayload };
  }
}
