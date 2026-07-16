import { getShippingMethods } from '../actions';
import Link from 'next/link';

export default async function AdminShippingMethodsPage() {
  const methods = await getShippingMethods();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Phương thức & Phí vận chuyển</h1>
        <div className="flex gap-2">
          <Link href="/admin/shipping/zones" className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
            Khu vực vận chuyển
          </Link>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
            + Thêm Phương thức
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {methods && methods.length > 0 ? (
          methods.map((method: any) => (
            <div key={method.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{method.name}</h3>
                    <div className="text-xs text-gray-500 font-mono mt-1">{method.code}</div>
                  </div>
                  <div className="hidden sm:flex gap-2">
                    {method.supports_cod && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-sm font-medium">Hỗ trợ COD</span>}
                    <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-sm font-medium">Giao {method.min_delivery_days}-{method.max_delivery_days} ngày</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`px-2 py-1 rounded-md text-xs font-semibold ${method.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {method.is_active ? 'Active' : 'Inactive'}
                  </div>
                  <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-white border border-gray-300 px-3 py-1 rounded">Sửa</button>
                </div>
              </div>

              <div className="p-0">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-white">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phí cơ bản</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Miễn phí ship từ</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {method.rates && method.rates.length > 0 ? (
                      method.rates.map((rate: any) => (
                        <tr key={rate.id} className="hover:bg-gray-50">
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">Zone {rate.zone_id}</td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm font-bold text-indigo-600">{Number(rate.base_fee).toLocaleString('vi-VN')} ₫</td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                            {rate.free_shipping_threshold ? `${Number(rate.free_shipping_threshold).toLocaleString('vi-VN')} ₫` : 'Không'}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-indigo-600 hover:text-indigo-900">Sửa Rate</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 italic">Chưa cấu hình phí cho phương thức này.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center text-gray-500">
            Chưa có phương thức vận chuyển nào.
          </div>
        )}
      </div>
    </div>
  );
}
