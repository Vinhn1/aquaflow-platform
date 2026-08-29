import React, { useState, useEffect } from 'react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  affectedAreas?: string;
  outageStartTime?: string;
  outageEndTime?: string;
  publishedAt: string;
}

export const NewsManagement: React.FC = () => {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('OUTAGE_NOTICE');
  const [affectedAreas, setAffectedAreas] = useState('Tuyến đường Quang Trung, Khóm 26, Phường Tân Thành, TP. Cà Mau');
  const [startTime, setStartTime] = useState('2026-08-28T22:00');
  const [endTime, setEndTime] = useState('2026-08-29T04:00');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setMsg({ type: 'error', text: 'Vui lòng điền đầy đủ tiêu đề và nội dung thông báo.' });
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch('/api/v1/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          summary: summary || title,
          content,
          category,
          affectedAreas: category === 'OUTAGE_NOTICE' ? affectedAreas : undefined,
          outageStartTime: category === 'OUTAGE_NOTICE' && startTime ? new Date(startTime).toISOString() : undefined,
          outageEndTime: category === 'OUTAGE_NOTICE' && endTime ? new Date(endTime).toISOString() : undefined,
          isPublished: true,
        }),
      });

      if (!res.ok) {
        throw new Error(`Lỗi máy chủ [${res.status}]`);
      }

      setMsg({ type: 'success', text: 'Đăng thông báo cúp nước thành công! Người dân trên Zalo Mini App đã nhận được thông tin.' });
      setTitle('');
      setSummary('');
      setContent('');
      fetchNews();
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Không thể đăng thông báo. Vui lòng thử lại.' });
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

      {msg && (
        <div
          className={`p-4 rounded-xl text-sm border ${
            msg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {msg.text}
        </div>
      )}

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
              <label className="block text-xs font-bold text-slate-600 mb-1">Tiêu đề thông báo</label>
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
              <label className="block text-xs font-bold text-slate-600 mb-1">Nội dung chi tiết</label>
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
              newsList.map((item) => (
                <div key={item.id} className="p-4 hover:bg-slate-50 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          item.category === 'OUTAGE_NOTICE'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {item.category === 'OUTAGE_NOTICE' ? 'Lịch cúp nước' : 'Thông báo'}
                      </span>
                      <span className="text-xs text-slate-400 ml-2">
                        {new Date(item.publishedAt).toLocaleDateString('vi-VN')}
                      </span>
                      <div className="text-sm font-bold text-slate-800 mt-1">{item.title}</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 mt-1 line-clamp-2">{item.summary}</div>

                  {item.affectedAreas && (
                    <div className="text-xs text-amber-700 font-medium mt-2 bg-amber-50 p-2 rounded">
                      Khu vực ảnh hưởng: {item.affectedAreas}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
