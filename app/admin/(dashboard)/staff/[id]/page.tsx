import { getStaffDetail } from '../actions';
import Link from 'next/link';
import RoleAssignmentForm from '@/components/admin/staff/role-assignment-form';

export default async function AdminStaffDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const { staff, userRoles, allRoles } = await getStaffDetail(id);

  // Derive permissions
  const uniquePermissions = new Map();
  let isSuperAdmin = false;

  userRoles.forEach((ur: any) => {
    if (ur.is_active && ur.role?.is_active) {
      if (ur.role.code.toUpperCase() === 'SUPER_ADMIN') {
        isSuperAdmin = true;
      }
      ur.role.permissions?.forEach((rp: any) => {
        if (!uniquePermissions.has(rp.permission.code)) {
          uniquePermissions.set(rp.permission.code, rp.permission);
        }
      });
    }
  });

  const permissionsList = Array.from(uniquePermissions.values());

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/staff" className="text-sm font-medium text-gray-500 hover:text-gray-900">
          &larr; Quay lại danh sách
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Nhân viên: {staff.full_name || 'Admin'}</h1>
        {isSuperAdmin && (
          <span className="px-3 py-1 inline-flex text-sm leading-5 font-bold rounded-full bg-purple-100 text-purple-800">
            SUPER ADMIN
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vai trò hiện tại</h2>
            <RoleAssignmentForm userId={staff.id} currentRoles={userRoles} allRoles={allRoles} />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Danh sách Quyền (Permissions)</h2>
            {isSuperAdmin ? (
              <div className="p-4 bg-purple-50 rounded-lg text-purple-800 border border-purple-100">
                Nhân viên này là Super Admin và có <strong>toàn quyền truy cập</strong> mọi module trong hệ thống.
              </div>
            ) : permissionsList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {permissionsList.map((p: any) => (
                  <div key={p.code} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div className="text-sm font-semibold text-gray-800">{p.name}</div>
                    <div className="text-xs text-gray-500 font-mono mt-1">{p.code}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">Nhân viên này chưa được cấp bất kỳ quyền nào.</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
            <div className="space-y-4 text-sm">
              <div>
                <span className="block text-gray-500 mb-1">ID</span>
                <span className="font-mono text-gray-900 break-all">{staff.id}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Trạng thái tài khoản</span>
                <span className={staff.is_active ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                  {staff.is_active ? 'Đang hoạt động' : 'Bị khóa'}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Tham gia từ</span>
                <span className="text-gray-900">{new Date(staff.created_at).toLocaleString('vi-VN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
