import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';
import { Fragment } from 'react';
// @mui
import {
  Card,
  Table,
  Divider,
  TableHead,
  TableBody,
  Container,
  TableContainer,
  Button,
  Stack,
  TextField,
  InputAdornment,
  TableRow,
  TableCell,
  Typography,
  Collapse,
  IconButton,
  Box,
  Autocomplete,
  Chip,
} from '@mui/material';
import { getPaymentData } from 'src/api/PaymentApi';
import { getBrandData } from 'src/api/BrandApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// @types
import { NewPaymentCreate } from '../../@types/user';
// components
import Scrollbar from '../../components/scrollbar';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from '../../components/table';
import Loader from '../../components/loading-screen';
import { useAuthContext } from 'src/auth/useAuthContext';
import { useOutlet } from 'src/contexts/OutletContext';
import Iconify from '../../components/iconify';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'expand', label: '', align: 'left' },
  { id: 'invoiceNumber', label: 'Invoice No', align: 'left' },
  { id: 'date', label: 'Date', align: 'left' },
  { id: 'grandTotal', label: 'Grand Total', align: 'left' },
  { id: 'cashPaid', label: 'Cash Paid', align: 'left' },
  { id: 'cardPaid', label: 'Card Paid', align: 'left' },
  { id: 'wirePaid', label: 'Wire Paid', align: 'left' },
  { id: 'paymentMethod', label: 'Payment Method', align: 'left' },
  { id: 'refundStatus', label: 'Refund Status', align: 'left' },
  { id: 'specialNote', label: 'Special Note', align: 'left' },
  { id: 'refundedBy', label: 'Refunded By', align: 'left' },
];

// ----------------------------------------------------------------------

export default function SalesReportPage() {
  const {
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    onSort,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable({
    defaultOrderBy: 'date',
    defaultOrder: 'desc',
  });

  const { themeStretch } = useSettingsContext();
  const [tableData, setTableData] = useState<NewPaymentCreate[]>([]);
  const [filterName, setFilterName] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [brands, setBrands] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<any | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const { user } = useAuthContext();
  const { outletId } = useOutlet();
  const [dataLoad, setDataLoad] = useState(false);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(order, orderBy),
    filterName,
    filterDateFrom,
    filterDateTo,
    selectedBrand,
  });

  const denseHeight = 72;

  const isFiltered =
    filterName !== '' || filterDateFrom !== '' || filterDateTo !== '' || !!selectedBrand;

  const isNotFound = !dataFiltered.length && isFiltered;

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setSelectedBrand(null);
  };

  const loadData = useCallback(async () => {
    if (!user?.companyID) {
      console.error('Company ID is missing', user);
      setTableData([]);
      setDataLoad(false);
      return;
    }

    try {
      setDataLoad(true);
      const companyID = user.companyID;
      const data = await getPaymentData(
        companyID,
        outletId === 'combined' ? undefined : outletId
      );
      const brandData = await getBrandData(companyID);
      setTableData(Array.isArray(data) ? data : []);
      setBrands(Array.isArray(brandData) ? brandData : []);
    } catch (error: any) {
      console.error('Error loading sales data:', error);
      setTableData([]);
    } finally {
      setDataLoad(false);
    }
  }, [outletId, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const marginLeft = 20;
    let currentY = 20;

    // Header - Logo
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 152, 0); // Primary orange color
    doc.text('POS', 10, 20);
    doc.setFontSize(12);
    doc.setTextColor(255, 193, 7); // Secondary gold color
    doc.text('SHOP', 10, 28);

    // Sales Report Title (right side)
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const pageWidth = doc.internal.pageSize.width;
    const titleWidth = doc.getTextWidth('Sales Report');
    doc.text('Sales Report', pageWidth - titleWidth - marginLeft, currentY);

    // Date range info (below logo)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const reportDate = new Date().toLocaleDateString();
    doc.text(`Generated on: ${reportDate}`, marginLeft, currentY + 12);
    currentY += 20;

    if (isFiltered) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      let filterText = 'Filters: ';
      const filters: string[] = [];
      if (filterName) filters.push(`Customer: ${filterName}`);
      if (filterDateFrom) filters.push(`From: ${filterDateFrom}`);
      if (filterDateTo) filters.push(`To: ${filterDateTo}`);
      filterText += filters.join(', ');
      doc.text(filterText, marginLeft, currentY);
      currentY += 6;
    }

    // Payment Method Legend
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Method Key:', marginLeft, currentY);
    currentY += 5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('C: Cash', marginLeft, currentY);
    doc.text('W: Wire Transfer', marginLeft + 30, currentY);
    currentY += 8;

    // Table
    autoTable(doc, {
      startY: currentY,
      head: [['Invoice No', 'Date', 'Grand Total', 'Cash Paid', 'Card Paid', 'Wire Paid', 'Payment Method', 'Refund Status', 'Special Note']],
      body: dataFiltered.map((payment) => {
        const paymentMethods: string[] = [];
        const isRefunded = payment.refunded === true;
        const cashPaidNum = Number(payment.cashPaid) || 0;
        const wirePaidNum = Number(payment.wirePaid) || 0;
        const cardPaidNum =
          (Number(payment.creditPaid) || 0) + (Number(payment.debitPaid) || 0) || Number(payment.cardPaid) || 0;
        
        // Show payment method if amount is not zero (handles both positive and negative for refunds)
        if (cashPaidNum !== 0) {
          const displayAmount = isRefunded ? -cashPaidNum : cashPaidNum;
          paymentMethods.push(`C:${displayAmount.toFixed(2)}`);
        }
        if (wirePaidNum !== 0) {
          const displayAmount = isRefunded ? -wirePaidNum : wirePaidNum;
          paymentMethods.push(`W:${displayAmount.toFixed(2)}`);
        }
        if (cardPaidNum !== 0) {
          const displayAmount = isRefunded ? -cardPaidNum : cardPaidNum;
          paymentMethods.push(`Card:${displayAmount.toFixed(2)}`);
        }
        const paymentMethodStr = paymentMethods.length > 0 ? paymentMethods.join(', ') : 'N/A';
        const specialNote = getSpecialNote(payment);
        const refundStatus = getRefundStatus(payment);

        const grandTotalValue = isRefunded 
          ? -(Number(payment.grandTotal) || 0) 
          : (Number(payment.grandTotal) || 0);
        const cashPaidDisplay = isRefunded 
          ? -(cashPaidNum || 0) 
          : (cashPaidNum || 0);
        const wirePaidDisplay = isRefunded 
          ? -(wirePaidNum || 0) 
          : (wirePaidNum || 0);
        const cardPaidDisplay = isRefunded ? -(cardPaidNum || 0) : cardPaidNum || 0;
        const invoiceNumberDisplay = isRefunded 
          ? `${(payment as any).invoiceNumber || 'N/A'} (REFUNDED)`
          : ((payment as any).invoiceNumber || 'N/A');

        return [
          invoiceNumberDisplay,
          payment.date || 'N/A',
          grandTotalValue.toFixed(2),
          cashPaidDisplay !== 0 ? cashPaidDisplay.toFixed(2) : '0.00',
          cardPaidDisplay !== 0 ? cardPaidDisplay.toFixed(2) : '0.00',
          wirePaidDisplay !== 0 ? wirePaidDisplay.toFixed(2) : '0.00',
          paymentMethodStr,
          refundStatus.label,
          specialNote,
        ];
      }),
      theme: 'grid',
      headStyles: { fillColor: [255, 152, 0], fontSize: 9 },
      margin: { left: marginLeft, right: 20 },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 24 },
        1: { cellWidth: 18 },
        2: { cellWidth: 17 },
        3: { cellWidth: 14 },
        4: { cellWidth: 14 },
        5: { cellWidth: 14 },
        6: { cellWidth: 24 },
        7: { cellWidth: 22 },
        8: { cellWidth: 30 },
      },
    });

    // Summary
    const finalY = (doc as any).lastAutoTable?.finalY || currentY + 50;
    currentY = finalY + 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', marginLeft, currentY);
    currentY += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const totalSales = dataFiltered.reduce((sum, p) => {
      const isRefunded = p.refunded === true;
      const amount = Number(p.grandTotal) || 0;
      return sum + (isRefunded ? -amount : amount);
    }, 0);
    const totalCash = dataFiltered.reduce((sum, p) => {
      const isRefunded = p.refunded === true;
      const amount = Number(p.cashPaid) || 0;
      return sum + (isRefunded ? -amount : amount);
    }, 0);
    const totalWire = dataFiltered.reduce((sum, p) => {
      const isRefunded = p.refunded === true;
      const amount = Number(p.wirePaid) || 0;
      return sum + (isRefunded ? -amount : amount);
    }, 0);
    const totalTransactions = dataFiltered.length;
    const refundedCount = dataFiltered.filter((p) => p.refunded === true).length;

    doc.text(`Total Transactions: ${totalTransactions}`, marginLeft, currentY);
    currentY += 6;
    if (refundedCount > 0) {
      doc.text(`Refunded Transactions: ${refundedCount}`, marginLeft, currentY);
      currentY += 6;
    }
    doc.text(`Total Sales (Net): ${totalSales.toFixed(2)}`, marginLeft, currentY);
    currentY += 6;
    doc.text(`Total Cash Paid (Net): ${totalCash.toFixed(2)}`, marginLeft, currentY);
    doc.text(`Total Wire Paid (Net): ${totalWire.toFixed(2)}`, marginLeft + 80, currentY);

    // Generate filename
    let filename = `sales_report_${new Date().toISOString().split('T')[0]}`;
    if (isFiltered) {
      filename += '_filtered';
      if (filterDateFrom) filename += `_from_${filterDateFrom}`;
      if (filterDateTo) filename += `_to_${filterDateTo}`;
      if (filterName) filename += `_${filterName.replace(/\s+/g, '_')}`;
    }
    filename += '.pdf';

    // Save PDF
    doc.save(filename);
  };

  const toggleRow = (paymentId: string) => {
    setExpandedRows((prev) => ({ ...prev, [paymentId]: !prev[paymentId] }));
  };

  const getPaymentMethodDisplay = (row: any) => {
    const paymentMethods: string[] = [];
    const isRefunded = row.refunded === true;
    const cashPaidNum = Number(row.cashPaid) || 0;
    const wirePaidNum = Number(row.wirePaid) || 0;
    const cardPaidNum =
      (Number(row.creditPaid) || 0) + (Number(row.debitPaid) || 0) || Number(row.cardPaid) || 0;

    if (cashPaidNum !== 0) paymentMethods.push(`Cash: ${(isRefunded ? -cashPaidNum : cashPaidNum).toFixed(2)}`);
    if (wirePaidNum !== 0) paymentMethods.push(`Wire: ${(isRefunded ? -wirePaidNum : wirePaidNum).toFixed(2)}`);
    if (cardPaidNum !== 0) paymentMethods.push(`Card: ${(isRefunded ? -cardPaidNum : cardPaidNum).toFixed(2)}`);
    return paymentMethods.length > 0 ? paymentMethods.join(', ') : 'N/A';
  };

  return (
    <>
      <Helmet>
        <title> Sales Report | Stock Management System </title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Sales Report"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Sales', href: PATH_DASHBOARD.analytics.root },
            { name: 'Sales Report' },
          ]}
          action={
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="eva:refresh-fill" />}
                onClick={loadData}
                disabled={dataLoad}
                sx={{
                  borderColor: '#8ed973',
                  color: '#8ed973',
                  '&:hover': { borderColor: '#12501a', backgroundColor: '#daf2d0' },
                }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<Iconify icon="eva:download-fill" />}
                onClick={handleDownloadPDF}
                sx={{
                  backgroundColor: '#6B8E5A',
                  '&:hover': { backgroundColor: '#4A5D3F' },
                }}
              >
                Export PDF
              </Button>
            </Stack>
          }
        />

        {dataLoad ? (
          <Loader />
        ) : (
          <Card>
            <Divider />

            {/* Filters */}
            <Stack
              spacing={2}
              alignItems="center"
              direction={{
                xs: 'column',
                md: 'row',
              }}
              sx={{ px: 2.5, py: 3 }}
            >
              <TextField
                fullWidth
                value={filterName}
                onChange={handleFilterName}
                placeholder="Search by invoice number..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                type="date"
                label="Date From"
                value={filterDateFrom}
                onChange={(e) => {
                  setPage(0);
                  setFilterDateFrom(e.target.value);
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  maxWidth: { md: 160 },
                }}
              />

              <Autocomplete
                fullWidth
                options={brands}
                getOptionLabel={(option) => option?.brandName || ''}
                value={selectedBrand}
                onChange={(_, newValue) => {
                  setPage(0);
                  setSelectedBrand(newValue);
                }}
                renderInput={(params) => <TextField {...params} label="Filter by brand" />}
                sx={{ maxWidth: { md: 220 } }}
              />

              <TextField
                fullWidth
                type="date"
                label="Date To"
                value={filterDateTo}
                onChange={(e) => {
                  setPage(0);
                  setFilterDateTo(e.target.value);
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  maxWidth: { md: 160 },
                }}
              />

              {isFiltered && (
                <Button
                  color="error"
                  sx={{ flexShrink: 0 }}
                  onClick={handleResetFilter}
                  startIcon={<Iconify icon="eva:trash-2-outline" />}
                >
                  Clear
                </Button>
              )}
            </Stack>

            <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
              <Scrollbar>
                <Table size="medium" sx={{ minWidth: 800 }}>
                  <TableHeadCustom
                    order={order}
                    orderBy={orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={tableData.length}
                    onSort={onSort}
                  />

                  <TableBody>
                    {dataFiltered
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row) => {
                        const isRefunded = row.refunded === true;
                        const cashPaidNum = Number(row.cashPaid) || 0;
                        const wirePaidNum = Number(row.wirePaid) || 0;
                        const cardPaidNum =
                          (Number(row.creditPaid) || 0) + (Number(row.debitPaid) || 0) || Number(row.cardPaid) || 0;

                        const grandTotalValue = isRefunded 
                          ? -(Number(row.grandTotal) || 0) 
                          : (Number(row.grandTotal) || 0);
                        const cashPaidDisplay = isRefunded 
                          ? -(cashPaidNum || 0) 
                          : (cashPaidNum || 0);
                        const wirePaidDisplay = isRefunded 
                          ? -(wirePaidNum || 0) 
                          : (wirePaidNum || 0);
                        const cardPaidDisplay = isRefunded ? -(cardPaidNum || 0) : cardPaidNum || 0;
                        const paymentMethodStr = getPaymentMethodDisplay(row);
                        const rowNote = getSpecialNote(row);
                        const refundStatus = getRefundStatus(row);
                        const rowKey = row._id || row.invoiceNumber || Math.random().toString(36);

                        return (
                          <Fragment key={rowKey}>
                            <TableRow
                              hover
                              key={rowKey}
                              sx={{
                                backgroundColor: isRefunded ? 'rgba(255, 0, 0, 0.05)' : 'inherit',
                              }}
                            >
                              <TableCell>
                                <IconButton size="small" onClick={() => toggleRow(rowKey)}>
                                  {expandedRows[rowKey] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                </IconButton>
                              </TableCell>
                              <TableCell>
                                {(row as any).invoiceNumber || 'N/A'}
                                {isRefunded && (
                                  <span style={{ color: 'red', marginLeft: '8px', fontWeight: 'bold' }}>
                                    (REFUNDED)
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>{row.date || 'N/A'}</TableCell>
                              <TableCell sx={{ color: isRefunded ? 'error.main' : 'inherit' }}>
                                {grandTotalValue.toFixed(2)}
                              </TableCell>
                              <TableCell sx={{ color: isRefunded ? 'error.main' : 'inherit' }}>
                                {cashPaidDisplay !== 0 ? cashPaidDisplay.toFixed(2) : '0.00'}
                              </TableCell>
                              <TableCell sx={{ color: isRefunded ? 'error.main' : 'inherit' }}>
                                {cardPaidDisplay !== 0 ? cardPaidDisplay.toFixed(2) : '0.00'}
                              </TableCell>
                              <TableCell sx={{ color: isRefunded ? 'error.main' : 'inherit' }}>
                                {wirePaidDisplay !== 0 ? wirePaidDisplay.toFixed(2) : '0.00'}
                              </TableCell>
                              <TableCell>{paymentMethodStr}</TableCell>
                              <TableCell>
                                <Chip size="small" color={refundStatus.color as any} label={refundStatus.label} />
                              </TableCell>
                              <TableCell>{rowNote}</TableCell>
                              <TableCell>
                                {isRefunded && row.refundedBy ? (
                                  <Typography variant="body2">
                                    {row.refundedBy.firstName || row.refundedBy.lastName
                                      ? `${row.refundedBy.firstName || ''} ${row.refundedBy.lastName || ''}`.trim()
                                      : 'N/A'}
                                  </Typography>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    -
                                  </Typography>
                                )}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={TABLE_HEAD.length}>
                                <Collapse in={!!expandedRows[rowKey]} timeout="auto" unmountOnExit>
                                  <Box sx={{ m: 1 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                      Sold Items
                                    </Typography>
                                    <Table size="small">
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>Item</TableCell>
                                          <TableCell>Brand</TableCell>
                                          <TableCell>Qty</TableCell>
                                          <TableCell>Unit Price</TableCell>
                                          <TableCell>Discount %</TableCell>
                                          <TableCell>Total</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {(row.items || []).map((item: any, index: number) => {
                                          const qty = Number(item.quantity) || 0;
                                          const unit = Number(item.itemPrice) || 0;
                                          const discountPct = Number(item.offPercentage) || 0;
                                          const subtotal = qty * unit;
                                          const total = subtotal - (subtotal * discountPct) / 100;
                                          return (
                                            <TableRow key={`${rowKey}-item-${index}`}>
                                              <TableCell>{item.itemName || 'N/A'}</TableCell>
                                              <TableCell>{item.brandName || 'N/A'}</TableCell>
                                              <TableCell>{qty}</TableCell>
                                              <TableCell>{unit.toFixed(2)}</TableCell>
                                              <TableCell>{discountPct.toFixed(2)}</TableCell>
                                              <TableCell>{total.toFixed(2)}</TableCell>
                                            </TableRow>
                                          );
                                        })}
                                      </TableBody>
                                    </Table>
                                  </Box>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          </Fragment>
                        );
                      })}

                    <TableEmptyRows
                      height={denseHeight}
                      emptyRows={emptyRows(page, rowsPerPage, tableData.length)}
                    />

                    <TableNoData isNotFound={isNotFound} />
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>

            <TablePaginationCustom
              count={dataFiltered.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={onChangePage}
              onRowsPerPageChange={onChangeRowsPerPage}
            />
          </Card>
        )}
      </Container>
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filterName,
  filterDateFrom,
  filterDateTo,
  selectedBrand,
}: {
  inputData: NewPaymentCreate[];
  comparator: (a: any, b: any) => number;
  filterName: string;
  filterDateFrom: string;
  filterDateTo: string;
  selectedBrand: any;
}) {
  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  let filteredData = stabilizedThis.map((el) => el[0]);

  // Filter by customer name
  if (filterName) {
    filteredData = filteredData.filter(
      (payment) =>
        payment &&
        (payment as any).invoiceNumber &&
        (payment as any).invoiceNumber.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  // Filter by date range
  if (filterDateFrom) {
    const fromDate = new Date(filterDateFrom);
    fromDate.setHours(0, 0, 0, 0);
    filteredData = filteredData.filter((payment) => {
      if (!payment.date) return false;
      const paymentDate = new Date(payment.date);
      paymentDate.setHours(0, 0, 0, 0);
      return paymentDate >= fromDate;
    });
  }

  if (filterDateTo) {
    const toDate = new Date(filterDateTo);
    toDate.setHours(23, 59, 59, 999);
    filteredData = filteredData.filter((payment) => {
      if (!payment.date) return false;
      const paymentDate = new Date(payment.date);
      return paymentDate <= toDate;
    });
  }

  if (selectedBrand?._id) {
    filteredData = filteredData.filter((payment) =>
      (payment.items || []).some(
        (item: any) => (item.brandId?._id || item.brandId)?.toString() === selectedBrand._id.toString()
      )
    );
  }

  return filteredData;
}

function getSpecialNote(payment: any) {
  if (payment.specialNote) return payment.specialNote;
  if (payment.refunded) {
    if (payment.refundedBy?.firstName || payment.refundedBy?.lastName) {
      return `Refunded by ${(payment.refundedBy.firstName || '').trim()} ${(payment.refundedBy.lastName || '').trim()}`.trim();
    }
    return `Reversal of ${payment.invoiceNumber || 'invoice'}`;
  }
  if ((Number(payment.wirePaid) || 0) > 0) {
    return 'Wire transfer';
  }
  return '-';
}

function getRefundStatus(payment: any) {
  if (payment?.isReversal) {
    return { label: 'Partially Refunded', color: 'warning' };
  }

  const refundedItems = Array.isArray(payment?.refundedItems) ? payment.refundedItems : [];
  if (payment?.refunded) {
    return { label: 'Fully Refunded', color: 'error' };
  }
  if (refundedItems.length > 0) {
    return { label: 'Partially Refunded', color: 'warning' };
  }

  return { label: 'Not Refunded', color: 'success' };
}

