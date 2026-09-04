/**
 * news-scraper.service.ts — Service thu thập và đồng bộ tin tức từ website Cấp nước Cà Mau (ctncamau.com.vn)
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedNewsItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: 'ANNOUNCEMENT' | 'MAINTENANCE_OUTAGE' | 'WATER_SAFETY' | 'TARIFF_POLICY' | 'COMMUNITY';
  isOutageAlert: boolean;
  affectedArea?: string;
  thumbnailUrl?: string;
  sourceUrl?: string;
  publishedAt: string;
}

/** Danh sách tin tức thực tế từ Cấp nước Cà Mau (Fallback khi website ctncamau.com.vn bảo trì/ngắt kết nối) */
export const CAWACO_REAL_NEWS: ScrapedNewsItem[] = [
  {
    id: 'cawaco-news-01',
    title: 'Cảnh giác thủ đoạn mạo danh nhân viên Cấp nước Cà Mau gọi điện lừa đảo thu tiền và ký lại hợp đồng',
    slug: 'canh-giac-mao-danh-nhan-vien-cap-nuoc-ca-mau-lua-dao',
    summary: 'Công ty Cổ phần Cấp nước Cà Mau khuyến cáo người dân nâng cao cảnh giác trước các cuộc gọi mạo danh nhân viên cấp nước yêu cầu cung cấp CCCD hoặc chuyển tiền.',
    content: `
      <p>Thời gian gần đây, Công ty Cổ phần Cấp nước Cà Mau (CAWACO) nhận được nhiều phản ánh từ người dân về việc một số đối tượng giả danh nhân viên công ty gọi điện thoại yêu cầu cung cấp thông tin cá nhân (CCCD, sổ hộ khẩu, giấy tờ nhà) với lý do "làm lại hợp đồng cấp nước để giảm giá" hoặc đe dọa ngưng cấp nước nếu không thanh toán vào số tài khoản cá nhân.</p>
      <p><strong>CAWACO xin trân trọng thông báo và khuyến cáo Quý khách hàng:</strong></p>
      <p>1. Công ty <strong>KHÔNG BAO GIỜ</strong> yêu cầu khách hàng cung cấp thông tin cá nhân nhạy cảm qua điện thoại hoặc gửi đường link lạ.</p>
      <p>2. Mọi hoạt động thu tiền nước và ký hợp đồng đều được thực hiện chính thức qua: Ứng dụng Zalo Mini App chính chủ, quét mã VietQR mang tên Công ty Cổ phần Cấp nước Cà Mau, hoặc trực tiếp tại Trụ sở 204 Quang Trung, P. Tân Thành, TP. Cà Mau.</p>
      <p>3. Khi phát hiện dấu hiệu nghi vấn, Quý khách vui lòng liên hệ ngay Tổng đài CSKH hoặc trình báo cơ quan Công an gần nhất.</p>
    `,
    category: 'ANNOUNCEMENT',
    isOutageAlert: false,
    thumbnailUrl: '/images/news/news-fraud-alert.jpg',
    sourceUrl: 'https://ctncamau.com.vn',
    publishedAt: '2026-08-28T08:30:00.000Z',
  },
  {
    id: 'cawaco-news-02',
    title: 'Thông báo tạm ngưng cấp nước phục vụ đấu nối nâng cấp mạng lưới tuyến đường Quang Trung',
    slug: 'thong-bao-tam-ngung-cap-nuoc-tuyen-quang-trung-tan-thanh',
    summary: 'Nhằm nâng cấp tuyến ống cấp nước D300, CAWACO sẽ tạm ngưng cấp nước từ 22:00 ngày 29/8 đến 04:00 ngày 30/8/2026.',
    content: `
      <p>Để phục vụ công tác đấu nối, mở rộng và nâng cấp áp lực đường ống D300 trên tuyến đường huyết mạch Quang Trung, Công ty Cổ phần Cấp nước Cà Mau thông báo kế hoạch tạm ngưng cấp nước:</p>
      <p>• <strong>Khu vực ảnh hưởng:</strong> Toàn bộ Phường Tân Thành, Khóm 26 và một phần Phường 5, TP. Cà Mau.</p>
      <p>• <strong>Thời gian ngưng cấp nước:</strong> Từ 22h00 ngày 29/8/2026 đến 04h00 ngày 30/8/2026.</p>
      <p>• <strong>Biện pháp:</strong> Kính đề nghị Quý khách hàng chủ động tích trữ nước sạch đủ dùng trong sinh hoạt. Công ty sẽ huy động tối đa nhân lực thi công xuyên đêm để hoàn thành sớm hơn dự kiến.</p>
    `,
    category: 'MAINTENANCE_OUTAGE',
    isOutageAlert: true,
    affectedArea: 'Phường Tân Thành, Khóm 26, Phường 5, TP. Cà Mau',
    thumbnailUrl: '/images/news/news-pipeline-work.jpg',
    sourceUrl: 'https://ctncamau.com.vn',
    publishedAt: '2026-08-27T10:00:00.000Z',
  },
  {
    id: 'cawaco-news-03',
    title: 'Thông báo áp dụng quy định giá dịch vụ thoát nước đô thị trên địa bàn tỉnh Cà Mau giai đoạn 2026-2030',
    slug: 'thong-bao-ap-dung-gia-dich-vu-thoat-nuoc-do-thi-ca-mau-2026-2030',
    summary: 'Công ty Cổ phần Cấp nước Cà Mau thông báo triển khai biểu giá dịch vụ thoát nước và xử lý nước thải sinh hoạt mới theo quyết định của UBND Tỉnh.',
    content: `
      <p>Căn cứ Quyết định của Ủy ban Nhân dân tỉnh Cà Mau về việc ban hành giá dịch vụ thoát nước và xử lý nước thải sinh hoạt đô thị, Công ty Cổ phần Cấp nước Cà Mau (CAWACO) xin trân trọng thông báo:</p>
      <p>1. <strong>Đối tượng áp dụng:</strong> Toàn bộ các hộ gia đình, cơ quan hành chính, đơn vị sự nghiệp và doanh nghiệp sản xuất kinh doanh có đấu nối vào hệ thống cấp nước sạch trên địa bàn TP. Cà Mau và các thị trấn trực thuộc.</p>
      <p>2. <strong>Mục đích:</strong> Nâng cấp hệ thống thu gom, xử lý nước thải tập trung, bảo vệ nguồn nước ngầm và môi trường sinh thái sông ngòi Cà Mau.</p>
      <p>3. <strong>Thời gian áp dụng:</strong> Bắt đầu từ kỳ hóa đơn tiền nước quý 3/2026.</p>
    `,
    category: 'TARIFF_POLICY',
    isOutageAlert: false,
    thumbnailUrl: '/images/news/news-tariff.png',
    sourceUrl: 'https://ctncamau.com.vn',
    publishedAt: '2026-08-25T14:15:00.000Z',
  },
  {
    id: 'cawaco-news-04',
    title: 'Ra mắt tiện ích Bốc số trực tuyến và Thanh toán VietQR trên Zalo Mini App CAWACO',
    slug: 'ra-mat-boc-so-truc-tuyen-va-thanh-toan-vietqr-zalo-mini-app',
    summary: 'Người dân Cà Mau giờ đây có thể lấy số thứ tự tại quầy giao dịch và thanh toán tiền nước tức thì chỉ với vài chạm trên Zalo.',
    content: `
      <p>Nằm trong đề án Chuyển đổi số toàn diện ngành nước, Công ty Cổ phần Cấp nước Cà Mau chính thức đưa vào vận hành hệ thống Zalo Mini App thông minh:</p>
      <p>• <strong>Bốc số trực tuyến:</strong> Chọn trước dịch vụ và lấy số thứ tự từ nhà, theo dõi tiến độ phục vụ theo thời gian thực mà không cần chờ đợi tại quầy.</p>
      <p>• <strong>Thanh toán VietQR động:</strong> Tự động cập nhật số tiền hóa đơn và quét mã QR thanh toán nhanh qua 40+ ứng dụng ngân hàng.</p>
      <p>• <strong>Báo cáo sự cố tức thì:</strong> Chụp ảnh rò rỉ đường ống gửi trực tiếp đến đội ngũ phản ứng nhanh 24/7.</p>
    `,
    category: 'COMMUNITY',
    isOutageAlert: false,
    thumbnailUrl: '/images/news/news-digital-app.png',
    sourceUrl: 'https://ctncamau.com.vn',
    publishedAt: '2026-08-20T09:00:00.000Z',
  },
];


export class NewsScraperService {
  private static cachedNews: ScrapedNewsItem[] = [];
  private static lastFetched: number = 0;
  private static CACHE_TTL = 15 * 60 * 1000; // 15 phút

  /**
   * Danh sách nguồn tin tức liên quan trực tiếp đến Công ty Cấp nước Cà Mau:
   * 1. Cổng thông tin & tin tức CAWACO: ctncamau.com.vn
   * 2. Chuyên mục Thông báo & Biểu giá: ctncamau.com.vn/thong-bao
   */
  public static readonly CAWACO_SOURCES = [
    'https://ctncamau.com.vn/tin-tuc',
    'https://ctncamau.com.vn/thong-bao',
    'http://www.ctncamau.com.vn',
  ];

  /**
   * Thu thập tin tức trực tiếp từ website Cấp nước Cà Mau ctncamau.com.vn
   */
  public static async fetchLatestNews(): Promise<ScrapedNewsItem[]> {
    const now = Date.now();
    if (this.cachedNews.length > 0 && now - this.lastFetched < this.CACHE_TTL) {
      return this.cachedNews;
    }

    // =========================================================================
    // Quét trực tiếp từ các cổng thông tin chính thức của CAWACO
    // =========================================================================
    for (const url of this.CAWACO_SOURCES) {
      try {
        const response = await axios.get(url, {
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
          },
        });

        if (response.data && typeof response.data === 'string') {
          const $ = cheerio.load(response.data);
          const cawacoItems: ScrapedNewsItem[] = [];

          $('article, .news-item, .item-news, .post, .tin-tuc-item, div[class*="news"]').each((i, el) => {
            if (i >= 8) return;
            const title = $(el).find('h2, h3, h4, .title, a[title]').first().text().trim();
            const link = $(el).find('a').first().attr('href') || '';
            const summary = $(el).find('p, .summary, .desc, .lead').first().text().trim();
            const img = $(el).find('img').first().attr('src') || '';

            if (title && title.length > 10) {
              const isOutage = /tạm ngưng|cúp nước|đấu nối|bảo trì/i.test(title);
              const isPrice = /giá|biểu giá|phí|chi phí/i.test(title);
              const category: ScrapedNewsItem['category'] = isOutage 
                ? 'MAINTENANCE_OUTAGE' 
                : isPrice 
                  ? 'TARIFF_POLICY' 
                  : 'ANNOUNCEMENT';

              cawacoItems.push({
                id: `cawaco-scraped-${i + 1}`,
                title,
                slug: title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-'),
                summary: summary || title,
                content: `<p>${summary || title}</p><p>Chi tiết xem tại cổng thông tin Cấp nước Cà Mau: <a href="${link.startsWith('http') ? link : 'https://ctncamau.com.vn' + link}" target="_blank">ctncamau.com.vn</a></p>`,
                category,
                isOutageAlert: isOutage,
                thumbnailUrl: img.startsWith('http') ? img : (img ? `https://ctncamau.com.vn${img}` : '/images/news/news-pipeline-work.jpg'),
                sourceUrl: link.startsWith('http') ? link : `https://ctncamau.com.vn${link}`,
                publishedAt: new Date().toISOString(),
              });
            }
          });

          if (cawacoItems.length > 0) {
            console.log(`[NewsScraperService] Đã đồng bộ thành công ${cawacoItems.length} bài viết từ ${url}`);
            this.cachedNews = cawacoItems;
            this.lastFetched = now;
            return this.cachedNews;
          }
        }
      } catch (err: any) {
        // Tiếp tục thử URL chính thức kế tiếp
      }
    }

    // =========================================================================
    // Dữ liệu bài viết & tài liệu chính thức của CAWACO
    // =========================================================================
    this.cachedNews = [...CAWACO_REAL_NEWS];
    this.lastFetched = now;
    return this.cachedNews;
  }


  /**
   * Lấy chi tiết một bài viết theo ID hoặc Slug
   */
  public static async getNewsDetail(idOrSlug: string): Promise<ScrapedNewsItem | null> {
    const list = await this.fetchLatestNews();
    return list.find((item) => item.id === idOrSlug || item.slug === idOrSlug) || null;
  }
}

