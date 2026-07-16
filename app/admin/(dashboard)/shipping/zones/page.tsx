import { getShippingZones } from '../actions';
import Link from 'next/link';

export default async function AdminShippingZonesPage() {
  const zones = await getShippingZones();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý Khu vực vận chuyển</h1>
        <div className="flex gap-2">
          <Link href="/admin/shipping/methods" className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
            Phương thức & Giá
          </Link>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
            + Thêm Khu vực
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {zones && zones.length > 0 ? (
          zones.map((zone: any) => (
            <div key={zone.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                  <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                  <div className="text-xs text-gray-500 font-mono mt-1">{zone.code}</div>
                </div>
                <div className={`px-2 py-1 rounded-md text-xs font-semibold ${zone.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {zone.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="text-sm text-gray-600">
                  {zone.description || 'Chưa có mô tả'}
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase mb-2">Độ ưu tiên: {zone.priority}</div>
                  <div className="text-xs font-medium text-gray-500 uppercase mb-2">Địa điểm áp dụng:</div>
                  <div className="flex flex-wrap gap-1">
                    {zone.locations && zone.locations.length > 0 ? (
                      zone.locations.map((loc: any, i: number) => (
                        <span key={i} className="inline-flex bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-sm border border-indigo-100">
                          {loc.province} {loc.district ? `- ${loc.district}` : '(Toàn tỉnh)'}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500 italic">Mặc định (Chưa cấu hình địa điểm)</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-3 border-t border-gray-100 bg-gray-50 text-right">
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Sửa địa điểm</button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center text-gray-500">
            Chưa có khu vực vận chuyển nào.
          </div>
        )}
      </div>
    </div>
  );
}
