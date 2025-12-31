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
  /**
   * Receipt PDF Dimensions:
   * - Width: 80mm (standard thermal receipt printer width, equivalent to 3 inches)
   * - Height: Auto-expanding (starts at 297mm, adds pages as needed)
   * - Margins: 5mm on all sides (left, right, top, bottom)
   * - Content Width: 70mm (80mm - 5mm left - 5mm right)
   * 
   * This format is optimized for standard thermal receipt printers
   * that use 80mm wide paper rolls.
   */
  const receiptWidth = 80; // 80mm = standard receipt printer width (3 inches)
  const receiptHeight = 297; // Start with A4 height, will auto-expand if needed
  
  const doc = new jsPDF({
    format: [receiptWidth, receiptHeight], // Custom size: 80mm x 297mm
    unit: 'mm',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // Should be 80mm
  const pageHeight = doc.internal.pageSize.getHeight(); // Auto-expanding
  const marginLeft = 5; // 5mm left margin (standard for receipts)
  const marginRight = 5; // 5mm right margin
  const marginTop = 5; // 5mm top margin
  const marginBottom = 5; // 5mm bottom margin
  const contentWidth = pageWidth - marginLeft - marginRight; // 70mm content width
  let currentY = marginTop; // Start from top margin

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
            
            // Calculate logo dimensions (max width 50mm to fit receipt, maintain aspect ratio)
            const maxWidth = 50; // Adjusted for 80mm receipt width
            const aspectRatio = img.width / img.height;
            const logoWidth = Math.min(maxWidth, contentWidth - 10); // Ensure it fits with margins
            const logoHeight = logoWidth / aspectRatio;
            
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
  doc.setFontSize(16); // Reduced from 20 to fit receipt width
  doc.setFont('helvetica', 'bold');
  const storeName = payment.shopInfo?.shopName?.toUpperCase() || 'YIVA ESSENTIALS';
  // Split long store names if needed
  const storeNameLines = doc.splitTextToSize(storeName, contentWidth);
  storeNameLines.forEach((line: string) => {
    centerText(line, currentY);
    currentY += 5;
  });
  currentY += 3;

  // Location (centered, wrapped if needed)
  const address = payment.shopInfo?.address || 'Kale Beach Club, 110/4 Matara road, Ahangama';
  doc.setFontSize(9); // Slightly reduced
  doc.setFont('helvetica', 'normal');
  const addressLines = doc.splitTextToSize(address, contentWidth);
  addressLines.forEach((line: string) => {
    centerText(line, currentY);
    currentY += 4;
  });
  currentY += 2;

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
  // Adjusted column widths for 80mm receipt (70mm content width)
  doc.setFontSize(9); // Reduced from 11
  doc.setFont('helvetica', 'bold');
  const colWidths = {
    no: 8, // Reduced from 12
    item: contentWidth - 8 - 12 - 20 - 20, // Remaining space: 70 - 8 - 12 - 20 - 20 = 10mm for item name
    qty: 12, // Reduced from 25
    price: 20, // Reduced from 25
    amount: 20, // Reduced from 30
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
  doc.setFontSize(8); // Reduced from 9 for better fit
  doc.setFont('helvetica', 'normal');
  (payment.items || []).forEach((item: any, index: number) => {
    // Check if we need a new page
    if (currentY > pageHeight - marginBottom - 40) {
      doc.addPage([receiptWidth, receiptHeight]);
      currentY = marginTop;
    }

    const itemNo = index + 1;
    xPos = marginLeft;

    // NO
    doc.text(String(itemNo), xPos, currentY);
    xPos += colWidths.no;

    // ITEM (wrap if too long)
    const itemName = item?.itemName || 'N/A';
    const maxItemWidth = colWidths.item; // Use full column width
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
  doc.setFontSize(10); // Reduced from 11
  doc.setFont('helvetica', 'bold');
  doc.text('Net Total:', marginLeft, currentY);
  doc.text(netTotal.toFixed(2), pageWidth - marginRight, currentY, { align: 'right' });
  currentY += 5;

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
  currentY += 6; // Reduced spacing
  doc.setFontSize(9); // Reduced from 10
  doc.setFont('helvetica', 'bold');
  centerText('-IMPORTANT NOTICE-', currentY);
  currentY += 4;

  doc.setFontSize(8); // Reduced from 9
  doc.setFont('helvetica', 'normal');
  const noticeText = 'In case of a price discrepancy, return the item & bill within 7 days to refund the difference';
  // Split notice text into multiple lines if needed
  const noticeLines = doc.splitTextToSize(noticeText, contentWidth);
  noticeLines.forEach((line: string) => {
    centerText(line, currentY);
    currentY += 3.5; // Slightly reduced line spacing
  });
  
  // Add bottom margin
  currentY += marginBottom;

  return doc;
}

