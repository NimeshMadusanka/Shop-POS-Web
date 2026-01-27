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
   * - Width: 79mm (thermal receipt printer width)
   * - Height: 103mm (fixed height for receipt)
   * - Margins: 5mm on all sides (left, right, top, bottom)
   * - Content Width: 69mm (79mm - 5mm left - 5mm right)
   * 
   * This format is optimized for thermal receipt printers
   * that use 79mm wide paper rolls.
   */
  const receiptWidth = 79; // 79mm receipt width
  const receiptHeight = 103; // 103mm receipt height

  // Create PDF with custom page size (width x height in mm)
  // Note: When using custom format array, don't specify orientation as it may conflict
  const doc = new jsPDF({
    unit: 'mm',
    format: [receiptWidth, receiptHeight], // Custom size: 79mm (width) x 103mm (height)
  });

  // Get actual page dimensions from jsPDF to verify they match our custom size
  const pageWidth = doc.internal.pageSize.getWidth() - 8; // Should be 79mm
  const pageHeight = doc.internal.pageSize.getHeight(); // Should be 103mm
  
  // Set margins - these position content from the top-left corner (0,0)
  const marginLeft = 0; // 5mm left margin (standard for receipts)
  const marginRight = 0.4; // 5mm right margin
  const marginTop = 0.5; // 5mm top margin
  const marginBottom = 0.5; // 5mm bottom margin
  const contentWidth = pageWidth - marginLeft - marginRight; // 69mm content width (79mm - 5mm - 5mm)
  let currentY = marginTop; // Start from top margin (Y=0 is at top in jsPDF)

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
            const maxWidth = 33; // Adjusted for 79mm receipt width
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
  doc.setFontSize(14); // Reduced from 20 to fit receipt width
  doc.setFont('helvetica', 'bold');
  // doc.setTextColor(0, 0, 0); // Black for thermal printing
  // const storeName = payment.shopInfo?.shopName?.toUpperCase() || 'YIVA ESSENTIALS';
  // // Split long store names if needed
  // const storeNameLines = doc.splitTextToSize(storeName, contentWidth);
  // storeNameLines.forEach((line: string) => {
  //   centerText(line, currentY);
  //   currentY += 5;
  // });
  // currentY += 3;









  // Location (centered, wrapped if needed)
  const address = payment.shopInfo?.address || '110/4, Matara Road, Ahangama';
  doc.setFontSize(8); // Slightly reduced
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0); // Black for thermal printing
  const addressLines = doc.splitTextToSize(address, contentWidth);
  addressLines.forEach((line: string) => {
    centerText(line, currentY);
    currentY += 4;
  });
  currentY += 2;

  // Contact Number (centered)
  const contactPhone = payment.shopInfo?.contactPhone || '077 738 055';
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0); // Black for thermal printing
  centerText(`Tel - ${contactPhone}`, currentY);
  currentY += 2;

 doc.setLineWidth(0.5);
  doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
  currentY += 4;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0); // Black for thermal printing
  centerText('Receipt', currentY);
  currentY += 2;
  // Divider line
  // doc.setLineWidth(0.8);
  // doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
  // currentY += 6;

  // // Receipt Title
  // doc.setFontSize(16);
  // doc.setFont('helvetica', 'bold');
  // doc.setTextColor(0, 0, 0);
  // centerText('Receipt', currentY);
  // currentY += 8;

  // Date and Time (separate lines)
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

  // Format Receipt No as YER(YYMMDDHHMMSS)
    currentY += 4;
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  const receiptNo = `YER${year}${month}${day}${hour}${minute}${second}`;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0); // Black for thermal printing
  doc.text(`Receipt No: ${receiptNo}`, marginLeft, currentY);
  currentY += 5;

  doc.text(`Date: ${dateStr} ${timeStr}`, marginLeft, currentY);
  currentY += 5;


  // User (Cashier)
  if (payment.cashierName) {
    doc.text(`User: ${payment.cashierName}`, marginLeft, currentY);
    currentY += 6;
  } else {
    currentY += 6;
  }

  
  // Add spacing - if you need a specific amount of space, add pages as needed
  // Note: Simply incrementing currentY won't expand the PDF - you need to add content or pages
  const desiredSpace = 7; // Change this to the amount of space you want (in mm)
  
  // Check if we need a new page
  if (currentY + desiredSpace > pageHeight - marginBottom) {
    // Add a new page and position at the top
    doc.addPage([receiptWidth, receiptHeight]);
    currentY = marginTop + desiredSpace;
  } else {
    // Enough space on current page
    currentY += desiredSpace;
  }
  
  // Alternative: If you want to add a large amount of space (like 700mm),
  // you can add invisible content or multiple pages:
  // const largeSpace = 700;
  // while (currentY + 50 > pageHeight - marginBottom) {
  //   doc.addPage([receiptWidth, receiptHeight]);
  //   currentY = marginTop;
  // }
  // currentY += largeSpace % (pageHeight - marginTop - marginBottom);

  // Itemized List Header
  // Adjusted column widths for 79mm receipt (69mm content width)
  doc.setFontSize(8); // Reduced from 11
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255); // White text for header
  const colWidths = {
    no: 8, // Reduced from 12
    item: contentWidth - 8 - 12 - 20 - 20, // Remaining space: 69 - 8 - 12 - 20 - 20 = 9mm for item name
    qty: 12, // Reduced from 25
    price: 20, // Reduced from 25
    amount: 20, // Reduced from 30
  };
  let xPos = marginLeft;

  // Draw black background rectangle for header
  doc.setFillColor(0, 0, 0); // Black background for thermal printing visibility
  doc.rect(marginLeft, currentY - 4, contentWidth, 5, 'F');

  doc.text('NO', xPos, currentY);
  xPos += colWidths.no;
  doc.text('ITEM', xPos, currentY);
  xPos += colWidths.item;
  doc.text('QTY', xPos, currentY);
  xPos += colWidths.qty;
  doc.text('UNIT PRICE', xPos, currentY);
  xPos += colWidths.price;
  doc.text('AMOUNT', xPos, currentY);

  // Reset text color to black for body content
  doc.setTextColor(0, 0, 0);
  currentY += 5;

  // Divider line under header
  doc.setLineWidth(0.5);
  doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
  currentY += 4;

  // // Items
  doc.setFontSize(8); // Reduced from 9 for better fit
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0); // Black for thermal printing
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
      doc.setFontSize(7);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(0, 0, 0); // Black for thermal printing
      const productCode = `*${String(item.itemId).slice(-8)}`;
      doc.text(productCode, xPos, itemY);
      itemY += 4;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0); // Black for thermal printing
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
  // currentY += 2;
  // doc.setLineWidth(0.8);
  // doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
  // currentY += 4;

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
  const totalDiscount = itemDiscount + billDiscount;
  const grandTotal = payment.grandTotal || (subtotalAfterItemDiscount - billDiscount);
 doc.setLineWidth(0.8);
  doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
  currentY += 4;
  // Payment Method
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0); // Black for thermal printing
  const cashPaid = (payment as any).cashPaid || 0;
  const creditPaid = (payment as any).creditPaid || 0;
  const debitPaid = (payment as any).debitPaid || 0;

  let paymentMethod = 'Cash';
  if (cashPaid > 0 && creditPaid === 0 && debitPaid === 0) {
    paymentMethod = 'Cash';
  } else if (creditPaid > 0 || debitPaid > 0) {
    paymentMethod = 'Card';
  } else {
    paymentMethod = 'Cash';
  }

  doc.text('Payment Method:', marginLeft, currentY);
  doc.text(paymentMethod, pageWidth - marginRight, currentY, { align: 'right' });
  currentY += 6;

  // Sub Total
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text('Sub Total:', marginLeft, currentY);
  doc.text(itemSubtotal.toFixed(2), pageWidth - marginRight, currentY, { align: 'right' });
  currentY += 5;

  // Discount
  doc.text('Discount:', marginLeft, currentY);
  doc.text(totalDiscount.toFixed(2), pageWidth - marginRight, currentY, { align: 'right' });
  currentY += 5;

  // Grand Total (bolded)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Grand Total:', marginLeft, currentY);
  doc.text(grandTotal.toFixed(2), pageWidth - marginRight, currentY, { align: 'right' });
  currentY += 5;

  // Payment
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  const totalPaid = cashPaid + creditPaid + debitPaid;
  doc.text('Payment:', marginLeft, currentY);
  doc.text(totalPaid.toFixed(2), pageWidth - marginRight, currentY, { align: 'right' });
  currentY += 5;

  // Change
  const change = totalPaid - grandTotal;
  doc.text('Change:', marginLeft, currentY);
  doc.text(change.toFixed(2), pageWidth - marginRight, currentY, { align: 'right' });
  currentY += 6;

  // Divider line
  doc.setLineWidth(0.8);
  doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
  currentY += 6;

  // Footer - Thank you message
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  centerText('Thank you, Come again', currentY);
  currentY += 6;

  // Footer - POS Solution by Ollcode
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  centerText('POS Solution by Ollcode - 0777186809', currentY);
  currentY += marginBottom;

  return doc;
}