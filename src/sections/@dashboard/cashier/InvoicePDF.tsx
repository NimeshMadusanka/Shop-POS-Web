import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NewPaymentCreate } from '../../../@types/user';

export function generateInvoicePDF(payment: NewPaymentCreate) {
  const doc = new jsPDF();
  const marginLeft = 20;
  let currentY = 20;

  // Invoice Number (prominently displayed)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(18, 80, 26); // Primary dark green
  const invoiceNumber = (payment as any).invoiceNumber || 'N/A';
  doc.text(`Invoice #: ${invoiceNumber}`, marginLeft, currentY);
  currentY += 10;

  // Company Info
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('YIVA ESSENTIALS', marginLeft, currentY);
  currentY += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('BR Reg No: WCO/02152', marginLeft, currentY);
  currentY += 6;
  doc.text('NO:14/R, Araliya Uyana, COLOMBO - 05', marginLeft, currentY);
  currentY += 6;
  doc.text('Phone: 0112335828 / 0112441503', marginLeft, currentY);
  currentY += 10;

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
  doc.text(formattedDate, marginLeft + 20, currentY);
  currentY += 10;

  // Divider
  doc.line(10, currentY, 200, currentY);
  currentY += 10;

  // Product Table
  autoTable(doc, {
    startY: currentY,
    head: [['Product Name', 'Qty', 'Unit Price', 'Discount %', 'Total']],
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
    margin: { left: marginLeft },
    styles: { fontSize: 10 },
    didDrawPage: (data) => {
      currentY = (data.cursor?.y ?? currentY) + 10;
    },
  });

  // Payment Summary
  currentY += 5;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Summary:', marginLeft, currentY);
  currentY += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const totalItems = payment.items?.length || 0;
  const discount = payment.discount || 0;
  const grandTotal = payment.grandTotal || 0;
  const billDiscount = payment.billDiscountAmount || 0;

  doc.text(`Total Items: ${totalItems}`, marginLeft, currentY);
  currentY += 6;
  doc.text(`Item Discount: ${discount.toFixed(2)}`, marginLeft, currentY);
  currentY += 6;
  if (billDiscount > 0) {
    doc.text(`Bill Discount: ${billDiscount.toFixed(2)}`, marginLeft, currentY);
    currentY += 6;
  }
  doc.text(`Grand Total: ${grandTotal.toFixed(2)}`, marginLeft, currentY);
  currentY += 10;

  // Payment Methods
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Method:', marginLeft, currentY);
  currentY += 8;

  doc.setFontSize(10);
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
  currentY = doc.internal.pageSize.height - 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(128, 128, 128);
  doc.text('Thank you for your business!', marginLeft, currentY);

  // Save PDF
  doc.save(`invoice_${invoiceNumber}.pdf`);
}

