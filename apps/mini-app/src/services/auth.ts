import { getUserInfo, getAccessToken, getPhoneNumber } from 'zmp-sdk/apis';
import { formatApiUrl } from './api.js';

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
   * Khoi tao dang nhap Zalo OAuth that tu Zalo App va lay JWT token tu Backend API
   */
  public static async initZaloAuth(): Promise<{ token: string; user: UserProfile }> {
    let realUserInfo: any = null;
    let accessToken = '';

    // 1. Goi Zalo Mini App SDK lay thong tin nguoi dung that (Avatar, Ten, Zalo ID)
    try {
      const infoRes: any = await getUserInfo({
        autoRequestPermission: true,
      });
      console.log('[ZMP Auth] Ket qua getUserInfo tu Zalo SDK:', infoRes);
      if (infoRes) {
        realUserInfo = infoRes.userInfo || infoRes;
      }
    } catch (userErr) {
      console.warn('[ZMP Auth] Chua cap quyen getUserInfo hoac chay tren web browser:', userErr);
    }

    // 2. Goi lay Access Token tu Zalo SDK
    try {
      accessToken = await getAccessToken({});
      console.log('[ZMP Auth] Lay accessToken thanh cong');
    } catch (tokenErr) {
      console.warn('[ZMP Auth] Chua lay duoc accessToken Zalo:', tokenErr);
    }

    // 3. Xay dung Profile tu thong tin Zalo that ngay lap tuc
    const displayName = realUserInfo?.name || 'Khách hàng Zalo';
    const avatar = realUserInfo?.avatar || '';
    const initials = displayName
      .split(' ')
      .filter(Boolean)
      .pop()
      ?.slice(0, 2)
      .toUpperCase() || 'KH';

    let currentProfile: UserProfile = {
      id: realUserInfo?.id || 'usr-zalo-current',
      zaloId: realUserInfo?.id,
      fullName: displayName,
      phone: '0918 234 567',
      avatarUrl: avatar,
      avatarText: initials,
    };

    let token = 'cawaco_zalo_session_token';

    // 4. Gui len Backend de dong bo CSDL PostgreSQL (neu Backend online)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(formatApiUrl('/api/v1/auth/zalo'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          accessToken: accessToken || undefined,
          userInfo: realUserInfo || undefined,
        }),
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          token = json.data.token || token;
          const u = json.data.user;
          if (u) {
            currentProfile = {
              id: u.id || currentProfile.id,
              zaloId: u.zaloId || currentProfile.zaloId,
              fullName: u.fullName || currentProfile.fullName,
              phone: u.phone || currentProfile.phone,
              avatarUrl: u.avatarUrl || currentProfile.avatarUrl,
              avatarText: (u.fullName || currentProfile.fullName)
                .split(' ')
                .filter(Boolean)
                .pop()
                ?.slice(0, 2)
                .toUpperCase() || initials,
            };
          }
        }
      }
    } catch (backendErr) {
      console.log('[ZMP Auth] Su dung profile Zalo client-side:', backendErr);
    }

    // 5. Luu vao localStorage
    try {
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentProfile));
    } catch (e) {
      console.warn('Cannot write to localStorage', e);
    }

    return { token, user: currentProfile };
  }

  /**
   * Xin quyen lay so dien thoai that tu Zalo
   */
  public static async requestRealPhoneNumber(): Promise<string | null> {
    try {
      const res: any = await getPhoneNumber({
        autoRequestPermission: true,
      });
      const token = res?.token || res?.number || null;
      console.log('[ZMP Auth] Phone token:', token);
      return token;
    } catch (err) {
      console.warn('[ZMP Auth] Khach hang tu choi cap so dien thoai:', err);
      return null;
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
