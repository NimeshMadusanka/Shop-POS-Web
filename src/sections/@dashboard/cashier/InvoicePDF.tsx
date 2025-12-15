import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NewPaymentCreate } from '../../../@types/user';

export function generateInvoicePDF(payment: NewPaymentCreate) {
  // 70mm x 95mm thermal receipt
  const doc = new jsPDF({
    unit: 'mm',
    format: [70, 95],
  });
  const marginLeft = 6;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - marginLeft * 2;
  let currentY = 8;

  // Invoice Number (prominently displayed)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(18, 80, 26); // Primary dark green
  const invoiceNumber = (payment as any).invoiceNumber || 'N/A';
  doc.text(`Invoice #: ${invoiceNumber}`, marginLeft, currentY);
  currentY += 6;

  // Company Info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('YIVA ESSENTIALS', marginLeft, currentY);
  currentY += 4;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('BR Reg No: WCO/02152', marginLeft, currentY);
  currentY += 4;
  doc.text('NO:14/R, Araliya Uyana, COLOMBO - 05', marginLeft, currentY);
  currentY += 4;
  doc.text('Phone: 0112335828 / 0112441503', marginLeft, currentY);
  currentY += 6;

  // Date
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', marginLeft, currentY);
  doc.setFont('helvetica', 'normal');
  const formattedDate = payment.date
    ? new Date(payment.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString();
  doc.text(formattedDate, marginLeft + 12, currentY);
  currentY += 6;

  // Divider
  doc.line(marginLeft, currentY, marginLeft + contentWidth, currentY);
  currentY += 4;

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
    headStyles: { fillColor: [18, 80, 26] }, // Primary dark green
    margin: { left: marginLeft, right: marginLeft },
    styles: { fontSize: 7, cellPadding: 1 },
    columnStyles: {
      0: { cellWidth: 26 }, // Product
      1: { cellWidth: 8 },  // Qty
      2: { cellWidth: 10 }, // Price
      3: { cellWidth: 10 }, // Discount
      4: { cellWidth: 12 }, // Total
    },
    didDrawPage: (data) => {
      currentY = (data.cursor?.y ?? currentY) + 6;
    },
  });

  // Payment Summary
  currentY += 3;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Summary:', marginLeft, currentY);
  currentY += 5;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const totalItems = payment.items?.length || 0;
  const discount = payment.discount || 0;
  const grandTotal = payment.grandTotal || 0;
  const billDiscount = payment.billDiscountAmount || 0;

  doc.text(`Total Items: ${totalItems}`, marginLeft, currentY);
  currentY += 4;
  doc.text(`Item Discount: ${discount.toFixed(2)}`, marginLeft, currentY);
  currentY += 4;
  if (billDiscount > 0) {
    doc.text(`Bill Discount: ${billDiscount.toFixed(2)}`, marginLeft, currentY);
    currentY += 4;
  }
  doc.text(`Grand Total: ${grandTotal.toFixed(2)}`, marginLeft, currentY);
  currentY += 6;

  // Payment Methods
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Method:', marginLeft, currentY);
  currentY += 5;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const paymentMethods: string[] = [];
  const cashPaid = (payment as any).cashPaid || 0;
  const creditPaid = (payment as any).creditPaid || 0;
  const debitPaid = (payment as any).debitPaid || 0;

  if (cashPaid > 0) paymentMethods.push(`Cash: ${cashPaid.toFixed(2)}`);
  if (creditPaid > 0) paymentMethods.push(`Credit Card: ${creditPaid.toFixed(2)}`);
  if (debitPaid > 0) paymentMethods.push(`Debit Card: ${debitPaid.toFixed(2)}`);

  if (paymentMethods.length > 0) {
    doc.text(paymentMethods.join(', '), marginLeft, currentY);
  } else {
    doc.text('N/A', marginLeft, currentY);
  }

  // Footer
  currentY = doc.internal.pageSize.height - 10;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(128, 128, 128);
  doc.text('Thank you for your business!', marginLeft, currentY);

  // Save PDF
  doc.save(`invoice_${invoiceNumber}.pdf`);
}

