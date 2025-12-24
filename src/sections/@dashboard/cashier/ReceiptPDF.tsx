import jsPDF from 'jspdf';
import { NewPaymentCreate } from '../../../@types/user';

interface ShopInfo {
  shopName?: string;
  address?: string;
  contactPhone?: string;
}

interface ReceiptData extends NewPaymentCreate {
  invoiceNumber: string;
  cashierName?: string;
  shopInfo?: ShopInfo;
}

export async function generateReceiptPDF(payment: ReceiptData) {
  const doc = new jsPDF({
    format: 'a4', // A4 size
    unit: 'mm',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 2;
  const marginRight = 2;
  const contentWidth = pageWidth - marginLeft - marginRight;
  let currentY = 2;

  // Helper function to center text
  const centerText = (text: string, y: number) => {
    const textWidth = doc.getTextWidth(text);
    const x = (pageWidth - textWidth) / 2;
    doc.text(text, x, y);
  };

  // Load and add logo image
  try {
    const logoUrl = '/ESSENTIALS.png';
    
    // Create a promise to load the image and convert to base64
    const logoPromise = new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          // Create a canvas to convert image to base64
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const imgData = canvas.toDataURL('image/png');
            
            // Calculate logo dimensions (max width 40mm, maintain aspect ratio)
            const maxWidth = 40;
            const aspectRatio = img.width / img.height;
            const logoWidth = maxWidth;
            const logoHeight = maxWidth / aspectRatio;
            
            // Center the logo horizontally
            const logoX = (pageWidth - logoWidth) / 2;
            
            // Add the image to PDF using base64 data
            doc.addImage(imgData, 'PNG', logoX, currentY, logoWidth, logoHeight);
            currentY += logoHeight + 6; // Add spacing after logo
          }
          resolve();
        } catch (error) {
          console.error('Error adding logo to PDF:', error);
          resolve(); // Continue without logo if there's an error
        }
      };
      
      img.onerror = () => {
        console.warn('Could not load logo image, continuing without it');
        resolve(); // Continue without logo if image fails to load
      };
      
      img.src = logoUrl;
    });
    
    // Wait for logo to load (with timeout)
    await Promise.race([
      logoPromise,
      new Promise<void>((resolve) => setTimeout(resolve, 2000)) // 2 second timeout
    ]);
  } catch (error) {
    console.error('Error loading logo:', error);
    // Continue without logo
  }

  // Store Name (centered, uppercase, bold)
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const storeName = payment.shopInfo?.shopName?.toUpperCase() || 'YIVA ESSENTIALS';
  centerText(storeName, currentY);
  currentY += 8;

  // Location (centered)
  const address = payment.shopInfo?.address || 'Kale Beach Club, 110/4 Matara road, Ahangama';
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  centerText(address, currentY);
  currentY += 5;

  // Contact Number (centered)
  const contactPhone = payment.shopInfo?.contactPhone || '077 738 0555';
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  centerText(contactPhone, currentY);
  currentY += 6;

  // Divider line
  doc.setLineWidth(0.5);
  doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
  currentY += 6;

  // Date and Time
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

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${dateStr} ${timeStr}`, marginLeft, currentY);
  currentY += 5;

  // Cashier/Operator
  if (payment.cashierName) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Cashier: ${payment.cashierName}`, marginLeft, currentY);
    currentY += 5;
  }

  // Transaction Number (Invoice Number)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`No: ${payment.invoiceNumber || 'N/A'}`, marginLeft, currentY);
  currentY += 6;

  // Divider line
  doc.setLineWidth(0.5);
  doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
  currentY += 5;

  // Itemized List Header
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  const colWidths = {
    no: 12,
    item: contentWidth - 12 - 25 - 25 - 30, // Remaining space after NO, QTY, PRICE, AMOUNT
    qty: 25,
    price: 25,
    amount: 30,
  };
  let xPos = marginLeft;

  doc.text('NO', xPos, currentY);
  xPos += colWidths.no;
  doc.text('ITEM', xPos, currentY);
  xPos += colWidths.item;
  doc.text('QTY', xPos, currentY);
  xPos += colWidths.qty;
  doc.text('PRICE', xPos, currentY);
  xPos += colWidths.price;
  doc.text('AMOUNT', xPos, currentY);
  currentY += 5;

  // Divider line under header
  doc.setLineWidth(0.5);
  doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
  currentY += 4;

  // Items
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  (payment.items || []).forEach((item: any, index: number) => {
    // Check if we need a new page
    if (currentY > pageHeight - 60) {
      doc.addPage();
      currentY = 2;
    }

    const itemNo = index + 1;
    xPos = marginLeft;

    // NO
    doc.text(String(itemNo), xPos, currentY);
    xPos += colWidths.no;

    // ITEM (wrap if too long)
    const itemName = item?.itemName || 'N/A';
    const maxItemWidth = colWidths.item - 5;
    const itemNameLines = doc.splitTextToSize(itemName, maxItemWidth);
    doc.text(itemNameLines[0], xPos, currentY);
    let itemY = currentY;
    
    // Product Code (if available, show below item name)
    if (item?.itemId) {
      itemY += 4;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      const productCode = `*${String(item.itemId).slice(-8)}`;
      doc.text(productCode, xPos, itemY);
      itemY += 4;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
    } else {
      itemY += 4;
    }

    // If item name wrapped to multiple lines, adjust position
    if (itemNameLines.length > 1) {
      itemY += (itemNameLines.length - 1) * 4;
    }

    // QTY, PRICE, AMOUNT aligned to the right columns
    const qty = item?.quantity || 0;
    const price = item?.itemPrice ? Number(item.itemPrice).toFixed(2) : '0.00';
    const offPercent = Number(item.offPercentage) || 0;
    const itemTotalAfterDiscount = item?.itemPrice && item?.quantity
      ? (Number(item.itemPrice) * Number(item.quantity) * (1 - offPercent / 100)).toFixed(2)
      : '0.00';

    // Align QTY, PRICE, AMOUNT to top of item row
    xPos = marginLeft + colWidths.no + colWidths.item;
    doc.text(String(qty), xPos, currentY);
    xPos += colWidths.qty;
    doc.text(price, xPos, currentY);
    xPos += colWidths.price;
    doc.text(itemTotalAfterDiscount, xPos, currentY);
    
    currentY = Math.max(itemY, currentY + 4) + 2;
  });

  // Divider line
  currentY += 4;
  doc.setLineWidth(0.5);
  doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
  currentY += 6;

  // Calculate totals
  let itemSubtotal = 0;
  let itemDiscount = 0;
  (payment.items || []).forEach((item: any) => {
    const itemPrice = Number(item.itemPrice) || 0;
    const qty = Number(item.quantity) || 0;
    const offPercent = Number(item.offPercentage) || 0;
    const itemTotal = itemPrice * qty;
    const discountAmount = (itemTotal * offPercent) / 100;
    itemSubtotal += itemTotal;
    itemDiscount += discountAmount;
  });

  const subtotalAfterItemDiscount = itemSubtotal - itemDiscount;
  const billDiscount = payment.billDiscountAmount || 0;
  const netTotal = payment.grandTotal || (subtotalAfterItemDiscount - billDiscount);

  // Net Total
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Net Total:', marginLeft, currentY);
  doc.text(netTotal.toFixed(2), pageWidth - marginRight, currentY, { align: 'right' });
  currentY += 6;

  // Payment Method
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
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
    // Split payment
    paymentMethod = 'SPLIT';
  }

  doc.text('Payment Method:', marginLeft, currentY);
  doc.text(paymentMethod, pageWidth - marginRight, currentY, { align: 'right' });
  currentY += 5;

  if (paymentMethod === 'CARD') {
    doc.text('Card Amount:', marginLeft, currentY);
    doc.text(paymentAmount.toFixed(2), pageWidth - marginRight, currentY, { align: 'right' });
    currentY += 5;
  } else if (paymentMethod === 'SPLIT') {
    if (cashPaid > 0) {
      doc.text('Cash:', marginLeft, currentY);
      doc.text(cashPaid.toFixed(2), pageWidth - marginRight, currentY, { align: 'right' });
      currentY += 5;
    }
    if (creditPaid > 0) {
      doc.text('Credit Card:', marginLeft, currentY);
      doc.text(creditPaid.toFixed(2), pageWidth - marginRight, currentY, { align: 'right' });
      currentY += 5;
    }
    if (debitPaid > 0) {
      doc.text('Debit Card:', marginLeft, currentY);
      doc.text(debitPaid.toFixed(2), pageWidth - marginRight, currentY, { align: 'right' });
      currentY += 5;
    }
  }

  // Balance
  const totalPaid = cashPaid + creditPaid + debitPaid;
  const balance = totalPaid - netTotal;
  doc.text('Balance:', marginLeft, currentY);
  doc.text(balance.toFixed(2), pageWidth - marginRight, currentY, { align: 'right' });
  currentY += 6;

  // Discounts section (if any) - use calculated values
  const totalDiscount = itemDiscount + billDiscount;

  if (totalDiscount > 0) {
    currentY += 4;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    centerText('Discounts', currentY);
    currentY += 5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (billDiscount > 0) {
      doc.text('* Bill Discount', marginLeft, currentY);
      doc.text(billDiscount.toFixed(2), pageWidth - marginRight, currentY, { align: 'right' });
      currentY += 5;
    }
    if (itemDiscount > 0) {
      doc.text('* Item Discount', marginLeft, currentY);
      doc.text(itemDiscount.toFixed(2), pageWidth - marginRight, currentY, { align: 'right' });
      currentY += 5;
    }
  }

  // Important Notice
  currentY += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  centerText('-IMPORTANT NOTICE-', currentY);
  currentY += 5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const noticeText = 'In case of a price discrepancy, return the item & bill within 7 days to refund the difference';
  // Split notice text into multiple lines if needed
  const noticeLines = doc.splitTextToSize(noticeText, contentWidth);
  noticeLines.forEach((line: string) => {
    centerText(line, currentY);
    currentY += 4;
  });

  return doc;
}

