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

/**
 * IMPORTANT PRINTING NOTES (for Chrome / Edge etc.):
 * - This PDF is generated as a narrow strip (~79–80mm wide) with auto height.
 * - In the browser print dialog, always use:
 *   - Destination: your thermal receipt printer
 *   - More settings → Paper size: the printer's 80mm/receipt size (or closest)
 *   - Scale: 100% / \"Actual size\" (DO NOT use \"Fit to page\")
 *   - Margins: None or Minimum
 * If scaling is not 100%, the receipt will look tiny on paper.
 */

export async function generateReceiptPDF(
  payment: ReceiptData,
  options?: { debugRuler?: boolean }
) {
  /**
   * Receipt PDF Dimensions:
   * - Width: 79mm (standard 80mm thermal receipt width)
   * - Height: 297mm (A4 height) – acts like an auto-height strip for most receipts
   * - Margins: 3mm on all sides (left, right, top, bottom)
   * - Content Width: 73mm (79mm - 3mm left - 3mm right)
   *
   * Notes:
   * - We use a tall page (297mm) so receipts have plenty of vertical space.
   *   The printer will stop at the end of the content.
   */
  const receiptWidth = 79; // 79mm width (close to standard 80mm roll)
  const receiptHeight = 297; // Tall page to avoid cutting content
  
  const doc = new jsPDF({
    format: [receiptWidth, receiptHeight], // Custom size: 79mm x 297mm strip
    unit: 'mm',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // ~79mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const marginLeft = 3; // 3mm left margin
  const marginRight = 3; // 3mm right margin
  const marginTop = 3; // 3mm top margin
  const marginBottom = 3; // 3mm bottom margin
  const contentWidth = pageWidth - marginLeft - marginRight; // 73mm content width
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
            
            // Calculate logo dimensions (max width 32mm to fit receipt, maintain aspect ratio)
            const maxWidth = 32; // Balanced logo size
            const aspectRatio = img.width / img.height;
            const logoWidth = Math.min(maxWidth, contentWidth - 5); // Ensure it fits with margins
            const logoHeight = logoWidth / aspectRatio;
            
            // Center the logo horizontally
            const logoX = (pageWidth - logoWidth) / 2;
            
            // Add the image to PDF using base64 data
            doc.addImage(imgData, 'PNG', logoX, currentY, logoWidth, logoHeight);
            currentY += logoHeight + 4; // Better spacing after logo
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

  // Location (centered, wrapped if needed)
  const address = payment.shopInfo?.address || 'Kala Beach Club, 110/4 Manara road, Ahangama';
  doc.setFontSize(10); // Better readability
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0); // Black for thermal printing
  const addressLines = doc.splitTextToSize(address, contentWidth);
  addressLines.forEach((line: string) => {
    centerText(line, currentY);
    currentY += 5;
  });
  currentY += 2;

  // Contact Number (centered)
  const contactPhone = payment.shopInfo?.contactPhone || '077 739 0565';
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0); // Black for thermal printing
  centerText(contactPhone, currentY);
  currentY += 5;

  // Divider line
  doc.setLineWidth(0.5);
  doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
  currentY += 5;

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
  doc.setTextColor(0, 0, 0); // Black for thermal printing
  doc.text(`${dateStr} ${timeStr}`, marginLeft, currentY);
  currentY += 5;

  // Cashier/Operator
  if (payment.cashierName) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0); // Black for thermal printing
    doc.text(`Cashier: ${payment.cashierName}`, marginLeft, currentY);
    currentY += 5;
  }

  // Transaction Number (Invoice Number)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0); // Black for thermal printing
  doc.text(`No: ${payment.invoiceNumber || 'N/A'}`, marginLeft, currentY);
  currentY += 5;

  // Divider line
  doc.setLineWidth(0.5);
  doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
  currentY += 4;

  // Itemized List Header
  // Adjusted column widths for 79mm receipt (73mm content width)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255); // White text for header
  const colWidths = {
    no: 8,
    item: contentWidth - 8 - 12 - 20 - 20, // Remaining space for item name
    qty: 12,
    price: 20,
    amount: 20,
  };
  let xPos = marginLeft;

  // Draw black background rectangle for header
  doc.setFillColor(0, 0, 0); // Black background for thermal printing visibility
  doc.rect(marginLeft, currentY - 3, contentWidth, 5, 'F');
  
  doc.text('NO', xPos, currentY);
  xPos += colWidths.no;
  doc.text('ITEM', xPos, currentY);
  xPos += colWidths.item;
  doc.text('QTY', xPos, currentY);
  xPos += colWidths.qty;
  doc.text('PRICE', xPos, currentY);
  xPos += colWidths.price;
  doc.text('AMOUNT', xPos, currentY);
  
  // Reset text color to black for body content
  doc.setTextColor(0, 0, 0);
  currentY += 6;

  // Divider line under header
  doc.setLineWidth(0.5);
  doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
  currentY += 4;

  // Items
  doc.setFontSize(9); // Better readability
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0); // Black for thermal printing
  (payment.items || []).forEach((item: any, index: number) => {
    // Check if we need a new page
    if (currentY > pageHeight - marginBottom - 30) {
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
      itemY += 5;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(0, 0, 0); // Black for thermal printing
      const productCode = `*${String(item.itemId).slice(-8)}`;
      doc.text(productCode, xPos, itemY);
      itemY += 5;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0); // Black for thermal printing
    } else {
      itemY += 5;
    }

    // If item name wrapped to multiple lines, adjust position
    if (itemNameLines.length > 1) {
      itemY += (itemNameLines.length - 1) * 5;
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
    
    currentY = Math.max(itemY, currentY + 5) + 2;
  });

  // Divider line
  currentY += 3;
  doc.setLineWidth(0.5);
  doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
  currentY += 5;

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
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0); // Black for thermal printing
  doc.text('Net Total:', marginLeft, currentY);
  doc.text(netTotal.toFixed(2), pageWidth - marginRight, currentY, { align: 'right' });
  currentY += 5;

  // Payment Method
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0); // Black for thermal printing
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
    doc.setTextColor(0, 0, 0); // Black for thermal printing
    doc.text('Card Amount:', marginLeft, currentY);
    doc.text(paymentAmount.toFixed(2), pageWidth - marginRight, currentY, { align: 'right' });
    currentY += 5;
  } else if (paymentMethod === 'SPLIT') {
    if (cashPaid > 0) {
      doc.setTextColor(0, 0, 0); // Black for thermal printing
      doc.text('Cash:', marginLeft, currentY);
      doc.text(cashPaid.toFixed(2), pageWidth - marginRight, currentY, { align: 'right' });
      currentY += 5;
    }
    if (creditPaid > 0) {
      doc.setTextColor(0, 0, 0); // Black for thermal printing
      doc.text('Credit Card:', marginLeft, currentY);
      doc.text(creditPaid.toFixed(2), pageWidth - marginRight, currentY, { align: 'right' });
      currentY += 5;
    }
    if (debitPaid > 0) {
      doc.setTextColor(0, 0, 0); // Black for thermal printing
      doc.text('Debit Card:', marginLeft, currentY);
      doc.text(debitPaid.toFixed(2), pageWidth - marginRight, currentY, { align: 'right' });
      currentY += 5;
    }
  }

  // Balance
  const totalPaid = cashPaid + creditPaid + debitPaid;
  const balance = totalPaid - netTotal;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0); // Black for thermal printing
  doc.text('Balance:', marginLeft, currentY);
  doc.text(balance.toFixed(2), pageWidth - marginRight, currentY, { align: 'right' });
  currentY += 5;

  // Discounts section (if any) - use calculated values
  const totalDiscount = itemDiscount + billDiscount;

  if (totalDiscount > 0) {
    currentY += 3;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0); // Black for thermal printing
    centerText('Discounts', currentY);
    currentY += 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0); // Black for thermal printing
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
  currentY += 4;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0); // Black for thermal printing
  centerText('IMPORTANT NOTICE', currentY);
  currentY += 4;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0); // Black for thermal printing
  const noticeText = 'In case of a price discrepancy, return the item & receipt within 7 days to get the difference.';
  // Split notice text into multiple lines if needed
  const noticeLines = doc.splitTextToSize(noticeText, contentWidth);
  noticeLines.forEach((line: string) => {
    centerText(line, currentY);
    currentY += 4; // Better line spacing
  });
  
  // Add bottom margin
  currentY += marginBottom;

  // Optional debug ruler to verify physical scale (1mm in PDF ≈ 1mm on paper)
  if (options?.debugRuler) {
    const rulerStartY = pageHeight - marginBottom - 15;
    const rulerStartX = marginLeft;
    const rulerEndX = rulerStartX + 50; // 50mm ruler

    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    // Main ruler line
    doc.line(rulerStartX, rulerStartY, rulerEndX, rulerStartY);

    // Tick marks every 5mm, labelled every 10mm
    for (let mm = 0; mm <= 50; mm += 5) {
      const x = rulerStartX + mm;
      const tickHeight = mm % 10 === 0 ? 3 : 1.5;
      doc.line(x, rulerStartY, x, rulerStartY - tickHeight);
      if (mm % 10 === 0) {
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.text(String(mm), x, rulerStartY - tickHeight - 1);
      }
    }
  }

  return doc;
}

