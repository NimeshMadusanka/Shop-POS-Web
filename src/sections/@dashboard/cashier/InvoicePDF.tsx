
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NewPaymentCreate } from '../../../@types/user';

export function generateInvoicePDF(payment: NewPaymentCreate) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  // Narrow margins for thermal receipt look
  const marginLeft = 15;
  const marginRight = 15;
  const contentWidth = pageWidth - marginLeft - marginRight;
  let currentY = 15;

  // Invoice Number (prominently displayed in black, bold)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0); // Black
  const invoiceNumber = (payment as any).invoiceNumber || 'N/A';
  doc.text(`Invoice #: ${invoiceNumber}`, marginLeft, currentY);
  currentY += 7;

  // Company Info
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0); // Black for thermal printing
  doc.text('YIVA ESSENTIALS', marginLeft, currentY);
  currentY += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0); // Black for thermal printing
  doc.text('BR Reg No: WCO/02152', marginLeft, currentY);
  currentY += 5;
  doc.text('NO:14/R, Araliya Uyana, COLOMBO - 05', marginLeft, currentY);
  currentY += 5;
  doc.text('Phone: 0112335828 / 0112441503', marginLeft, currentY);
  currentY += 6;

  // Date and Time (compact format: DD/MM/YYYY HH:MM:SS)
  const paymentDate = payment.date ? new Date(payment.date) : new Date();
  const dateStr = paymentDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeStr = paymentDate.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0); // Black for thermal printing
  doc.text(`${dateStr} ${timeStr}`, marginLeft, currentY);
  currentY += 6;

  // Divider
  doc.setLineWidth(0.3);
  doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
  currentY += 6;

  // Product Table
  autoTable(doc, {
    startY: currentY,
    head: [['Product', 'Qty', 'Price', 'Disc%', 'Total']],
    body: (payment.items || []).map((item: any) => [
      item?.itemName || 'N/A',
      item?.quantity || 0,
      item?.itemPrice ? Number(item.itemPrice).toFixed(2) : '0.00',
      item?.offPercentage ? `${item.offPercentage}%` : '0%',
      item?.quantity && item?.itemPrice
        ? (Number(item.quantity) * Number(item.itemPrice) * (1 - (item.offPercentage || 0) / 100)).toFixed(2)
        : '0.00',
    ]),
    theme: 'grid',
    headStyles: { 
      fillColor: [0, 0, 0], // Black background for thermal printing visibility
      textColor: [255, 255, 255], // White text on black background
      fontStyle: 'bold',
      fontSize: 9
    },
    margin: { left: marginLeft, right: marginRight },
    styles: { 
      fontSize: 9,
      cellPadding: 2,
      textColor: [0, 0, 0], // Black text for table body
      fillColor: [255, 255, 255], // White background for table body
    },
    columnStyles: {
      0: { halign: 'left' }, // Product - left aligned
      1: { halign: 'right' }, // Qty - right aligned
      2: { halign: 'right' }, // Price - right aligned
      3: { halign: 'right' }, // Disc% - right aligned
      4: { halign: 'right' }, // Total - right aligned
    },
    didDrawPage: (data) => {
      currentY = (data.cursor?.y ?? currentY) + 5;
    },
  });

  // Divider
  currentY += 3;
  doc.setLineWidth(0.3);
  doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
  currentY += 6;

  // Payment Summary (compact format - label left, value right on same line)
  const grandTotal = payment.grandTotal || 0;
  const cashPaid = (payment as any).cashPaid || 0;
  const creditPaid = (payment as any).creditPaid || 0;
  const debitPaid = (payment as any).debitPaid || 0;
  const totalPaid = cashPaid + creditPaid + debitPaid;
  const balance = totalPaid - grandTotal;

  // Determine payment method
  let paymentMethod = 'CASH';
  if (creditPaid > 0 || debitPaid > 0) {
    if (cashPaid > 0) {
      paymentMethod = 'SPLIT';
    } else {
      paymentMethod = 'CARD';
    }
  }

  // Net Total (bold label, bold value)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0); // Black for thermal printing
  doc.text('Net Total:', marginLeft, currentY);
  doc.text(grandTotal.toFixed(2), pageWidth - marginRight, currentY, { align: 'right' });
  currentY += 6;

  // Payment Method
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0); // Black for thermal printing
  doc.text('Payment Method:', marginLeft, currentY);
  doc.text(paymentMethod, pageWidth - marginRight, currentY, { align: 'right' });
  currentY += 6;

  // Balance
  doc.setTextColor(0, 0, 0); // Black for thermal printing
  doc.text('Balance:', marginLeft, currentY);
  doc.text(balance.toFixed(2), pageWidth - marginRight, currentY, { align: 'right' });
  currentY += 10;

  // Important Notice (centered)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0); // Black for thermal printing
  const noticeTitle = '-IMPORTANT NOTICE-';
  const noticeTitleWidth = doc.getTextWidth(noticeTitle);
  doc.text(noticeTitle, (pageWidth - noticeTitleWidth) / 2, currentY);
  currentY += 6;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0); // Black for thermal printing
  const noticeText = 'In case of a price discrepancy, return the item & bill within 7 days to refund the difference';
  const noticeLines = doc.splitTextToSize(noticeText, contentWidth);
  noticeLines.forEach((line: string) => {
    const lineWidth = doc.getTextWidth(line);
    doc.text(line, (pageWidth - lineWidth) / 2, currentY);
    currentY += 4;
  });

  // Save PDF
  doc.save(`invoice_${invoiceNumber}.pdf`);
}