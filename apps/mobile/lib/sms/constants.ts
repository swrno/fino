// constants.ts - Known bank SMS sender IDs
export const KNOWN_SENDERS = [
  // Indian banks
  'HDFCBK', 'ICICIB', 'SBIINB', 'AXISBK', 'KOTAKB',
  'CENTBK', 'BOIIND', 'PNBSMS', 'CANBNK', 'UNIONB',
  'IABORB', 'FEDBK',
  // Wallets / UPI
  'PAYTMB', 'PYTM', 'PHONEPE', 'GPAY', 'AMAZONPAY',
  // Credit cards
  'HDFCCC', 'ICICICC', 'SBICARD', 'AXISCC',
  // Regex-friendly prefixes
  'AD-', 'VM-', 'BZ-', 'BP-', 'DM-',
] as const;

export const SENDER_BANK_MAP: Record<string, string> = {
  HDFCBK: 'HDFC Bank',
  ICICIB: 'ICICI Bank',
  SBIINB: 'SBI',
  AXISBK: 'Axis Bank',
  KOTAKB: 'Kotak Bank',
  PAYTMB: 'Paytm',
  PHONEPE: 'PhonePe',
  HDFCCC: 'HDFC Credit Card',
  ICICICC: 'ICICI Credit Card',
  SBICARD: 'SBI Card',
};
