import Link from 'next/link';

export default async function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Xuất dữ liệu & Báo cáo</h1>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Tải xuống dữ liệu CSV</h2>
        <p className="text-sm text-gray-500 mb-6">
          Xuất dữ liệu hệ thống ra định dạng CSV để xử lý trên Excel. Hệ thống tự động chặn lỗi CSV Injection.
        </p>

        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between hover:border-indigo-300 transition-colors">
            <div>
              <div className="font-semibold text-gray-900">Danh sách Đơn hàng</div>
              <div className="text-xs text-gray-500 mt-1">Xuất danh sách 1000 đơn hàng gần nhất.</div>
            </div>
            <a 
              href="/api/admin/exports?type=orders&format=csv&limit=1000" 
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              Tải CSV
            </a>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between hover:border-indigo-300 transition-colors">
            <div>
              <div className="font-semibold text-gray-900">Danh sách Khách hàng</div>
              <div className="text-xs text-gray-500 mt-1">Xuất danh sách 1000 khách hàng mới nhất.</div>
            </div>
            <a 
              href="/api/admin/exports?type=customers&format=csv&limit=1000" 
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              Tải CSV
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
