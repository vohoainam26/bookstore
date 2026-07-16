const fs = require('fs');
const path = require('path');

const jsonFile = path.resolve(
    __dirname,
    'fahasa-output-van-phong-pham-dung-cu-van-phong',
    'books-van-phong-pham-dung-cu-van-phong-supabase.json'
);

const backupFile = path.resolve(
    __dirname,
    'fahasa-output-van-phong-pham-dung-cu-van-phong',
    'books-van-phong-pham-dung-cu-van-phong-backup-before-price-fix.json'
);
if (!fs.existsSync(jsonFile)) {
    console.error('Không tìm thấy file:');
    console.error(jsonFile);
    process.exit(1);
}

const products = JSON.parse(
    fs.readFileSync(jsonFile, 'utf8')
);

if (!Array.isArray(products)) {
    console.error(
        'File JSON không chứa mảng sản phẩm.'
    );
    process.exit(1);
}

/*
 * Sao lưu file gốc trước khi sửa.
 */
if (!fs.existsSync(backupFile)) {
    fs.copyFileSync(
        jsonFile,
        backupFile
    );

    console.log('Đã tạo file sao lưu:');
    console.log(backupFile);
}

let fixedCount = 0;
const unresolvedProducts = [];

const fixedProducts = products.map(
    (product, index) => {
        const priceNumber =
            Number(product.price);

        const originalPriceNumber =
            Number(product.original_price);

        const discountNumber =
            Number(product.discount_percent || 0);

        /*
         * Chỉ sửa những giá trị rõ ràng bất thường.
         */
        if (
            Number.isFinite(priceNumber) &&
            priceNumber <= 100000000
        ) {
            return product;
        }

        if (
            !Number.isFinite(originalPriceNumber) ||
            !Number.isFinite(discountNumber)
        ) {
            unresolvedProducts.push({
                row: index + 1,
                source_id: product.source_id,
                title: product.title,
                price: product.price,
                original_price:
                    product.original_price,
                discount_percent:
                    product.discount_percent
            });

            return product;
        }

        const priceText =
            String(product.price)
                .replace(/[^\d]/g, '');

        const originalPriceText =
            String(product.original_price)
                .replace(/[^\d]/g, '');

        const discountText =
            String(discountNumber)
                .replace(/[^\d]/g, '');

        /*
         * Giá lỗi có cấu trúc:
         *
         * giá bán + giảm giá + giá gốc
         *
         * Ví dụ:
         * 11200030160000
         * = 112000 + 30 + 160000
         */
        const suffix =
            `${discountText}${originalPriceText}`;

        if (
            priceText.length > suffix.length &&
            priceText.endsWith(suffix)
        ) {
            const correctedText =
                priceText.slice(
                    0,
                    priceText.length - suffix.length
                );

            const correctedPrice =
                Number(correctedText);

            const isValid =
                Number.isInteger(correctedPrice) &&
                correctedPrice >= 0 &&
                correctedPrice <=
                originalPriceNumber;

            if (isValid) {
                fixedCount += 1;

                return {
                    ...product,
                    price: correctedPrice
                };
            }
        }

        unresolvedProducts.push({
            row: index + 1,
            source_id: product.source_id,
            title: product.title,
            price: product.price,
            original_price:
                product.original_price,
            discount_percent:
                product.discount_percent
        });

        return product;
    }
);

fs.writeFileSync(
    jsonFile,
    JSON.stringify(
        fixedProducts,
        null,
        2
    ),
    'utf8'
);

console.log('');
console.log('==============================');
console.log('HOÀN THÀNH SỬA GIÁ');
console.log(
    `Tổng sản phẩm: ${products.length}`
);
console.log(
    `Số giá đã sửa: ${fixedCount}`
);
console.log(
    `Số dòng chưa sửa được: ` +
    `${unresolvedProducts.length}`
);
console.log('==============================');

if (unresolvedProducts.length > 0) {
    console.log('');
    console.log(
        'Các dòng chưa sửa được:'
    );

    console.table(
        unresolvedProducts.slice(0, 20)
    );
}