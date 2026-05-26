// parser.ts - SMS parsing for Indian bank transactions
import type { ParsedTransaction } from '../types';

const DEBIT_PATTERNS = [
  // HDFC: "Rs.500.00 debited from a/c XX1234 on 26-05-26"
  /(?:Rs\.|INR|₹)\s*([\d,]+\.?\d*)\s+(?:debited|spent|withdrawn)/i,
  // ICICI: "ICICI Bank Acct XX1234 debited with Rs 500"
  /debited\s+with\s+(?:Rs\.?|INR|₹)\s*([\d,]+\.?\d*)/i,
  // Generic debit
  /(?:debit|Dr)\s*(?:Rs\.?|INR|₹)\s*([\d,]+\.?\d*)/i,
  // UPI debit
  /paid\s+(?:Rs\.?|INR|₹)\s*([\d,]+\.?\d*)/i,
  // "You have done a UPI txn of Rs 500"
  /(?:txn|transaction)\s+(?:of|for)\s+(?:Rs\.?|INR|₹)\s*([\d,]+\.?\d*)/i,
];

const CREDIT_PATTERNS = [
  /(?:Rs\.|INR|₹)\s*([\d,]+\.?\d*)\s+(?:credited|received|deposited)/i,
  /credited\s+with\s+(?:Rs\.?|INR|₹)\s*([\d,]+\.?\d*)/i,
  /(?:credit|Cr)\s*(?:Rs\.?|INR|₹)\s*([\d,]+\.?\d*)/i,
];

const MERCHANT_PATTERN = /(?:at|to|from|via|towards)\s+([A-Z][A-Za-z\s&'\\-]{2,30})/;

export function parseSms(sms: {
  body: string;
  address: string;
  date: number;
}): ParsedTransaction | null {
  const body = sms.body;

  let amount: number | null = null;
  let type: 'debit' | 'credit' | null = null;

  // Try debit patterns first
  for (const pattern of DEBIT_PATTERNS) {
    const match = body.match(pattern);
    if (match) {
      amount = parseFloat(match[1].replace(/,/g, ''));
      type = 'debit';
      break;
    }
  }

  // Try credit patterns
  if (!amount) {
    for (const pattern of CREDIT_PATTERNS) {
      const match = body.match(pattern);
      if (match) {
        amount = parseFloat(match[1].replace(/,/g, ''));
        type = 'credit';
        break;
      }
    }
  }

  if (!amount || !type) return null;

  const merchantMatch = body.match(MERCHANT_PATTERN);
  const merchant = merchantMatch ? merchantMatch[1].trim() : 'Unknown';

  return {
    amount,
    type,
    name: merchant,
    category: inferCategory(merchant),
    date: new Date(sms.date).toISOString(),
    source: 'sms',
    rawSms: body,
  };
}

function inferCategory(merchant: string): string {
  const m = merchant.toLowerCase();
  if (/netflix|spotify|prime|hotstar|disney|jio|airtel|vi\s/.test(m))
    return 'Subscription';
  if (
    /swiggy|zomato|starbucks|mcdonalds|kfc|dominos|uber\s*eat|cafe|restaurant|food/.test(m)
  )
    return 'Food & Drinks';
  if (/uber|ola|rapido|metro|irctc|rail|petrol|fuel|parking/.test(m))
    return 'Transport';
  if (/amazon|flipkart|myntra|ajio|nykaa|meesho|shop/.test(m))
    return 'Shopping';
  if (/apollo|practo|1mg|pharmacy|hospital|medic|doctor|clinic/.test(m))
    return 'Health';
  if (/pvr|inox|bookmyshow|cinema|game/.test(m)) return 'Entertainment';
  return 'Other';
}
