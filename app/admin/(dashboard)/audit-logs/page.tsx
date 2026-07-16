import { getAuditLogs } from './actions';
import Link from 'next/link';

export default async function AdminAuditLogsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const action = typeof searchParams.action === 'string' ? searchParams.action : undefined;
  const entityType = typeof searchParams.entity_type === 'string' ? searchParams.entity_type : undefined;
  const limit = 50;

  const { logs, count } = await getAuditLogs({ page, limit, action, entity_type: entityType });
  const totalPages = count ? Math.ceil(count / limit) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Nhật ký hoạt động (Audit Logs)</h1>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <form className="flex flex-wrap gap-4 items-center" method="GET">
          <input 
            type="text" 
            name="action" 
            defaultValue={action} 
            placeholder="Tìm theo Action (vd: order.updated)" 
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-64"
          />
          <input 
            type="text" 
            name="entity_type" 
            defaultValue={entityType} 
            placeholder="Entity Type (vd: order, product)" 
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-48"
          />
          <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800">
            Lọc
          </button>
          {(action || entityType) && (
            <Link href="/admin/audit-logs" className="text-sm text-red-600 hover:text-red-800">Xóa bộ lọc</Link>
          )}
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Thời gian</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chi tiết thay đổi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs && logs.length > 0 ? (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50 text-sm">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(log.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{log.admin?.full_name || 'Hệ thống'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 font-mono text-xs rounded border border-gray-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{log.entity_type}</div>
                      <div className="text-xs text-gray-500 font-mono">{log.entity_id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md max-h-32 overflow-y-auto bg-gray-50 p-2 rounded text-xs font-mono text-gray-600 border border-gray-100">
                        {log.new_data ? JSON.stringify(log.new_data) : log.metadata ? JSON.stringify(log.metadata) : '-'}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    Không tìm thấy nhật ký nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-sm">
            <div className="text-gray-500">Trang {page} / {totalPages}</div>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/admin/audit-logs?page=${page - 1}`} className="px-3 py-1 bg-white border rounded">Trang trước</Link>
              )}
              {page < totalPages && (
                <Link href={`/admin/audit-logs?page=${page + 1}`} className="px-3 py-1 bg-white border rounded">Trang sau</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
