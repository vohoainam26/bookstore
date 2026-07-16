const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/*
 * ============================================================
 * CẤU HÌNH
 * ============================================================
 *
 * PAGE_STEP = 4:
 *   Trang 1 -> 5 -> 9 -> 13...
 *
 * Muốn cào liên tiếp:
 *   Trang 1 -> 2 -> 3 -> 4...
 * thì đổi PAGE_STEP thành 1.
 */
const CONFIG = {
    baseUrl:
        'https://www.fahasa.com/foreigncategory.html',

    category: 'Sách Ngoại Văn',
    outputPrefix: 'fahasa-sach-ngoai-van',

    startPage: 1,
    pageStep: 1,

    limit: 48,
    order: 'num_orders',

    // Cào page 1 và page 2 rồi tự dừng
    maxPagesToVisit: 2,

    headless: false,
    pageTimeoutMs: 90000,
    waitAfterLoadMs: 10000,
    waitAfterScrollMs: 2500,

    outputDirectory: path.resolve(
        __dirname,
        'fahasa-output-sach-ngoai-van'
    ),

    userDataDir: path.resolve(
        __dirname,
        'fahasa-profile'
    )
};
function sleep(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function convertPrice(priceText) {
    if (
        priceText === null ||
        priceText === undefined
    ) {
        return null;
    }

    /*
     * Chỉ lấy số tiền đầu tiên.
     *
     * Ví dụ:
     * "112.000 đ -30% 160.000 đ"
     * sẽ lấy "112.000", không nối tất cả số.
     */
    const match = String(priceText).match(
        /\d{1,3}(?:[.,\s]\d{3})+|\d+/
    );

    if (!match) {
        return null;
    }

    return Number(
        match[0].replace(/[^\d]/g, '')
    );
}

function cleanProductUrl(productUrl) {
    try {
        const parsedUrl = new URL(productUrl);

        return `${parsedUrl.origin}${parsedUrl.pathname}`;
    } catch {
        return productUrl || null;
    }
}

function buildPageUrl(pageNumber) {
    const url = new URL(CONFIG.baseUrl);

    url.searchParams.set('order', CONFIG.order);
    url.searchParams.set('limit', String(CONFIG.limit));
    url.searchParams.set('p', String(pageNumber));

    return url.toString();
}

function ensureOutputDirectory() {
    fs.mkdirSync(CONFIG.outputDirectory, {
        recursive: true
    });
}

function getPageFileName(pageNumber) {
    const pageText = String(pageNumber).padStart(3, '0');

    return path.join(
        CONFIG.outputDirectory,
        `${CONFIG.outputPrefix}-page-${pageText}.json`
    );
}

function getCombinedFileName() {
    return path.join(
        CONFIG.outputDirectory,
        `${CONFIG.outputPrefix}-all-pages.json`
    );
}

function getSupabaseFileName() {
    return path.join(
        CONFIG.outputDirectory,
        `books-${CONFIG.outputPrefix.replace(/^fahasa-/, '')}-supabase.json`
    );
}

function saveJson(filePath, data) {
    fs.writeFileSync(
        filePath,
        JSON.stringify(data, null, 2),
        'utf8'
    );
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

function createSupabaseRows(products) {
    return products.map((product) => ({
        source_id: product.product_id,
        title: product.title,
        slug: createSlug(product.title),

        /*
         * Trong bảng books:
         * price = giá bán sau giảm
         * original_price = giá gốc
         */
        price: product.final_price,
        original_price: product.price,
        discount_percent: product.discount_percent,

        description_html: null,
        image_url: product.image_src,
        source_url: product.product_url,

        label: null,
        episode: null,
        stock_status: 'in_stock',
        reviews_count: null,
        rating_value: null,

        category: product.category
    }));
}

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let previousHeight = 0;
            let unchangedCount = 0;

            const timer = setInterval(() => {
                window.scrollBy(0, 700);

                const currentHeight =
                    document.documentElement.scrollHeight;

                if (currentHeight === previousHeight) {
                    unchangedCount += 1;
                } else {
                    previousHeight = currentHeight;
                    unchangedCount = 0;
                }

                const reachedBottom =
                    window.innerHeight + window.scrollY >=
                    currentHeight - 50;

                if (reachedBottom || unchangedCount >= 6) {
                    clearInterval(timer);
                    resolve();
                }
            }, 250);
        });
    });
}

async function inspectPage(page) {
    return page.evaluate(() => {
        const bodyText = document.body?.innerText || '';

        return {
            title: document.title,
            currentUrl: window.location.href,
            bodyPreview: bodyText.slice(0, 600),
            htmlLinkCount:
                document.querySelectorAll('a[href*=".html"]').length,
            priceElementCount:
                document.querySelectorAll('[id^="product-price-"]').length
        };
    });
}

function pageLooksBlocked(pageInfo) {
    const searchableText =
        `${pageInfo.title} ${pageInfo.bodyPreview}`.toLowerCase();

    const blockedPhrases = [
        'access denied',
        'captcha',
        'checking your browser',
        'verify you are human',
        'xác minh bạn là con người'
    ];

    return blockedPhrases.some((phrase) =>
        searchableText.includes(phrase)
    );
}

async function saveDebugFiles(page, pageNumber, reason) {
    const pageText = String(pageNumber).padStart(3, '0');

    const screenshotPath = path.join(
        CONFIG.outputDirectory,
        `${CONFIG.outputPrefix}-debug-page-${pageText}.png`
    );

    const htmlPath = path.join(
        CONFIG.outputDirectory,
        `${CONFIG.outputPrefix}-debug-page-${pageText}.html`
    );

    const reasonPath = path.join(
        CONFIG.outputDirectory,
        `${CONFIG.outputPrefix}-debug-page-${pageText}.txt`
    );

    await page.screenshot({
        path: screenshotPath,
        fullPage: true
    });

    fs.writeFileSync(
        htmlPath,
        await page.content(),
        'utf8'
    );

    fs.writeFileSync(
        reasonPath,
        String(reason || 'Không xác định'),
        'utf8'
    );

    console.log('Đã lưu file debug:');
    console.log(`- ${screenshotPath}`);
    console.log(`- ${htmlPath}`);
    console.log(`- ${reasonPath}`);
}

async function extractProducts(page) {
    const rawProducts = await page.evaluate((categoryName) => {
        function normalizeUrl(urlValue) {
            try {
                const parsedUrl = new URL(urlValue);

                return `${parsedUrl.origin}${parsedUrl.pathname}`;
            } catch {
                return urlValue || null;
            }
        }

        function isRootProductUrl(urlValue) {
            try {
                const parsedUrl = new URL(urlValue);

                const validHost =
                    parsedUrl.hostname === 'www.fahasa.com' ||
                    parsedUrl.hostname === 'fahasa.com';

                const pathParts = parsedUrl.pathname
                    .split('/')
                    .filter(Boolean);

                const isHtmlPage =
                    pathParts.length === 1 &&
                    pathParts[0].endsWith('.html');

                const isSeriesPage =
                    pathParts[0]?.startsWith('series-') ||
                    pathParts[0]?.startsWith('seriesbook-');

                return (
                    validHost &&
                    isHtmlPage &&
                    !isSeriesPage
                );
            } catch {
                return false;
            }
        }

        function getImageUrl(imageElement) {
            if (!imageElement) {
                return null;
            }

            return (
                imageElement.currentSrc ||
                imageElement.getAttribute('src') ||
                imageElement.getAttribute('data-src') ||
                imageElement.getAttribute('data-original') ||
                imageElement.getAttribute('data-lazy-src') ||
                null
            );
        }

        function scoreImage(imageElement, title) {
            const imageUrl = getImageUrl(imageElement) || '';
            const altText =
                imageElement.getAttribute('alt') || '';

            let score = 0;

            if (imageUrl.includes('/media/catalog/product/')) {
                score += 100;
            }

            if (imageUrl.includes('/media/wysiwyg/')) {
                score -= 100;
            }

            if (
                title &&
                altText &&
                title.toLowerCase().includes(
                    altText.toLowerCase().slice(0, 20)
                )
            ) {
                score += 20;
            }

            return score;
        }

        const results = [];
        const usedProductIds = new Set();
        const usedProductUrls = new Set();

        const priceElements = Array.from(
            document.querySelectorAll(
                '[id^="product-price-"]'
            )
        );

        for (const priceElement of priceElements) {
            const productIdMatch =
                priceElement.id.match(
                    /^product-price-(\d+)$/
                );

            if (!productIdMatch) {
                continue;
            }

            const productId = productIdMatch[1];

            if (usedProductIds.has(productId)) {
                continue;
            }

            /*
             * Tìm phần tử cha có link campaign=CATEGORY.
             * Điều này giúp loại các sản phẩm PERSONALIZE_PRODUCT.
             */
            let ancestor = priceElement;
            let productCard = null;
            let categoryLink = null;

            for (let level = 0; level < 12; level += 1) {
                if (!ancestor) {
                    break;
                }

                const links = Array.from(
                    ancestor.querySelectorAll('a[href]')
                );

                categoryLink = links.find((link) => {
                    if (!isRootProductUrl(link.href)) {
                        return false;
                    }

                    try {
                        const parsedUrl = new URL(link.href);

                        return (
                            parsedUrl.searchParams.get(
                                'fhs_campaign'
                            ) === 'CATEGORY'
                        );
                    } catch {
                        return false;
                    }
                });

                if (
                    categoryLink &&
                    ancestor.querySelector('img')
                ) {
                    productCard = ancestor;
                    break;
                }

                ancestor = ancestor.parentElement;
            }

            /*
             * Nếu không có link CATEGORY thì đây thường là:
             * - sản phẩm được cá nhân hóa;
             * - slider đề xuất;
             * - phần tử không thuộc danh sách chính.
             */
            if (!productCard || !categoryLink) {
                continue;
            }

            const productUrl =
                normalizeUrl(categoryLink.href);

            if (
                !productUrl ||
                usedProductUrls.has(productUrl)
            ) {
                continue;
            }

            const cardLinks = Array.from(
                productCard.querySelectorAll('a[href]')
            ).filter((link) => {
                return (
                    isRootProductUrl(link.href) &&
                    normalizeUrl(link.href) === productUrl
                );
            });

            const titleCandidates = cardLinks
                .map((link) => {
                    const titleAttribute =
                        link.getAttribute('title')?.trim();

                    const textContent =
                        link.textContent?.trim();

                    return titleAttribute || textContent || '';
                })
                .filter((value) => value.length >= 3)
                .sort((first, second) =>
                    second.length - first.length
                );

            const images = Array.from(
                productCard.querySelectorAll('img')
            );

            const bestImage = images
                .map((imageElement) => ({
                    imageElement,
                    score: scoreImage(
                        imageElement,
                        titleCandidates[0] || ''
                    )
                }))
                .sort((first, second) =>
                    second.score - first.score
                )[0]?.imageElement;

            const imageUrl = getImageUrl(bestImage);

            const imageAlt =
                bestImage?.getAttribute('alt')?.trim() || '';

            const title =
                titleCandidates[0] ||
                imageAlt ||
                categoryLink.getAttribute('title')?.trim() ||
                '';

            if (!title || title.length < 3) {
                continue;
            }

            const oldPriceElement =
                productCard.querySelector(
                    `#old-price-${productId}`
                ) ||
                productCard.querySelector(
                    '.old-price .price'
                );

            const discountElement =
                productCard.querySelector(
                    '.discount-l-fs, ' +
                    '.p-sale-label, ' +
                    '.discount-percent'
                );

            const cardText =
                productCard.innerText || '';

            const discountText =
                discountElement?.textContent ||
                cardText.match(/-?\s*\d+\s*%/)?.[0] ||
                '';

            const discountMatch =
                String(discountText).match(/(\d+)\s*%/);

            results.push({
                product_id: productId,
                title,
                product_url: productUrl,
                image_src: imageUrl,

                price_text:
                    oldPriceElement?.textContent?.trim() ||
                    priceElement.textContent?.trim() ||
                    null,

                final_price_text:
                    priceElement.textContent?.trim() ||
                    null,

                discount_percent: discountMatch
                    ? Number(discountMatch[1])
                    : 0,

                category: categoryName
            });

            usedProductIds.add(productId);
            usedProductUrls.add(productUrl);
        }

        return results;
    }, CONFIG.category);

    return rawProducts.map((product) => ({
        product_id: String(product.product_id),
        title: product.title,
        product_url: cleanProductUrl(
            product.product_url
        ),
        image_src: product.image_src,

        price: convertPrice(product.price_text),
        final_price: convertPrice(
            product.final_price_text
        ),

        discount_percent:
            Number(product.discount_percent) || 0,

        category: product.category
    }));
}

async function scrapeAllPages() {
    ensureOutputDirectory();

    console.log('Đang khởi động Chrome...');

    const browser = await puppeteer.launch({
        headless: CONFIG.headless,
        channel: 'chrome',
        defaultViewport: null,
        userDataDir: CONFIG.userDataDir,
        args: [
            '--start-maximized'
        ]
    });

    const page = await browser.newPage();

    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/150.0.0.0 Safari/537.36'
    );

    page.setDefaultNavigationTimeout(
        CONFIG.pageTimeoutMs
    );

    const allProductsByKey = new Map();
    const visitedPageSignatures = new Set();

    let currentPage = CONFIG.startPage;
    let successfulPageCount = 0;

    try {
        for (
            let visitNumber = 1;
            visitNumber <= CONFIG.maxPagesToVisit;
            visitNumber += 1
        ) {
            const pageUrl = buildPageUrl(currentPage);

            console.log('');
            console.log('====================================');
            console.log(
                `ĐANG CÀO PAGE ${currentPage} ` +
                `(lượt ${visitNumber})`
            );
            console.log(pageUrl);
            console.log('====================================');

            await page.goto(pageUrl, {
                waitUntil: 'domcontentloaded',
                timeout: CONFIG.pageTimeoutMs
            });

            await sleep(CONFIG.waitAfterLoadMs);

            let pageInfo = await inspectPage(page);

            console.log(
                `Tiêu đề: ${pageInfo.title}`
            );
            console.log(
                `URL hiện tại: ${pageInfo.currentUrl}`
            );
            console.log(
                'Số link .html: ' +
                pageInfo.htmlLinkCount
            );
            console.log(
                'Số phần tử giá trước khi cuộn: ' +
                pageInfo.priceElementCount
            );

            if (pageLooksBlocked(pageInfo)) {
                await saveDebugFiles(
                    page,
                    currentPage,
                    'Fahasa yêu cầu xác minh hoặc chặn truy cập.'
                );

                throw new Error(
                    'Fahasa đang yêu cầu xác minh. ' +
                    'Hãy mở file debug để kiểm tra.'
                );
            }

            console.log(
                'Đang cuộn trang để tải đủ sản phẩm và hình ảnh...'
            );

            await autoScroll(page);
            await sleep(CONFIG.waitAfterScrollMs);

            pageInfo = await inspectPage(page);

            console.log(
                'Số phần tử giá sau khi cuộn: ' +
                pageInfo.priceElementCount
            );

            const products =
                await extractProducts(page);

            if (products.length === 0) {
                console.log(
                    `Page ${currentPage} không còn sản phẩm hợp lệ.`
                );

                await saveDebugFiles(
                    page,
                    currentPage,
                    'Không tìm thấy sản phẩm CATEGORY hợp lệ.'
                );

                console.log(
                    'Dừng tự động vì đã hết dữ liệu ' +
                    'hoặc cấu trúc trang đã thay đổi.'
                );

                break;
            }

            const pageSignature = products
                .map((product) => product.product_id)
                .sort()
                .join(',');

            if (
                visitedPageSignatures.has(pageSignature)
            ) {
                console.log(
                    `Page ${currentPage} trùng hoàn toàn ` +
                    'với một page đã cào.'
                );
                console.log(
                    'Có thể đã vượt quá page cuối. Dừng script.'
                );
                break;
            }

            visitedPageSignatures.add(pageSignature);

            const pageFileName =
                getPageFileName(currentPage);

            saveJson(pageFileName, products);

            let newProductCount = 0;

            for (const product of products) {
                const key =
                    product.product_id ||
                    product.product_url;

                if (!allProductsByKey.has(key)) {
                    newProductCount += 1;
                }

                allProductsByKey.set(key, product);
            }

            const allProducts =
                Array.from(allProductsByKey.values());

            saveJson(
                getCombinedFileName(),
                allProducts
            );

            saveJson(
                getSupabaseFileName(),
                createSupabaseRows(allProducts)
            );

            successfulPageCount += 1;

            console.log(
                `Cào thành công page ${currentPage}: ` +
                `${products.length} sản phẩm.`
            );
            console.log(
                `Sản phẩm mới thêm vào file tổng: ` +
                `${newProductCount}.`
            );
            console.log(
                `Tổng sản phẩm duy nhất hiện tại: ` +
                `${allProducts.length}.`
            );
            console.log(
                `File page: ${pageFileName}`
            );
            console.log(
                `File tổng: ${getCombinedFileName()}`
            );
            console.log(
                `File Supabase: ${getSupabaseFileName()}`
            );

            if (newProductCount === 0) {
                console.log(
                    'Page này không tạo ra sản phẩm mới. ' +
                    'Dừng để tránh lặp vô hạn.'
                );
                break;
            }

            /*
             * Tự động chuyển:
             * page n -> page n + PAGE_STEP.
             *
             * Với cấu hình hiện tại:
             * 1 -> 5 -> 9 -> 13...
             */
            currentPage += CONFIG.pageStep;
        }

        console.log('');
        console.log('====================================');
        console.log('HOÀN TẤT');
        console.log(
            `Số page cào thành công: ${successfulPageCount}`
        );
        console.log(
            `Tổng sản phẩm duy nhất: ${allProductsByKey.size}`
        );
        console.log(
            `Thư mục kết quả: ${CONFIG.outputDirectory}`
        );
        console.log('====================================');
    } catch (error) {
        console.error('');
        console.error('LỖI:', error.message);
    } finally {
        console.log('Đang đóng trình duyệt...');
        await browser.close();
    }
}

scrapeAllPages();
