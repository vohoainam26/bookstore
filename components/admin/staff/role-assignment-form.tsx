'use client';

import { useState } from 'react';
import { assignRole, removeRole } from '@/app/admin/(dashboard)/staff/actions';

export default function RoleAssignmentForm({ userId, currentRoles, allRoles }: { userId: string, currentRoles: any[], allRoles: any[] }) {
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  const activeRoleCodes = currentRoles.filter(r => r.is_active).map(r => r.role.code);

  const handleAssign = async () => {
    if (!selectedRole) return;
    setLoading(true);
    try {
      await assignRole(userId, selectedRole);
      setSelectedRole('');
    } catch (e: any) {
      alert('Lỗi: ' + e.message);
    }
    setLoading(false);
  };

  const handleRemove = async (roleCode: string) => {
    if (!confirm(`Bạn có chắc chắn muốn gỡ vai trò ${roleCode}?`)) return;
    setLoading(true);
    try {
      await removeRole(userId, roleCode);
    } catch (e: any) {
      alert('Lỗi: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {currentRoles && currentRoles.length > 0 ? (
          currentRoles.map((ur: any) => (
            <div key={ur.role.code} className={`flex items-center gap-2 px-3 py-2 rounded-md border ${ur.role.code.toUpperCase() === 'SUPER_ADMIN' ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-200'}`}>
              <div className="flex flex-col">
                <span className={`text-sm font-semibold ${ur.role.code.toUpperCase() === 'SUPER_ADMIN' ? 'text-purple-800' : 'text-gray-900'}`}>{ur.role.name}</span>
                <span className="text-xs text-gray-500">Cấp bởi: {ur.assigned_by_user?.full_name || 'Hệ thống'}</span>
              </div>
              <button
                onClick={() => handleRemove(ur.role.code)}
                disabled={loading}
                className="ml-2 text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
                title="Gỡ vai trò này"
              >
                &times;
              </button>
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500 italic">Chưa có vai trò nào được cấp.</div>
        )}
      </div>

      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Cấp vai trò mới</label>
        <div className="flex gap-2">
          <select
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">-- Chọn vai trò --</option>
            {allRoles.filter((r: any) => !activeRoleCodes.includes(r.code)).map((r: any) => (
              <option key={r.code} value={r.code}>{r.name} ({r.code})</option>
            ))}
          </select>
          <button
            onClick={handleAssign}
            disabled={loading || !selectedRole}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Đang cấp...' : 'Cấp Quyền'}
          </button>
        </div>
      </div>
    </div>
  );
}
