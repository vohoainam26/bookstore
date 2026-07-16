require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const TABLE_NAME = 'books';
const BATCH_SIZE = 500;

const JSON_FILE = path.resolve(
    __dirname,
    'fahasa-output-sach-ngoai-van',
    'books-sach-ngoai-van-supabase.json'
);
function sleep(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}

function loadProducts() {
    if (!fs.existsSync(JSON_FILE)) {
        throw new Error(
            `Không tìm thấy file JSON:\n${JSON_FILE}`
        );
    }

    const content = fs.readFileSync(
        JSON_FILE,
        'utf8'
    );

    const products = JSON.parse(content);

    if (!Array.isArray(products)) {
        throw new Error(
            'File JSON phải chứa một mảng sản phẩm.'
        );
    }

    return products;
}

function createSlug(text) {
    return String(text || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();
}

function removeDuplicates(products) {
    const uniqueProducts = new Map();

    for (const product of products) {
        if (!product.source_id) {
            continue;
        }

        const sourceId =
            String(product.source_id).trim();

        /*
         * Gắn source_id vào cuối slug để bảo đảm duy nhất.
         *
         * Ví dụ:
         * nha-gia-kim-1034496
         */
        const baseSlug =
            createSlug(product.title) || 'book';

        const uniqueSlug =
            `${baseSlug}-${sourceId}`;

        const cleanedProduct = {
            source_id: sourceId,

            title: product.title || null,
            slug: uniqueSlug,

            price:
                product.price === null ||
                    product.price === undefined
                    ? null
                    : Number(product.price),

            original_price:
                product.original_price === null ||
                    product.original_price === undefined
                    ? null
                    : Number(product.original_price),

            discount_percent:
                product.discount_percent === null ||
                    product.discount_percent === undefined
                    ? 0
                    : Number(product.discount_percent),

            description_html:
                product.description_html || null,

            image_url:
                product.image_url || null,

            source_url:
                product.source_url || null,

            label:
                product.label || null,

            episode:
                product.episode || null,

            stock_status:
                product.stock_status || 'in_stock',

            reviews_count:
                product.reviews_count === null ||
                    product.reviews_count === undefined
                    ? null
                    : Number(product.reviews_count),

            rating_value:
                product.rating_value === null ||
                    product.rating_value === undefined
                    ? null
                    : Number(product.rating_value),

            category:
                product.category ||
                'Sách Ngoại Văn',
        };

        uniqueProducts.set(
            sourceId,
            cleanedProduct
        );
    }

    return Array.from(
        uniqueProducts.values()
    );
}

function createBatches(products) {
    const batches = [];

    for (
        let index = 0;
        index < products.length;
        index += BATCH_SIZE
    ) {
        batches.push(
            products.slice(
                index,
                index + BATCH_SIZE
            )
        );
    }

    return batches;
}

async function main() {
    const supabaseUrl =
        process.env.SUPABASE_URL;

    const supabaseSecretKey =
        process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl) {
        throw new Error(
            'Không tìm thấy SUPABASE_URL trong file .env'
        );
    }

    if (!supabaseSecretKey) {
        throw new Error(
            'Không tìm thấy SUPABASE_SECRET_KEY trong file .env'
        );
    }

    const supabase = createClient(
        supabaseUrl,
        supabaseSecretKey,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false
            }
        }
    );

    console.log('Đang đọc file JSON...');

    const rawProducts = loadProducts();
    const products =
        removeDuplicates(rawProducts);
    const slugCounts = new Map();

    for (const product of products) {
        slugCounts.set(
            product.slug,
            (slugCounts.get(product.slug) || 0) + 1
        );
    }

    const duplicateSlugs = Array.from(
        slugCounts.entries()
    ).filter(([, count]) => count > 1);

    console.log(
        `Slug bị trùng sau xử lý: ` +
        `${duplicateSlugs.length}`
    );

    if (duplicateSlugs.length > 0) {
        console.table(duplicateSlugs);

        throw new Error(
            'Vẫn còn slug trùng, chưa thực hiện upload.'
        );
    }
    console.log(
        `Dữ liệu ban đầu: ${rawProducts.length}`
    );

    console.log(
        `Sau khi loại trùng: ${products.length}`
    );

    if (products.length === 0) {
        throw new Error(
            'Không có sản phẩm hợp lệ.'
        );
    }

    const batches = createBatches(products);

    console.log(
        `Số lô cần tải: ${batches.length}`
    );

    let uploadedCount = 0;

    for (
        let index = 0;
        index < batches.length;
        index += 1
    ) {
        const batch = batches[index];

        console.log(
            `Đang tải lô ${index + 1}/` +
            `${batches.length}...`
        );

        const { error } = await supabase
            .from(TABLE_NAME)
            .upsert(batch, {
                onConflict: 'source_id',
                ignoreDuplicates: false
            });

        if (error) {
            throw new Error(
                `Lỗi lô ${index + 1}: ` +
                error.message
            );
        }

        uploadedCount += batch.length;

        console.log(
            `Đã xử lý ${uploadedCount}/` +
            `${products.length} sản phẩm.`
        );

        await sleep(500);
    }

    console.log('');
    console.log('==============================');
    console.log('ĐẨY DỮ LIỆU THÀNH CÔNG');
    console.log(
        `Tổng sản phẩm: ${uploadedCount}`
    );
    console.log('==============================');
}

main().catch((error) => {
    console.error('');
    console.error(
        'KHÔNG THỂ ĐẨY DỮ LIỆU:'
    );
    console.error(error.message);

    process.exitCode = 1;
});