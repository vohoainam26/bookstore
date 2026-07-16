export function generateVietQRUrl(amount: number, addInfo: string): string {
  const bin = process.env.BANK_BIN;
  const account = process.env.BANK_ACCOUNT_NUMBER;
  const template = process.env.BANK_QR_TEMPLATE || 'compact2';

  if (!bin || !account) {
    throw new Error('Missing bank configuration for QR generation');
  }

  // Use VietQR Quick Link API
  // Format: https://img.vietqr.io/image/<BIN>-<RECEIVER_NUMBER>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<DESCRIPTION>&accountName=<ACCOUNT_NAME>
  
  const baseUrl = `https://img.vietqr.io/image/${bin}-${account}-${template}.png`;
  
  const params = new URLSearchParams();
  if (amount > 0) {
    params.append('amount', amount.toString());
  }
  if (addInfo) {
    params.append('addInfo', encodeURIComponent(addInfo));
  }
  
  const accountName = process.env.BANK_ACCOUNT_NAME;
  if (accountName) {
    params.append('accountName', encodeURIComponent(accountName));
  }

  return `${baseUrl}?${params.toString()}`;
}
