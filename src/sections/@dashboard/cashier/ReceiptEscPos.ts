import { NewPaymentCreate } from '../../../@types/user';
import {
  RECEIPT_ADDRESS,
  RECEIPT_CONTACT_PHONE,
  RECEIPT_NOTICE_TEXT,
} from './ReceiptShared';

interface ReceiptData extends NewPaymentCreate {
  invoiceNumber: string;
  cashierName?: string;
  shopInfo?: {
    shopName?: string;
    address?: string;
    contactPhone?: string;
  };
  appliedDiscounts?: { sourceType: string; description?: string; amount: number }[];
  couponDiscountAmount?: number;
  couponCode?: string;
}

const LINE_WIDTH = 42;

const encoder = new TextEncoder();

const ESC = '\x1b';
const GS = '\x1d';

function centerLine(text: string, width: number = LINE_WIDTH): string {
  if (text.length >= width) return text;
  const padding = Math.floor((width - text.length) / 2);
  return `${' '.repeat(padding)}${text}`;
}

function padRight(text: string, width: number): string {
  if (text.length >= width) return text.slice(0, width);
  return `${text}${' '.repeat(width - text.length)}`;
}

function padLeft(text: string, width: number): string {
  if (text.length >= width) return text.slice(0, width);
  return `${' '.repeat(width - text.length)}${text}`;
}

function formatMoney(value: number): string {
  return value.toFixed(2);
}

function formatItemLine(params: {
  index: number;
  name: string;
  quantity: number;
  price: number;
  amount: number;
}): string[] {
  const { index, name, quantity, price, amount } = params;

  const noWidth = 3;
  const qtyWidth = 4;
  const priceWidth = 8;
  const amountWidth = 9;
  const itemWidth = LINE_WIDTH - noWidth - qtyWidth - priceWidth - amountWidth - 4;

  const itemName = name || 'N/A';
  const trimmedName = itemName.length > itemWidth ? itemName.slice(0, itemWidth) : itemName;

  const headerLine =
    padLeft(String(index), noWidth) +
    ' ' +
    padRight(trimmedName, itemWidth) +
    ' ' +
    padLeft(String(quantity), qtyWidth) +
    ' ' +
    padLeft(formatMoney(price), priceWidth) +
    ' ' +
    padLeft(formatMoney(amount), amountWidth);

  const lines: string[] = [headerLine];

  if (itemName.length > trimmedName.length) {
    const remaining = itemName.slice(trimmedName.length).trim();
    if (remaining) {
      lines.push(`    ${remaining}`);
    }
  }

  return lines;
}

export function generateReceiptEscPos(payment: ReceiptData): Uint8Array {
  let output = '';

  // Initialize printer
  output += `${ESC}@`;

  // Header with shop info if available
  const headerAddress = payment.shopInfo?.address || RECEIPT_ADDRESS;
  const headerPhone = payment.shopInfo?.contactPhone || RECEIPT_CONTACT_PHONE;

  output += `${centerLine(headerAddress)}\n`;
  output += `${centerLine(headerPhone)}\n`;
  output += `${'-'.repeat(LINE_WIDTH)}\n`;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  output += `${dateStr} ${timeStr}\n`;

  if (payment.cashierName) {
    output += `Cashier: ${payment.cashierName}\n`;
  }

  output += `No: ${payment.invoiceNumber || 'N/A'}\n`;
  output += `${'-'.repeat(LINE_WIDTH)}\n`;

  // Items header
  output += `${padRight('NO', 3)} ${padRight('ITEM', 20)} ${padLeft('QTY', 4)} ${padLeft(
    'PRICE',
    8,
  )} ${padLeft('AMOUNT', 9)}\n`;
  output += `${'-'.repeat(LINE_WIDTH)}\n`;

  // Items
  let itemSubtotal = 0;
  let itemDiscount = 0;

  (payment.items || []).forEach((item: any, index: number) => {
    const itemPrice = Number(item.itemPrice) || 0;
    const qty = Number(item.quantity) || 0;
    const offPercent = Number(item.offPercentage) || 0;
    const itemTotal = itemPrice * qty;
    const discountAmount = (itemTotal * offPercent) / 100;
    const itemTotalAfterDiscount = itemTotal - discountAmount;

    itemSubtotal += itemTotal;
    itemDiscount += discountAmount;

    const lines = formatItemLine({
      index: index + 1,
      name: item?.itemName || 'N/A',
      quantity: qty,
      price: itemPrice,
      amount: itemTotalAfterDiscount,
    });

    lines.forEach((line) => {
      output += `${line}\n`;
    });
  });

  output += `${'-'.repeat(LINE_WIDTH)}\n`;

  // Totals
  const subtotalAfterItemDiscount = itemSubtotal - itemDiscount;
  const billDiscount = payment.billDiscountAmount || 0;
  const netTotal = payment.grandTotal || subtotalAfterItemDiscount - billDiscount;

  output += `${padRight('Net Total:', LINE_WIDTH - 13)}LKR ${padLeft(
    formatMoney(netTotal),
    10,
  )}\n`;

  // Payment breakdown
  const cashPaid = (payment as any).cashPaid || 0;
  const creditPaid = (payment as any).creditPaid || 0;
  const debitPaid = (payment as any).debitPaid || 0;

  let paymentMethod = 'CASH';
  let paymentAmount = netTotal;

  if (cashPaid > 0 && creditPaid === 0 && debitPaid === 0) {
    paymentMethod = 'CASH';
    paymentAmount = cashPaid;
  } else if (creditPaid > 0 && cashPaid === 0 && debitPaid === 0) {
    paymentMethod = 'CARD';
    paymentAmount = creditPaid;
  } else if (debitPaid > 0 && cashPaid === 0 && creditPaid === 0) {
    paymentMethod = 'CARD';
    paymentAmount = debitPaid;
  } else {
    paymentMethod = 'SPLIT';
  }

  output += `Payment Method: ${paymentMethod}\n`;

  if (paymentMethod === 'CARD') {
    output += `${padRight('Card Amount:', LINE_WIDTH - 13)}LKR ${padLeft(
      formatMoney(paymentAmount),
      10,
    )}\n`;
  } else if (paymentMethod === 'SPLIT') {
    if (cashPaid > 0) {
      output += `${padRight('Cash:', LINE_WIDTH - 13)}LKR ${padLeft(
        formatMoney(cashPaid),
        10,
      )}\n`;
    }
    if (creditPaid > 0) {
      output += `${padRight('Credit Card:', LINE_WIDTH - 13)}LKR ${padLeft(
        formatMoney(creditPaid),
        10,
      )}\n`;
    }
    if (debitPaid > 0) {
      output += `${padRight('Debit Card:', LINE_WIDTH - 13)}LKR ${padLeft(
        formatMoney(debitPaid),
        10,
      )}\n`;
    }
  }

  const totalPaid = cashPaid + creditPaid + debitPaid;
  const balance = totalPaid - netTotal;

  output += `${padRight('Balance:', LINE_WIDTH - 13)}LKR ${padLeft(
    formatMoney(balance),
    10,
  )}\n`;

  // Discounts section
  const totalDiscount =
    itemDiscount + billDiscount + ((payment as any).couponDiscountAmount || 0);

  if (totalDiscount > 0) {
    output += `\n${centerLine('Discounts')}\n`;

    const appliedDiscounts = (payment as any)
      .appliedDiscounts as { sourceType: string; description?: string; amount: number }[];

    if (Array.isArray(appliedDiscounts) && appliedDiscounts.length > 0) {
      appliedDiscounts.forEach((d) => {
        const label = d.description || d.sourceType;
        const amount = Number(d.amount) || 0;
        if (amount <= 0) return;
        output += `* ${padRight(label, LINE_WIDTH - 13)}LKR ${padLeft(
          formatMoney(amount),
          10,
        )}\n`;
      });
    } else {
      if (billDiscount > 0) {
        output += `* ${padRight('Bill Discount', LINE_WIDTH - 15)}LKR ${padLeft(
          formatMoney(billDiscount),
          10,
        )}\n`;
      }
      if (itemDiscount > 0) {
        output += `* ${padRight('Item Discount', LINE_WIDTH - 15)}LKR ${padLeft(
          formatMoney(itemDiscount),
          10,
        )}\n`;
      }
      const couponAmount = (payment as any).couponDiscountAmount || 0;
      if (couponAmount > 0) {
        const code = (payment as any).couponCode || '';
        const label = code ? `Coupon ${code}` : 'Coupon discount';
        output += `* ${padRight(label, LINE_WIDTH - 15)}LKR ${padLeft(
          formatMoney(couponAmount),
          10,
        )}\n`;
      }
    }
  }

  // Important notice
  output += `\n${centerLine('-IMPORTANT NOTICE-')}\n`;
  const words = RECEIPT_NOTICE_TEXT.split(' ');
  let line = '';
  words.forEach((word) => {
    if ((line + word).length + 1 > LINE_WIDTH) {
      output += `${centerLine(line.trim())}\n`;
      line = `${word} `;
    } else {
      line += `${word} `;
    }
  });
  if (line.trim()) {
    output += `${centerLine(line.trim())}\n`;
  }

  // Feed and cut
  output += '\n\n\n';
  output += `${GS}V\x42\x00`;

  return encoder.encode(output);
}

