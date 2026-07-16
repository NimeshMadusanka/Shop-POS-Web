import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment, { Moment } from 'moment';
import { ReportData } from 'src/api/EmailReportApi';
import { getLowStockStatus } from 'src/utils/groupLowStockByBrand';
import { groupLowStockByOutletAndBrand } from 'src/utils/groupLowStockByOutletAndBrand';
import { OUTLETS, OutletId } from 'src/config/outlets';
import { DISCOUNT_LEGEND } from 'src/utils/discountCalc';

export type ReportFilter = 'all' | 'provider-shop' | 'shop-client';

export type PaymentMethodTotals = {
  cash: number;
  card: number;
  wire: number;
  net: number;
};

type GeneratePdfOptions = {
  reportData: ReportData;
  reportFilter: ReportFilter;
  isBrandFiltered: boolean;
  paymentMethodTotals: PaymentMethodTotals;
};

const truncateText = (text: string, maxLength: number) => {
  if (!text) return 'N/A';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3)}...`;
};

export async function generateDailyReportPdf({
  reportData,
  reportFilter,
  isBrandFiltered,
  paymentMethodTotals,
}: GeneratePdfOptions): Promise<{ doc: jsPDF; filename: string }> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 20;
  const headerReserve = 20;
  const footerReserve = 22;
  let currentY = headerReserve;
  const pageBottom = () => pageHeight - footerReserve;
  const ensureSpace = (needed: number) => {
    if (currentY + needed > pageBottom()) {
      doc.addPage();
      currentY = headerReserve;
    }
  };

  try {
    const logoUrl = '/ESSENTIALS.png';
    const logoPromise = new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const imgData = canvas.toDataURL('image/png');
            const maxWidth = 50;
            const aspectRatio = img.width / img.height;
            const logoWidth = maxWidth;
            const logoHeight = maxWidth / aspectRatio;
            const logoX = (pageWidth - logoWidth) / 2;
            doc.addImage(imgData, 'PNG', logoX, currentY, logoWidth, logoHeight);
            currentY += logoHeight + 10;
          }
          resolve();
        } catch {
          resolve();
        }
      };
      img.onerror = () => resolve();
      img.src = logoUrl;
    });
    await Promise.race([logoPromise, new Promise<void>((r) => setTimeout(r, 2000))]);
  } catch {
    // continue without logo
  }

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Stock Report', pageWidth / 2, currentY, { align: 'center' });
  currentY += 10;

  if (reportData.brandName) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Brand: ${reportData.brandName}`, marginLeft, currentY);
    currentY += 8;
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleString()}`, marginLeft, currentY);
  currentY += 6;

  if (reportData.dateFrom || reportData.dateTo) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Period:', marginLeft, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `${reportData.dateFrom || 'Start'} - ${reportData.dateTo || 'End'}`,
      marginLeft + 20,
      currentY
    );
    currentY += 6;
  }

  const showProviderShop = reportFilter === 'all' || reportFilter === 'provider-shop';
  const showShopClient = reportFilter === 'all' || reportFilter === 'shop-client';

  if (showProviderShop) {
    if (reportData.providerShopTransactions.length > 0) {
      ensureSpace(40);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Stock Management', marginLeft, currentY);
      currentY += 8;
      ensureSpace(30);
      autoTable(doc, {
        startY: currentY,
        head: [['Date', 'Provider', 'Item Name', 'Brand', 'Amount', 'Type']],
        body: reportData.providerShopTransactions.map((t) => [
          new Date(t.operationDate).toLocaleDateString(),
          t.providerName || 'N/A',
          t.itemName || 'N/A',
          t.brandName || 'N/A',
          String(t.amount || 0),
          truncateText(t.operationType || 'N/A', 15),
        ]),
        theme: 'grid',
        headStyles: { fillColor: [0, 102, 204], fontSize: 9 },
        margin: { top: headerReserve, bottom: footerReserve, left: marginLeft, right: 20 },
        styles: { fontSize: 7, cellPadding: 1.5 },
      });
      currentY = (doc as any).lastAutoTable?.finalY || currentY + 50;
      currentY += 10;
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('No stock management transactions found.', marginLeft, currentY);
      currentY += 10;
    }
  }

  if (showProviderShop && showShopClient && reportData.providerShopTransactions.length > 0) {
    doc.addPage();
    currentY = headerReserve;
  }

  if (showShopClient) {
    ensureSpace(40);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Sales', marginLeft, currentY);
    currentY += 8;

    if (reportData.shopClientTransactions.length > 0) {
      ensureSpace(30);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(DISCOUNT_LEGEND, marginLeft, currentY);
      currentY += 6;
      ensureSpace(30);
      autoTable(doc, {
        startY: currentY,
        head: [['Date', 'Invoice', 'Item Name', 'Brand', 'Qty', 'Total', 'Type', 'Discount']],
        body: reportData.shopClientTransactions.map((t) => {
          const discountLabel =
            t.discountLabel ||
            (Number(t.discountAmount || 0) > 0 ? `cd-${Number(t.discountAmount).toFixed(0)}` : '');
          return [
            new Date(t.date).toLocaleDateString(),
            truncateText(t.invoiceNumber || 'N/A', 18),
            t.itemName || 'N/A',
            t.brandName || 'N/A',
            String(t.quantity || 0),
            `LKR ${Number(t.total || 0).toFixed(2)}`,
            truncateText(t.operationType || 'N/A', 10),
            discountLabel || '-',
          ];
        }),
        theme: 'grid',
        headStyles: { fillColor: [0, 102, 204], fontSize: 9 },
        margin: { top: headerReserve, bottom: footerReserve, left: marginLeft, right: 10 },
        styles: { fontSize: 7, cellPadding: 1.5 },
      });
      currentY = (doc as any).lastAutoTable?.finalY || currentY + 50;
      currentY += 10;

      const sold = reportData.shopClientTransactions.filter((t) => t.operationType === 'Sold');
      const refunded = reportData.shopClientTransactions.filter((t) => t.operationType === 'Refunded');
      const totalSoldAmount = sold.reduce((sum, t) => sum + (t.total || 0), 0);
      const totalRefundedAmount = refunded.reduce((sum, t) => sum + (t.total || 0), 0);
      const totalDiscountAmount = sold.reduce((sum, t) => sum + Number(t.discountAmount || 0), 0);
      const grossBeforeDiscount = totalSoldAmount + totalDiscountAmount;
      const netSale = totalSoldAmount - totalRefundedAmount;

      ensureSpace(70);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', marginLeft, currentY);
      currentY += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Sold: ${sold.length} line(s)`, marginLeft, currentY);
      currentY += 6;
      doc.text(
        `Total Products Sold: ${sold.reduce((s, t) => s + (t.quantity || 0), 0)} items`,
        marginLeft,
        currentY
      );
      currentY += 6;
      doc.text(
        `Total Refunded: ${refunded.length} line(s) (LKR ${totalRefundedAmount.toFixed(2)})`,
        marginLeft,
        currentY
      );
      currentY += 6;
      doc.text(`Gross Sale (before refunds): LKR ${grossBeforeDiscount.toFixed(2)}`, marginLeft, currentY);
      currentY += 6;
      doc.text(`Total Discount applied: LKR ${totalDiscountAmount.toFixed(2)}`, marginLeft, currentY);
      currentY += 6;
      doc.text(
        `Sale After Discount (before refunds): LKR ${totalSoldAmount.toFixed(2)}`,
        marginLeft,
        currentY
      );
      currentY += 6;
      doc.setFont('helvetica', 'bold');
      doc.text(`Net Sale (sold − refunded): LKR ${netSale.toFixed(2)}`, marginLeft, currentY);
      doc.setFont('helvetica', 'normal');
      currentY += 10;

      if (reportData.revenueShare) {
        const rs = reportData.revenueShare;
        ensureSpace(isBrandFiltered ? 55 : 80);
        if (currentY > 220) {
          doc.addPage();
          currentY = headerReserve;
        }
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Revenue Share', marginLeft, currentY);
        currentY += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        if (isBrandFiltered && reportData.brandName) {
          doc.text(`Brand: ${reportData.brandName}`, marginLeft, currentY);
          currentY += 6;
          doc.text(
            `Shop Commission: ${Number(rs.commissionPercent || 0).toFixed(2)}%`,
            marginLeft,
            currentY
          );
          currentY += 6;
        }
        doc.text(`Net Total: LKR ${Number(rs.netTotal || 0).toFixed(2)}`, marginLeft, currentY);
        currentY += 6;
        doc.text(`Shop Share: LKR ${Number(rs.shopShare || 0).toFixed(2)}`, marginLeft, currentY);
        currentY += 6;
        doc.text(
          `${isBrandFiltered ? 'Brand Share' : 'Brands Share'}: LKR ${Number(rs.brandShare || 0).toFixed(2)}`,
          marginLeft,
          currentY
        );
        currentY += 8;
        if (!isBrandFiltered && rs.perBrand?.length) {
          autoTable(doc, {
            startY: currentY,
            head: [['Brand', 'Shop Comm %', 'Net Total', 'Shop Share', 'Brand Share']],
            body: rs.perBrand.map((row) => [
              row.brandName,
              `${Number(row.commissionPercent || 0).toFixed(2)}%`,
              `LKR ${Number(row.netTotal || 0).toFixed(2)}`,
              `LKR ${Number(row.shopShare || 0).toFixed(2)}`,
              `LKR ${Number(row.brandShare || 0).toFixed(2)}`,
            ]),
            theme: 'grid',
            headStyles: { fillColor: [18, 80, 26], fontSize: 9 },
            margin: { top: headerReserve, bottom: footerReserve, left: marginLeft, right: 20 },
            styles: { fontSize: 8, cellPadding: 2 },
          });
          currentY = (doc as any).lastAutoTable?.finalY || currentY + 40;
          currentY += 10;
        }
      }
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('No sales transactions found.', marginLeft, currentY);
      currentY += 10;
    }
  }

  if (reportData.statistics) {
    const lastTableY = (doc as any).lastAutoTable?.finalY;
    if (lastTableY && lastTableY + 35 > currentY) currentY = lastTableY + 35;
    else currentY += 15;
    ensureSpace(50);
    if (currentY > 230) {
      doc.addPage();
      currentY = headerReserve;
    }
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Statistics', marginLeft, currentY);
    currentY += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Products Stock In: ${reportData.statistics.totalStockIn || 0}`, marginLeft, currentY);
    currentY += 7;
    doc.text(`Total Products Sold: ${reportData.statistics.totalSold || 0}`, marginLeft, currentY);
    currentY += 7;
    doc.text(`Total Products Returned: ${reportData.statistics.totalReturned || 0}`, marginLeft, currentY);
    currentY += 7;
    if (reportData.statistics.totalMissing !== undefined) {
      doc.setTextColor(156, 39, 176);
      doc.text(`Total Missing Stock Items: ${reportData.statistics.totalMissing || 0}`, marginLeft, currentY);
      currentY += 7;
      doc.text(
        `Total Missing Stock Amount: ${reportData.statistics.totalMissingAmount || 0}`,
        marginLeft,
        currentY
      );
      doc.setTextColor(0, 0, 0);
    }
  }

  if (reportData.lowStockItems?.length) {
    ensureSpace(50);
    if (currentY > 200) {
      doc.addPage();
      currentY = headerReserve;
    } else currentY += 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(211, 47, 47);
    doc.text('Low Stock Alerts', marginLeft, currentY);
    doc.setTextColor(0, 0, 0);
    currentY += 8;
    const lowStockOutlets: OutletId[] =
      reportData.scope === 'combined' ? [...OUTLETS] : [(reportData.scope as OutletId) || 'AHANGAMA'];

    groupLowStockByOutletAndBrand(reportData.lowStockItems, lowStockOutlets).forEach(
      (section) => {
        ensureSpace(30);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(section.outletLabel, marginLeft, currentY);
        currentY += 6;

        const lowStockBody: any[] = [];
        section.brands.forEach(({ brandName, items }) => {
          lowStockBody.push([
            {
              content: brandName,
              colSpan: 4,
              styles: { fillColor: [255, 235, 238], fontStyle: 'bold', fontSize: 9 },
            },
          ]);
          items.forEach((item) => {
            const stockLevel = item.stockQuantity || 0;
            lowStockBody.push([
              truncateText(item.itemName || 'N/A', 30),
              truncateText(item.itemCategory || 'N/A', 18),
              String(stockLevel),
              getLowStockStatus(stockLevel),
            ]);
          });
        });

        autoTable(doc, {
          startY: currentY,
          head: [['Item Name', 'Category', 'Current Stock', 'Status']],
          body: lowStockBody,
          theme: 'grid',
          headStyles: { fillColor: [211, 47, 47], fontSize: 9 },
          margin: { top: headerReserve, bottom: footerReserve, left: marginLeft, right: 20 },
          styles: { fontSize: 7, cellPadding: 1.5 },
          columnStyles: {
            0: { cellWidth: 55 },
            1: { cellWidth: 40 },
            2: { cellWidth: 28 },
            3: { cellWidth: 32 },
          },
        });
        currentY = (doc as any).lastAutoTable?.finalY + 8 || currentY + 50;
      }
    );
    currentY += 4;
  }

  if (reportData.missingStockItems?.length) {
    ensureSpace(50);
    if (currentY > 200) {
      doc.addPage();
      currentY = headerReserve;
    } else currentY += 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(156, 39, 176);
    doc.text('Missing Stock Alerts', marginLeft, currentY);
    doc.setTextColor(0, 0, 0);
    currentY += 8;
    autoTable(doc, {
      startY: currentY,
      head: [['Item Name', 'Brand', 'Category', 'Missing Amount', 'Date']],
      body: reportData.missingStockItems.map((item) => [
        truncateText(item.itemName || 'N/A', 25),
        truncateText(item.brandName || '-', 15),
        truncateText(item.itemCategory || 'N/A', 15),
        String(item.missingAmount || 0),
        new Date(item.operationDate).toLocaleDateString(),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [156, 39, 176], fontSize: 9 },
      margin: { top: headerReserve, bottom: footerReserve, left: marginLeft, right: 20 },
      styles: { fontSize: 7, cellPadding: 1.5 },
    });
    currentY = (doc as any).lastAutoTable?.finalY || currentY + 50;
    currentY += 10;
  }

  ensureSpace(45);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Method Totals', marginLeft, currentY);
  currentY += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Cash: LKR ${paymentMethodTotals.cash.toFixed(2)}`, marginLeft, currentY);
  currentY += 6;
  doc.text(`Total Card: LKR ${paymentMethodTotals.card.toFixed(2)}`, marginLeft, currentY);
  currentY += 6;
  doc.text(`Total Wire: LKR ${paymentMethodTotals.wire.toFixed(2)}`, marginLeft, currentY);
  currentY += 6;
  doc.text(`Total Net: LKR ${paymentMethodTotals.net.toFixed(2)}`, marginLeft, currentY);

  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('YIVA Essentials', marginLeft, footerY);
    doc.text('Designed and Developed by Ollcode', pageWidth - marginLeft, footerY, { align: 'right' });
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, footerY, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  }

  let filename = `daily_report_${new Date().toISOString().split('T')[0]}`;
  if (reportFilter !== 'all') filename += `_${reportFilter}`;
  if (reportData.brandName) filename += `_${reportData.brandName.replace(/\s+/g, '_')}`;
  if (reportData.dateFrom || reportData.dateTo) {
    filename += '_filtered';
    if (reportData.dateFrom) filename += `_from_${reportData.dateFrom}`;
    if (reportData.dateTo) filename += `_to_${reportData.dateTo}`;
  }
  filename += '.pdf';

  return { doc, filename };
}

export function computePaymentMethodTotals(
  payments: any[],
  dateFrom: Moment | null,
  dateTo: Moment | null,
  selectedBrand: { _id: string } | null
): PaymentMethodTotals {
  const fromStr = dateFrom ? dateFrom.format('YYYY-MM-DD') : null;
  const toStr = dateTo ? dateTo.format('YYYY-MM-DD') : null;

  const inRange = (ymd: string | null) =>
    Boolean(ymd && (!fromStr || ymd >= fromStr) && (!toStr || ymd <= toStr));

  const isReversal = (payment: any) => {
    const invoice = String(payment.invoiceNumber || '');
    return (
      Boolean(payment.isReversal || payment.reversalOf) ||
      /^REV-/i.test(invoice) ||
      Number(payment.grandTotal) < 0
    );
  };

  const matchesBrand = (payment: any) =>
    !selectedBrand?._id ||
    (payment.items || []).some(
      (item: any) =>
        (item.brandId?._id || item.brandId)?.toString() === selectedBrand._id.toString()
    );

  const addSigned = (
    acc: PaymentMethodTotals,
    payment: any,
    sign: number
  ): PaymentMethodTotals => {
    const cash = Number(payment.cashPaid) || 0;
    const wire = Number(payment.wirePaid) || 0;
    const card =
      (Number(payment.creditPaid) || 0) + (Number(payment.debitPaid) || 0) ||
      Number(payment.cardPaid) ||
      0;
    const net = Number(payment.grandTotal) || 0;
    return {
      cash: acc.cash + sign * cash,
      card: acc.card + sign * card,
      wire: acc.wire + sign * wire,
      net: acc.net + sign * net,
    };
  };

  return (Array.isArray(payments) ? payments : []).reduce(
    (acc, payment: any) => {
      if (!matchesBrand(payment)) return acc;

      const createdDay = payment.createdAt
        ? moment(payment.createdAt).format('YYYY-MM-DD')
        : null;
      const refundDay = payment.refundedAt
        ? moment(payment.refundedAt).format('YYYY-MM-DD')
        : null;
      const saleIn = inRange(createdDay);
      const refundIn = Boolean(payment.refunded) && inRange(refundDay);

      if (isReversal(payment)) {
        // Amounts already stored negative on reversal docs
        return saleIn ? addSigned(acc, payment, 1) : acc;
      }

      let next = acc;
      if (saleIn) next = addSigned(next, payment, 1);
      // Full refunds store positive amounts on the original — flip on refund day
      if (refundIn) next = addSigned(next, payment, -1);
      return next;
    },
    { cash: 0, card: 0, wire: 0, net: 0 }
  );
}
