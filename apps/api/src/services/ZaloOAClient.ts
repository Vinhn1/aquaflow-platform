import axios from 'axios';

export interface ZaloOASendResult {
  success: boolean;
  messageId?: string;
  errorCode?: number;
  errorMessage?: string;
  raw?: any;
}

export class ZaloOAClient {
  private appId: string;
  private appSecret: string;
  private oaId: string;
  private accessToken: string | null;
  private refreshToken: string | null;
  private tokenExpiresAt: number;

  constructor() {
    this.appId = process.env.ZALO_APP_ID || '';
    this.appSecret = process.env.ZALO_APP_SECRET || '';
    this.oaId = process.env.ZALO_OA_ID || '';
    this.accessToken = process.env.ZALO_OA_ACCESS_TOKEN || null;
    this.refreshToken = process.env.ZALO_OA_REFRESH_TOKEN || null;
    this.tokenExpiresAt = Number(process.env.ZALO_OA_TOKEN_EXPIRES_AT) || 0;
  }

  public isConfigured(): boolean {
    return Boolean(this.oaId && (this.accessToken || (this.appId && this.appSecret)));
  }

  public getStatus(): {
    configured: boolean;
    hasAccessToken: boolean;
    oaId: string;
    appId: string;
    expiresInHours?: number;
  } {
    const nowSec = Math.floor(Date.now() / 1000);
    const expiresInHours = this.tokenExpiresAt > nowSec 
      ? Math.round((this.tokenExpiresAt - nowSec) / 3600 * 10) / 10 
      : undefined;

    return {
      configured: this.isConfigured(),
      hasAccessToken: Boolean(this.accessToken),
      oaId: this.oaId,
      appId: this.appId,
      expiresInHours,
    };
  }

  /**
   * Tạo URL yêu cầu cấp quyền Zalo OA cho Quản trị viên CAWACO
   */
  public getAuthorizationUrl(redirectUri: string, codeChallenge?: string): string {
    let url = `https://oauth.zaloapp.com/v4/oa/permission?app_id=${this.appId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    if (codeChallenge) {
      url += `&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    }
    return url;
  }

  /**
   * Đổi Authorization Code lấy Access Token & Refresh Token
   */
  public async exchangeCode(code: string, codeVerifier?: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const params = new URLSearchParams();
    params.append('app_id', this.appId);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    if (codeVerifier) {
      params.append('code_verifier', codeVerifier);
    }

    const res = await axios.post('https://oauth.zaloapp.com/v4/oa/access_token', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        secret_key: this.appSecret,
      },
    });

    if (res.data?.access_token) {
      this.accessToken = res.data.access_token;
      this.refreshToken = res.data.refresh_token || this.refreshToken;
      const expiresIn = Number(res.data.expires_in) || 90000;
      this.tokenExpiresAt = Math.floor(Date.now() / 1000) + expiresIn;
      return {
        accessToken: this.accessToken!,
        refreshToken: this.refreshToken || '',
        expiresIn,
      };
    }

    throw new Error(res.data?.message || 'Không thể lấy access token từ Zalo OA');
  }

  /**
   * Tự động làm mới Access Token bằng Refresh Token khi sắp hết hạn
   */
  public async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshToken) {
      return this.accessToken;
    }

    try {
      const params = new URLSearchParams();
      params.append('app_id', this.appId);
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', this.refreshToken);

      const res = await axios.post('https://oauth.zaloapp.com/v4/oa/access_token', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          secret_key: this.appSecret,
        },
      });

      if (res.data?.access_token) {
        this.accessToken = res.data.access_token;
        this.refreshToken = res.data.refresh_token || this.refreshToken;
        const expiresIn = Number(res.data.expires_in) || 90000;
        this.tokenExpiresAt = Math.floor(Date.now() / 1000) + expiresIn;
        console.log('[ZaloOAClient] Làm mới Access Token thành công. Hiệu lực:', expiresIn, 'giây');
        return this.accessToken;
      }
    } catch (err: any) {
      console.error('[ZaloOAClient] Lỗi khi làm mới Access Token:', err?.response?.data || err.message);
    }

    return this.accessToken;
  }

  /**
   * Lấy token hợp lệ, tự động refresh nếu gần hết hạn (dưới 1 giờ)
   */
  public async getValidAccessToken(): Promise<string | null> {
    if (!this.accessToken && process.env.ZALO_OA_ACCESS_TOKEN) {
      this.accessToken = process.env.ZALO_OA_ACCESS_TOKEN;
    }
    if (!this.refreshToken && process.env.ZALO_OA_REFRESH_TOKEN) {
      this.refreshToken = process.env.ZALO_OA_REFRESH_TOKEN;
    }
    const nowSec = Math.floor(Date.now() / 1000);
    if (this.tokenExpiresAt && this.tokenExpiresAt - nowSec < 3600) {
      await this.refreshAccessToken();
    }
    return this.accessToken;
  }

  /**
   * Gửi tin nhắn chăm sóc khách hàng trực tiếp từ CAWACO OA tới người dùng Zalo
   * Endpoint: POST https://openapi.zalo.me/v3.0/oa/message/cs
   */
  public async sendTextMessage(zaloUserId: string, text: string): Promise<ZaloOASendResult> {
    const token = await this.getValidAccessToken();

    if (!token) {
      console.warn(`[ZaloOAClient] Chưa cấu hình ZALO_OA_ACCESS_TOKEN. Tin nhắn lưu nội bộ: "${text.slice(0, 40)}..."`);
      return {
        success: true,
        messageId: `simulated_msg_${Date.now()}`,
        errorMessage: 'Lưu nội bộ thành công (Chờ cấu hình OA Access Token để bắn tin mạng)',
      };
    }

    try {
      const response = await axios.post(
        'https://openapi.zalo.me/v3.0/oa/message/cs',
        {
          recipient: {
            user_id: zaloUserId,
          },
          message: {
            text,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            access_token: token,
          },
          timeout: 10000,
        }
      );

      const resData = response.data;
      if (resData.error === 0) {
        return {
          success: true,
          messageId: resData.data?.message_id,
          raw: resData,
        };
      }

      console.warn('[ZaloOAClient] Zalo OA trả về lỗi:', resData);
      return {
        success: false,
        errorCode: resData.error,
        errorMessage: resData.message || 'Lỗi gửi tin qua Zalo OA',
        raw: resData,
      };
    } catch (error: any) {
      console.error('[ZaloOAClient] Lỗi kết nối Zalo OA API:', error?.response?.data || error.message);
      return {
        success: false,
        errorMessage: error?.response?.data?.message || error.message,
        raw: error?.response?.data,
      };
    }
  }

  /**
   * Lấy số lượng người theo dõi (Follower) của CAWACO OA từ API
   */
  public async getFollowersCount(): Promise<number | null> {
    const token = await this.getValidAccessToken();
    if (!token) return null;

    try {
      const res = await axios.get('https://openapi.zalo.me/v2.0/oa/getfollowers', {
        headers: { access_token: token },
        params: { offset: 0, count: 5 },
        timeout: 8000,
      });

      if (res.data.error === 0 && typeof res.data.data?.total === 'number') {
        return res.data.data.total;
      }
    } catch {
      // Ignored
    }
    return null;
  }

  /**
   * Lấy danh sách các cuộc trò chuyện gần đây nhất từ Zalo OA (Tối đa 10 tin theo quy định Zalo)
   * GET https://openapi.zalo.me/v2.0/oa/listrecentchat
   */
  public async getRecentChats(offset = 0, count = 10): Promise<any[]> {
    const token = await this.getValidAccessToken();
    console.log('[ZaloOAClient] getRecentChats with token:', token ? `${token.slice(0, 10)}...` : 'NULL');
    if (!token) return [];

    try {
      const safeCount = Math.min(count, 10);
      const res = await axios.get('https://openapi.zalo.me/v2.0/oa/listrecentchat', {
        headers: { access_token: token },
        params: { data: JSON.stringify({ offset, count: safeCount }) },
        timeout: 10000,
      });

      console.log('[ZaloOAClient] listrecentchat response:', res.data);
      if (res.data.error === 0 && Array.isArray(res.data.data)) {
        return res.data.data;
      }
    } catch (err: any) {
      console.error('[ZaloOAClient] Lỗi getRecentChats:', err?.response?.data || err.message);
    }
    return [];
  }

  /**
   * Lấy lịch sử tin nhắn của một hội thoại cụ thể với người dùng (Tối đa 10 tin theo quy định Zalo)
   * GET https://openapi.zalo.me/v2.0/oa/conversation
   */
  public async getConversationMessages(userId: string, offset = 0, count = 10): Promise<any[]> {
    const token = await this.getValidAccessToken();
    if (!token) return [];

    try {
      const safeCount = Math.min(count, 10);
      const res = await axios.get('https://openapi.zalo.me/v2.0/oa/conversation', {
        headers: { access_token: token },
        params: { data: JSON.stringify({ user_id: userId, offset, count: safeCount }) },
        timeout: 10000,
      });

      if (res.data.error === 0 && Array.isArray(res.data.data)) {
        return res.data.data;
      }
    } catch (err: any) {
      console.error('[ZaloOAClient] Lỗi getConversationMessages:', err?.response?.data || err.message);
    }
    return [];
  }

  /**
   * Lấy thông tin hồ sơ người dùng từ Zalo User ID
   * GET https://openapi.zalo.me/v2.0/oa/getprofile
   */
  public async getUserProfile(userId: string): Promise<any | null> {
    const token = await this.getValidAccessToken();
    if (!token) return null;

    try {
      const res = await axios.get('https://openapi.zalo.me/v2.0/oa/getprofile', {
        headers: { access_token: token },
        params: { data: JSON.stringify({ user_id: userId }) },
        timeout: 10000,
      });

      if (res.data.error === 0 && res.data.data) {
        return res.data.data;
      }
    } catch (err: any) {
      console.error('[ZaloOAClient] Lỗi getUserProfile:', err?.response?.data || err.message);
    }
    return null;
  }
}

export const zaloOAClient = new ZaloOAClient();
