import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';
// @mui
import {
  Card,
  Table,
  Divider,
  TableBody,
  Container,
  TableContainer,
  Button,
  Stack,
  TextField,
  InputAdornment,
  TableRow,
  TableCell,
} from '@mui/material';
import { getPaymentData } from 'src/api/PaymentApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
import Iconify from '../../components/iconify';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'customerName', label: 'Customer Name', align: 'left' },
  { id: 'date', label: 'Date', align: 'left' },
  { id: 'grandTotal', label: 'Grand Total', align: 'left' },
  { id: 'cashPaid', label: 'Cash Paid', align: 'left' },
  { id: 'wirePaid', label: 'Wire Paid', align: 'left' },
  { id: 'paymentMethod', label: 'Payment Method', align: 'left' },
];

// ----------------------------------------------------------------------

export default function SalesReportPage() {
  const {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    onSort,
    onChangeDense,
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
  const { user } = useAuthContext();
  const [dataLoad, setDataLoad] = useState(false);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(order, orderBy),
    filterName,
    filterDateFrom,
    filterDateTo,
  });

  const denseHeight = dense ? 52 : 72;

  const isFiltered = filterName !== '' || filterDateFrom !== '' || filterDateTo !== '';

  const isNotFound = !dataFiltered.length && isFiltered;

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterDateFrom('');
    setFilterDateTo('');
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
      const data = await getPaymentData(companyID);
      setTableData(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error loading sales data:', error);
      setTableData([]);
    } finally {
      setDataLoad(false);
    }
  }, [user]);

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
      head: [['Customer Name', 'Date', 'Grand Total', 'Cash Paid', 'Wire Paid', 'Payment Method']],
      body: dataFiltered.map((payment) => {
        const paymentMethods: string[] = [];
        const cashPaidNum = Number(payment.cashPaid) || 0;
        const wirePaidNum = Number(payment.wirePaid) || 0;
        if (cashPaidNum > 0) {
          paymentMethods.push(`C:${cashPaidNum.toFixed(2)}`);
        }
        if (wirePaidNum > 0) {
          paymentMethods.push(`W:${wirePaidNum.toFixed(2)}`);
        }
        const paymentMethodStr = paymentMethods.length > 0 ? paymentMethods.join(', ') : 'N/A';

        // Truncate long customer names only
        const truncateText = (text: string, maxLength: number) => {
          if (text.length <= maxLength) return text;
          return text.substring(0, maxLength - 3) + '...';
        };

        return [
          truncateText(payment.customerName || 'N/A', 18),
          payment.date || 'N/A',
          payment.grandTotal ? Number(payment.grandTotal).toFixed(2) : '0.00',
          cashPaidNum > 0 ? cashPaidNum.toFixed(2) : '0.00',
          wirePaidNum > 0 ? wirePaidNum.toFixed(2) : '0.00',
          paymentMethodStr, // Don't truncate payment method - use shorter format instead
        ];
      }),
      theme: 'grid',
      headStyles: { fillColor: [255, 152, 0], fontSize: 9 },
      margin: { left: marginLeft, right: 20 },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 32 }, // Customer Name
        1: { cellWidth: 25 }, // Date
        2: { cellWidth: 22 }, // Grand Total
        3: { cellWidth: 20 }, // Cash Paid
        4: { cellWidth: 20 }, // Wire Paid
        5: { cellWidth: 31 }, // Payment Method (increased)
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
    const totalSales = dataFiltered.reduce((sum, p) => sum + (Number(p.grandTotal) || 0), 0);
    const totalCash = dataFiltered.reduce((sum, p) => sum + (Number(p.cashPaid) || 0), 0);
    const totalWire = dataFiltered.reduce((sum, p) => sum + (Number(p.wirePaid) || 0), 0);
    const totalTransactions = dataFiltered.length;

    doc.text(`Total Transactions: ${totalTransactions}`, marginLeft, currentY);
    currentY += 6;
    doc.text(`Total Sales: ${totalSales.toFixed(2)}`, marginLeft, currentY);
    currentY += 6;
    doc.text(`Total Cash Paid: ${totalCash.toFixed(2)}`, marginLeft, currentY);
    doc.text(`Total Wire Paid: ${totalWire.toFixed(2)}`, marginLeft + 80, currentY);

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
                  borderColor: '#FF9800',
                  color: '#FF9800',
                  '&:hover': { borderColor: '#F57C00', backgroundColor: '#fff3e0' },
                }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<Iconify icon="eva:download-fill" />}
                onClick={handleDownloadPDF}
                sx={{
                  backgroundColor: '#FF9800',
                  '&:hover': { backgroundColor: '#F57C00' },
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
                placeholder="Search by customer name..."
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
                <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
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
                        const paymentMethods: string[] = [];
                        const cashPaidNum = Number(row.cashPaid) || 0;
                        const wirePaidNum = Number(row.wirePaid) || 0;
                        if (cashPaidNum > 0) {
                          paymentMethods.push(`Cash: ${cashPaidNum.toFixed(2)}`);
                        }
                        if (wirePaidNum > 0) {
                          paymentMethods.push(`Wire: ${wirePaidNum.toFixed(2)}`);
                        }
                        const paymentMethodStr = paymentMethods.length > 0 ? paymentMethods.join(', ') : 'N/A';

                        return (
                          <TableRow hover key={row._id}>
                            <TableCell>{row.customerName || 'N/A'}</TableCell>
                            <TableCell>{row.date || 'N/A'}</TableCell>
                            <TableCell>{row.grandTotal ? Number(row.grandTotal).toFixed(2) : '0.00'}</TableCell>
                            <TableCell>{cashPaidNum > 0 ? cashPaidNum.toFixed(2) : '0.00'}</TableCell>
                            <TableCell>{wirePaidNum > 0 ? wirePaidNum.toFixed(2) : '0.00'}</TableCell>
                            <TableCell>{paymentMethodStr}</TableCell>
                          </TableRow>
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
              dense={dense}
              onChangeDense={onChangeDense}
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
}: {
  inputData: NewPaymentCreate[];
  comparator: (a: any, b: any) => number;
  filterName: string;
  filterDateFrom: string;
  filterDateTo: string;
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
        payment.customerName &&
        payment.customerName.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
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

  return filteredData;
}

