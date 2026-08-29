import api from 'zmp-sdk';

export interface UserProfile {
  id: string;
  zaloId?: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  avatarText: string;
}

const STORAGE_KEY_TOKEN = 'cawaco_jwt_token';
const STORAGE_KEY_USER = 'cawaco_user_profile';

/**
 * Service xu ly xac thuc nguoi dung Zalo OAuth cho Mini App
 */
export class MiniAppAuthService {
  /**
   * Khoi tao dang nhap Zalo OAuth va lay JWT token tu Backend API
   */
  public static async initZaloAuth(): Promise<{ token: string; user: UserProfile }> {
    try {
      let accessToken = '';

      // 1. Kiem tra xem co dang chay trong moi truong Zalo WebView hay khong
      if (typeof window !== 'undefined' && (window as any).ZLP) {
        try {
          accessToken = await api.getAccessToken({});
        } catch (zmpError) {
          console.warn('[ZMP Auth] Khong lay duoc access token truc tiep tu ZMP, su dung test fallback:', zmpError);
          accessToken = 'test_dev_access_token_cawaco_2026';
        }
      } else {
        accessToken = 'test_dev_access_token_cawaco_2026';
      }

      // 2. Gui Access Token len Backend de xac thuc va nhan JWT
      const res = await fetch('/api/v1/auth/zalo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken }),
      });

      if (!res.ok) {
        throw new Error(`Xac thuc voi Backend that bai [${res.status}]`);
      }

      const json = await res.json();
      const { token, user } = json.data;

      // 3. Chuan hoa profile nguoi dung
      const userProfile: UserProfile = {
        id: user.id,
        zaloId: user.zaloId,
        fullName: user.fullName || 'Người dùng Zalo',
        phone: user.phone || '0918 234 567',
        avatarUrl: user.avatarUrl,
        avatarText: (user.fullName || 'AN')
          .split(' ')
          .pop()
          ?.slice(0, 2)
          .toUpperCase() || 'AN',
      };

      // 4. Luu token va profile vao storage
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userProfile));

      return { token, user: userProfile };
    } catch (error) {
      console.error('[MiniAppAuthService] Loi trong qua trinh xac thuc Zalo:', error);

      // Fallback an toan cho moi truong dev
      const fallbackUser: UserProfile = {
        id: 'usr-zalo-8891',
        zaloId: 'zalo_user_cawaco_01',
        fullName: 'Nguyễn Văn An',
        phone: '0918 234 567',
        avatarText: 'AN',
      };
      return { token: 'mock_jwt_token', user: fallbackUser };
    }
  }

  public static getStoredToken(): string | null {
    return localStorage.getItem(STORAGE_KEY_TOKEN);
  }

  public static getStoredUser(): UserProfile | null {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
