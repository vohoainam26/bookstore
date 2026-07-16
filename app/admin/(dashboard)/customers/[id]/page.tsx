import { getCustomer } from '../actions';
import Link from 'next/link';
import CustomerStatusForm from '@/components/admin/customers/customer-status-form';
import CustomerNoteForm from '@/components/admin/customers/customer-note-form';

export default async function AdminCustomerDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const customer = await getCustomer(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/customers" className="text-sm font-medium text-gray-500 hover:text-gray-900">
          &larr; Quay lại danh sách
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Hồ sơ: {customer.full_name || 'Khách hàng'}</h1>
        {customer.is_active ? (
          <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            Tài khoản Active
          </span>
        ) : (
          <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            Đã bị khóa
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-gray-500 mb-1">ID</span>
                <span className="font-mono text-gray-900">{customer.id}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Ngày tham gia</span>
                <span className="text-gray-900">{new Date(customer.created_at).toLocaleString('vi-VN')}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Họ và Tên</span>
                <span className="text-gray-900">{customer.full_name || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Số điện thoại</span>
                <span className="text-gray-900">{customer.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="text-sm text-gray-500 mb-1">Tổng chi tiêu</div>
              <div className="text-2xl font-bold text-indigo-600">{customer.stats.total_spent.toLocaleString('vi-VN')} ₫</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="text-sm text-gray-500 mb-1">Số đơn hàng</div>
              <div className="text-2xl font-bold text-gray-900">{customer.stats.total_orders}</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="text-sm text-gray-500 mb-1">Đơn thành công</div>
              <div className="text-2xl font-bold text-green-600">{customer.stats.delivered_orders}</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử đơn hàng</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thanh toán</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customer.orders && customer.orders.length > 0 ? (
                    customer.orders.map((order: any) => (
                      <tr key={order.id} className="text-sm">
                        <td className="px-4 py-3 font-medium text-indigo-600">
                          <Link href={`/admin/orders/${order.id}`}>{order.order_code}</Link>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                        <td className="px-4 py-3">{order.total_amount.toLocaleString('vi-VN')} ₫</td>
                        <td className="px-4 py-3">{order.payment_status}</td>
                        <td className="px-4 py-3">{order.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-4 text-center text-gray-500">Chưa có đơn hàng nào</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-red-500">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quản lý Tài khoản</h2>
            <CustomerStatusForm customer={customer} />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ghi chú nội bộ</h2>
            <CustomerNoteForm customerId={customer.id} />
            
            <div className="mt-6 space-y-4 max-h-96 overflow-y-auto">
              {customer.notes && customer.notes.length > 0 ? (
                customer.notes.map((note: any) => (
                  <div key={note.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1 flex justify-between">
                      <span className="font-semibold text-gray-700">{note.admin?.full_name || 'Admin'}</span>
                      <span>{new Date(note.created_at).toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="text-sm text-gray-900 whitespace-pre-wrap">{note.note}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 text-center italic">Chưa có ghi chú nào</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
