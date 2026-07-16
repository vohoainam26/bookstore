import { getDashboardKPIs, getRevenueSeries, getTopProducts } from './actions';
import Link from 'next/link';

export default async function AdminAnalyticsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const range = typeof searchParams.range === 'string' ? searchParams.range : '30d';

  let startDate = new Date();
  let endDate = new Date();
  
  if (range === '7d') {
    startDate.setDate(endDate.getDate() - 7);
  } else if (range === '30d') {
    startDate.setDate(endDate.getDate() - 30);
  } else if (range === 'this_month') {
    startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  } else {
    // Default 30d
    startDate.setDate(endDate.getDate() - 30);
  }

  const kpis = await getDashboardKPIs(startDate, endDate);
  const series = await getRevenueSeries(startDate, endDate);
  const topProducts = await getTopProducts(startDate, endDate);

  // Find max revenue for chart scaling
  const maxRevenue = Math.max(...series.map((d: any) => d.revenue), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Thống kê & Báo cáo</h1>
        
        <div className="bg-white rounded-md border border-gray-300 p-1 flex text-sm">
          <Link href="?range=7d" className={`px-3 py-1 rounded-md ${range === '7d' ? 'bg-gray-100 font-semibold' : 'text-gray-500 hover:text-gray-900'}`}>7 Ngày</Link>
          <Link href="?range=30d" className={`px-3 py-1 rounded-md ${range === '30d' || (!['7d','this_month'].includes(range)) ? 'bg-gray-100 font-semibold' : 'text-gray-500 hover:text-gray-900'}`}>30 Ngày</Link>
          <Link href="?range=this_month" className={`px-3 py-1 rounded-md ${range === 'this_month' ? 'bg-gray-100 font-semibold' : 'text-gray-500 hover:text-gray-900'}`}>Tháng này</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500 mb-2">Doanh thu Paid</div>
          <div className="text-3xl font-bold text-gray-900">{(kpis.revenue || 0).toLocaleString('vi-VN')} ₫</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500 mb-2">Số đơn hợp lệ</div>
          <div className="text-3xl font-bold text-indigo-600">{kpis.orders || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500 mb-2">Đơn đã giao</div>
          <div className="text-3xl font-bold text-green-600">{kpis.delivered || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500 mb-2">Khách hàng</div>
          <div className="text-3xl font-bold text-purple-600">{kpis.customers || 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Biểu đồ doanh thu (Paid)</h2>
          
          <div className="h-64 flex items-end gap-2 mt-4 relative">
            {series.map((day: any, i: number) => {
              const heightPercent = Math.max((day.revenue / maxRevenue) * 100, 1);
              return (
                <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 w-max bg-gray-900 text-white text-xs rounded py-1 px-2 pointer-events-none">
                    <div className="font-semibold">{new Date(day.date).toLocaleDateString('vi-VN')}</div>
                    <div>DT: {day.revenue.toLocaleString('vi-VN')} ₫</div>
                    <div>Đơn: {day.orders}</div>
                  </div>
                  
                  {/* Bar */}
                  <div 
                    className="w-full bg-indigo-500 hover:bg-indigo-600 rounded-t-sm transition-all" 
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                  
                  {/* X Axis label (sparse) */}
                  {(i % Math.ceil(series.length / 7) === 0 || i === series.length - 1) && (
                    <div className="text-[10px] text-gray-400 mt-2 rotate-45 origin-top-left absolute top-full">
                      {new Date(day.date).getDate()}/{new Date(day.date).getMonth() + 1}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-8 text-xs text-center text-gray-400">Trục thời gian</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Sản Phẩm (Doanh thu)</h2>
          <div className="space-y-4">
            {topProducts && topProducts.length > 0 ? (
              topProducts.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="text-sm font-medium text-gray-900 truncate" title={p.name}>{p.name}</div>
                    <div className="text-xs text-gray-500">Đã bán: {p.quantity}</div>
                  </div>
                  <div className="text-sm font-bold text-indigo-600 whitespace-nowrap">
                    {p.revenue.toLocaleString('vi-VN')} ₫
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 italic text-center py-4">Chưa có dữ liệu sản phẩm bán ra</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
