// currency.ts - monetary value formatting
export function formatCurrency(
  amount: number,
  locale: string = 'en-IN',
  currencyCode: string = 'INR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatAmount(amount: number): string {
  return amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatAmountWithSign(amount: number, type: 'debit' | 'credit'): string {
  const sign = type === 'debit' ? '-' : '+';
  return `${sign}₹${formatAmount(amount)}`;
}
