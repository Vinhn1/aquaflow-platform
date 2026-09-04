import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  affectedAreas?: string;
  affectedArea?: string;
  thumbnailUrl?: string;
  outageStartTime?: string;
  outageEndTime?: string;
  publishedAt: string;
}

const PRESET_IMAGES = [
  { label: 'Sự cố / Thi công', url: '/images/news/news-pipeline-work.jpg' },
  { label: 'Biểu giá nước', url: '/images/news/news-tariff.png' },
  { label: 'Thông báo / Cảnh giác', url: '/images/news/news-fraud-alert.jpg' },
  { label: 'Tiện ích / Ứng dụng', url: '/images/news/news-digital-app.png' },
];

export const NewsManagement: React.FC = () => {
  const { token } = useAuth();
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('OUTAGE_NOTICE');
  const [affectedAreas, setAffectedAreas] = useState('Tuyến đường Quang Trung, Khóm 26, Phường Tân Thành, TP. Cà Mau');
  const [startTime, setStartTime] = useState('2026-08-28T22:00');
  const [endTime, setEndTime] = useState('2026-08-29T04:00');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const fetchNews = async () => {
    try {
      const res = await fetch('/api/v1/news');
      if (res.ok) {
        const json = await res.json();
        setNewsList(json.data || []);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách tin tức:', err);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast.warning('Kích thước ảnh tối đa là 3MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setThumbnailUrl(reader.result);
          toast.success('Đã tải ảnh đại diện lên');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.warning('Vui lòng điền đầy đủ tiêu đề và nội dung thông báo.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/v1/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('aquaflow_admin_token')}`,
        },
        body: JSON.stringify({
          title,
          summary: summary || title,
          content,
          category,
          thumbnailUrl: thumbnailUrl || undefined,
          affectedAreas: category === 'OUTAGE_NOTICE' ? affectedAreas : undefined,
          outageStartTime: category === 'OUTAGE_NOTICE' && startTime ? new Date(startTime).toISOString() : undefined,
          outageEndTime: category === 'OUTAGE_NOTICE' && endTime ? new Date(endTime).toISOString() : undefined,
          isPublished: true,
        }),
      });

      if (!res.ok) {
        let errMsg = `Lỗi máy chủ [${res.status}]`;
        try {
          const errJson = await res.json();
          errMsg = errJson.error?.message || errJson.message || errMsg;
        } catch {
          // Fallback to status text
        }
        throw new Error(errMsg);
      }

      toast.success('Đăng thông báo thành công');
      setTitle('');
      setSummary('');
      setContent('');
      setThumbnailUrl(null);
      fetchNews();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể đăng thông báo. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Quản Lý Thông Báo & Lịch Cúp Nước Định Kỳ
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Đăng tải cảnh báo gián đoạn cấp nước theo từng khóm/phường và chính sách biểu giá
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form dang tin moi */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-fit">
          <h3 className="font-bold text-slate-800 text-sm pb-3 border-b border-slate-100 mb-4">
            Soạn Thảo Thông Báo Mới
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Loại thông báo</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="OUTAGE_NOTICE">Lịch tạm ngưng cấp nước</option>
                <option value="POLICY_UPDATE">Biểu giá nước & Quyết định</option>
                <option value="COMMUNITY">Tin tức hoạt động công ty</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Tiêu đề thông báo *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Thông báo tạm ngưng cấp nước đường Quang Trung..."
                className="w-full text-sm p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Tóm tắt ngắn</label>
              <input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Tóm tắt hiển thị trên thông báo đẩy..."
                className="w-full text-sm p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Chuc nang chon / tai anh dai dien (optional) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-600">
                  Hình ảnh đại diện bài viết <span className="text-slate-400 font-normal">(Không bắt buộc)</span>
                </label>
                {thumbnailUrl && (
                  <button
                    type="button"
                    onClick={() => setThumbnailUrl(null)}
                    className="text-xs text-rose-600 hover:underline font-semibold"
                  >
                    Xóa ảnh
                  </button>
                )}
              </div>

              {thumbnailUrl ? (
                <div className="relative rounded-lg border border-slate-200 overflow-hidden bg-slate-50 p-2">
                  <div className="aspect-video w-full max-h-36 rounded overflow-hidden bg-slate-100 flex items-center justify-center">
                    <img
                      src={thumbnailUrl}
                      alt="Ảnh đại diện xem trước"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 text-center">Đã chọn ảnh đại diện cho bài viết</div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-3 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition">
                    <svg className="w-6 h-6 text-slate-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-slate-600 font-medium">Bấm để tải ảnh từ máy tính</span>
                    <span className="text-[10px] text-slate-400">PNG, JPG, WEBP tối đa 3MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>

                  {/* Preset quick picks */}
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 mb-1.5">Hoặc chọn ảnh mẫu có sẵn:</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {PRESET_IMAGES.map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => setThumbnailUrl(preset.url)}
                          className="text-[11px] px-2 py-1.5 text-left bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded border border-slate-200 transition truncate"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {category === 'OUTAGE_NOTICE' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Khu vực ảnh hưởng</label>
                  <input
                    type="text"
                    value={affectedAreas}
                    onChange={(e) => setAffectedAreas(e.target.value)}
                    placeholder="Khóm, phường, tuyến đường..."
                    className="w-full text-sm p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Bắt đầu cúp</label>
                    <input
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Cấp nước lại</label>
                    <input
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Nội dung chi tiết *</label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nội dung thông báo gửi đến người dân..."
                className="w-full text-sm p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition"
            >
              {loading ? 'Đang xuất bản...' : 'Đăng Thông Báo Lên Mini App'}
            </button>
          </form>
        </div>

        {/* Danh sach thong bao da dang */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm">Các Thông Báo Đang Hoạt Động Trên Hệ Thống</h3>
            <button
              onClick={fetchNews}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Làm mới
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {newsList.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Chưa có thông báo nào được đăng.
              </div>
            ) : (
              newsList.map((item) => {
                return (
                  <div key={item.id} className="p-4 hover:bg-slate-50 transition flex gap-3.5 items-start">
                    {/* Thumbnail box (Chi hien thi khi co hinh anh) */}
                    {item.thumbnailUrl && (
                      <div className="w-20 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const parent = e.currentTarget.parentElement;
                            if (parent) parent.style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              item.category === 'OUTAGE_NOTICE' || item.category === 'MAINTENANCE_OUTAGE'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {item.category === 'OUTAGE_NOTICE' || item.category === 'MAINTENANCE_OUTAGE' ? 'Lịch cúp nước' : 'Thông báo'}
                          </span>
                          <span className="text-xs text-slate-400 ml-2">
                            {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('vi-VN') : ''}
                          </span>
                          <div className="text-sm font-bold text-slate-800 mt-1">{item.title}</div>
                        </div>
                      </div>

                      <div className="text-xs text-slate-500 mt-1 line-clamp-2">{item.summary}</div>

                      {(item.affectedAreas || item.affectedArea) && (
                        <div className="text-xs text-amber-700 font-medium mt-2 bg-amber-50 p-2 rounded">
                          Khu vực ảnh hưởng: {item.affectedAreas || item.affectedArea}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

