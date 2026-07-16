import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabaseUrl =
        process.env.SUPABASE_URL;

    const supabaseKey =
        process.env.SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json(
            {
                connected: false,
                stage: 'environment',
                message:
                    'Thiếu SUPABASE_URL hoặc SUPABASE_PUBLISHABLE_KEY',
            },
            {
                status: 500,
            }
        );
    }

    const supabase = createClient(
        supabaseUrl,
        supabaseKey,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        }
    );

    const {
        data,
        error,
        count,
    } = await supabase
        .from('books')
        .select(
            `
                id,
                source_id,
                title,
                slug,
                price,
                original_price
            `,
            {
                count: 'exact',
            }
        )
        .order('id', {
            ascending: false,
        })
        .limit(3);

    if (error) {
        return NextResponse.json(
            {
                connected: false,
                stage: 'database-query',
                error: {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                },
            },
            {
                status: 500,
            }
        );
    }

    return NextResponse.json({
        connected: true,
        table: 'public.books',
        total: count ?? 0,
        sample: data ?? [],
    });
}