import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdminPermission } from '@/lib/auth';

// Utility to sanitize CSV fields to prevent CSV Injection
function sanitizeCSVField(field: any): string {
  if (field === null || field === undefined) return '';
  let str = String(field);
  // If the field starts with a formula character, prepend a single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  // Escape double quotes by doubling them
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const format = searchParams.get('format') || 'csv';
    const limit = Math.min(parseInt(searchParams.get('limit') || '1000'), 10000); // Max 10k rows
    
    // Check auth
    const { user } = await requireAdminPermission('reports.export');

    const supabase = createAdminClient();
    let csvData = '';
    let filename = `export_${type}_${new Date().getTime()}.${format}`;

    if (type === 'orders') {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_code, user_id, status, payment_status, total_amount, shipping_name, shipping_phone, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const headers = ['Order Code', 'Status', 'Payment Status', 'Total Amount', 'Customer Name', 'Customer Phone', 'Created At'];
      csvData += headers.map(sanitizeCSVField).join(',') + '\n';

      data.forEach(row => {
        const rowData = [
          row.order_code,
          row.status,
          row.payment_status,
          row.total_amount,
          row.shipping_name,
          row.shipping_phone,
          new Date(row.created_at).toLocaleString('vi-VN')
        ];
        csvData += rowData.map(sanitizeCSVField).join(',') + '\n';
      });
    } else if (type === 'customers') {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, role, is_active, created_at')
        .eq('role', 'user')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const headers = ['ID', 'Full Name', 'Phone', 'Active', 'Created At'];
      csvData += headers.map(sanitizeCSVField).join(',') + '\n';

      data.forEach(row => {
        const rowData = [
          row.id,
          row.full_name,
          row.phone,
          row.is_active ? 'Yes' : 'No',
          new Date(row.created_at).toLocaleString('vi-VN')
        ];
        csvData += rowData.map(sanitizeCSVField).join(',') + '\n';
      });
    } else {
      return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
    }

    // Log the export action
    await supabase.rpc('admin_log_action', {
      p_action: 'data.exported',
      p_entity_type: type,
      p_entity_id: 'bulk',
      p_metadata: { format, limit, rows_exported: csvData.split('\n').length - 1 }
    });

    // We only support CSV right now to avoid heavy dependencies like xlsx,
    // which fulfills the user's base requirement while ensuring anti-injection.
    // To support Excel, we would stream an XLSX blob here.

    // Return the response with proper BOM for Excel UTF-8 display
    return new NextResponse('\uFEFF' + csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error: any) {
    console.error('Export Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
