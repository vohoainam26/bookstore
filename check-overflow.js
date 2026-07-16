const fs = require('fs');
const path = require('path');

const jsonFile = path.resolve(
    __dirname,
    'fahasa-output-bach-hoa-tong-hop',
    'books-bach-hoa-tong-hop-supabase.json'
);
if (!fs.existsSync(jsonFile)) {
    console.error('Không tìm thấy file:');
    console.error(jsonFile);
    process.exit(1);
}

const products = JSON.parse(
    fs.readFileSync(jsonFile, 'utf8')
);

const MAX_NUMERIC_12_2 = 9999999999.99;
const suspiciousProducts = [];

let maxPrice = 0;
let maxOriginalPrice = 0;
let maxDiscount = 0;

for (let index = 0; index < products.length; index += 1) {
    const product = products[index];

    const price =
        product.price === null ||
            product.price === undefined
            ? null
            : Number(product.price);

    const originalPrice =
        product.original_price === null ||
            product.original_price === undefined
            ? null
            : Number(product.original_price);

    const discount =
        product.discount_percent === null ||
            product.discount_percent === undefined
            ? 0
            : Number(product.discount_percent);

    if (Number.isFinite(price)) {
        maxPrice = Math.max(maxPrice, price);
    }

    if (Number.isFinite(originalPrice)) {
        maxOriginalPrice = Math.max(
            maxOriginalPrice,
            originalPrice
        );
    }

    if (Number.isFinite(discount)) {
        maxDiscount = Math.max(maxDiscount, discount);
    }

    const hasInvalidNumber =
        (price !== null && !Number.isFinite(price)) ||
        (
            originalPrice !== null &&
            !Number.isFinite(originalPrice)
        ) ||
        !Number.isFinite(discount);

    const hasOverflow =
        Math.abs(price || 0) > MAX_NUMERIC_12_2 ||
        Math.abs(originalPrice || 0) >
        MAX_NUMERIC_12_2 ||
        discount < -32768 ||
        discount > 32767;

    const looksUnrealistic =
        Math.abs(price || 0) > 100000000 ||
        Math.abs(originalPrice || 0) > 100000000 ||
        discount < 0 ||
        discount > 100;

    if (
        hasInvalidNumber ||
        hasOverflow ||
        looksUnrealistic
    ) {
        suspiciousProducts.push({
            row: index + 1,
            source_id: product.source_id,
            title: product.title,
            price,
            original_price: originalPrice,
            discount_percent: discount,
            hasInvalidNumber,
            hasOverflow,
            looksUnrealistic
        });
    }
}

console.log('Tổng sản phẩm:', products.length);
console.log('Giá bán lớn nhất:', maxPrice);
console.log('Giá gốc lớn nhất:', maxOriginalPrice);
console.log('Giảm giá lớn nhất:', maxDiscount);
console.log(
    'Số sản phẩm đáng ngờ:',
    suspiciousProducts.length
);

if (suspiciousProducts.length > 0) {
    console.log('');
    console.log('CÁC SẢN PHẨM CẦN KIỂM TRA:');
    console.table(suspiciousProducts);
} else {
    console.log('');
    console.log(
        'Không phát hiện giá trị bất thường ' +
        'trong price, original_price và discount_percent.'
    );
}