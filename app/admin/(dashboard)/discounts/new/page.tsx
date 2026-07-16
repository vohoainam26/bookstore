import Link from 'next/link';
import DiscountForm from '@/components/admin/discounts/discount-form';

export default function AdminNewDiscountPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/discounts" className="text-sm font-medium text-gray-500 hover:text-gray-900">
          &larr; Quay lại danh sách
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Tạo mã giảm giá mới</h1>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-3xl">
        <DiscountForm />
      </div>
    </div>
  );
}
