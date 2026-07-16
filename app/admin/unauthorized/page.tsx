import Link from "next/link";
import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";

export default async function UnauthorizedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center text-center">
        <WarningCircle size={64} weight="fill" className="text-red-500 mb-4" />
        <h2 className="text-3xl font-extrabold text-gray-900 font-display mb-2">
          Truy cập bị từ chối
        </h2>
        <p className="text-gray-600 mb-8">
          Tài khoản {user?.email} của bạn không có quyền truy cập vào khu vực quản trị.
        </p>
        <Link
          href="/"
          className="inline-flex justify-center items-center py-2.5 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
}
