import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';
// @mui
import { Card, Table, Divider, TableBody, Container, TableContainer, Button, Stack } from '@mui/material';
import { getStockActivityData } from 'src/api/AnalyticsApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
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
// sections
import { AnalyticsTableRow, AnalyticstableToolbar } from '../../sections/@dashboard/analytics/list';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'itemId', label: 'Item ID', align: 'left' },
  { id: 'itemName', label: 'Item Name', align: 'left' },
  { id: 'amount', label: 'Amount', align: 'left' },
  { id: 'operationType', label: 'Type', align: 'left' },
  { id: 'operationDate', label: 'Date and Time', align: 'left' },
];

// ----------------------------------------------------------------------

interface StockActivity {
  _id: string;
  itemId: string;
  itemName: string;
  amount: number;
  operationType: 'Stock-in' | 'Stock-out' | 'refunded-stock-in' | 'Returning-stock-out' | 'missing';
  operationDate: string;
}

export default function AnalyticsPage() {
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
    defaultOrderBy: 'operationDate',
    defaultOrder: 'desc',
  });

  const { themeStretch } = useSettingsContext();
  const [tableData, setTableData] = useState<StockActivity[]>([]);
  const [filterName, setFilterName] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterItem, setFilterItem] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const { user } = useAuthContext();
  const [dataLoad, setDataLoad] = useState(false);

  // Get unique items for filter dropdown
  const uniqueItems = Array.from(new Set(tableData.map((item) => item.itemName))).sort();

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(order, orderBy),
    filterName,
    filterType,
    filterItem,
    filterDateFrom,
    filterDateTo,
  });

  const denseHeight = 72;

  const isFiltered = filterName !== '' || filterType !== 'all' || filterItem !== 'all' || filterDateFrom !== '' || filterDateTo !== '';

  const isNotFound = !dataFiltered.length && isFiltered;

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleFilterType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterType(event.target.value);
  };

  const handleFilterItem = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterItem(event.target.value);
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterType('all');
    setFilterItem('all');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const loadData = useCallback(async () => {
    setDataLoad(true);
    const companyID = user?.companyID;
    try {
      const data = await getStockActivityData(companyID);
      setTableData(data);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setDataLoad(false);
    }
  }, [user?.companyID]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh data when page becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.companyID) {
        loadData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadData, user?.companyID]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const marginLeft = 20;
    let currentY = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Item Activity Analytics Report', marginLeft, currentY);
    currentY += 10;

    // Report Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleString()}`, marginLeft, currentY);
    currentY += 6;

    // Show applied filters if any
    if (isFiltered) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Applied Filters:', marginLeft, currentY);
      currentY += 5;
      doc.setFont('helvetica', 'normal');
      if (filterType !== 'all') {
        doc.text(`Operation Type: ${filterType}`, marginLeft + 5, currentY);
        currentY += 5;
      }
      if (filterItem !== 'all') {
        doc.text(`Item: ${filterItem}`, marginLeft + 5, currentY);
        currentY += 5;
      }
      if (filterName) {
        doc.text(`Search: ${filterName}`, marginLeft + 5, currentY);
        currentY += 5;
      }
      currentY += 3;
    } else {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('Showing all records', marginLeft, currentY);
      currentY += 6;
    }

    // Table
    // Calculate available width: A4 width (210mm) - left margin (20mm) - right margin (20mm) = 170mm
    // Truncate long item names to prevent overflow
    const truncateText = (text: string, maxLength: number) => {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength - 3) + '...';
    };

    autoTable(doc, {
      startY: currentY,
      head: [['Item ID', 'Item Name', 'Amount', 'Type', 'Date and Time']],
      body: dataFiltered.map((activity) => [
        String(activity.itemId).slice(-8),
        truncateText(activity.itemName, 25),
        String(activity.amount),
        activity.operationType,
        new Date(activity.operationDate).toLocaleString(),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [0, 102, 204], fontSize: 9 },
      margin: { left: marginLeft, right: 20 },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 25 },  // Item ID
        1: { cellWidth: 45 },  // Item Name
        2: { cellWidth: 20 },  // Amount
        3: { cellWidth: 25 },  // Type
        4: { cellWidth: 55 },  // Date and Time
      },
    });

    // Summary
    const stockInCount = dataFiltered.filter((a) => a.operationType === 'Stock-in').length;
    const stockOutCount = dataFiltered.filter((a) => a.operationType === 'Stock-out').length;
    const missingCount = dataFiltered.filter((a) => a.operationType === 'missing').length;
    const totalStockIn = dataFiltered
      .filter((a) => a.operationType === 'Stock-in')
      .reduce((sum, a) => sum + a.amount, 0);
    const totalStockOut = dataFiltered
      .filter((a) => a.operationType === 'Stock-out')
      .reduce((sum, a) => sum + a.amount, 0);
    const totalMissing = dataFiltered
      .filter((a) => a.operationType === 'missing')
      .reduce((sum, a) => sum + a.amount, 0);

    const finalY = (doc as any).lastAutoTable?.finalY || currentY + 50;
    currentY = finalY + 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', marginLeft, currentY);
    currentY += 6;

    const summaryRows = [
      ['Total Stock-in Operations', stockInCount, 'Total Stock-out Operations', stockOutCount],
      ['Total Stock-in Amount', totalStockIn, 'Total Stock-out Amount', totalStockOut],
      ['Total Missing Operations', missingCount, 'Total Missing Amount', totalMissing],
    ];

    autoTable(doc, {
      startY: currentY,
      head: [['Metric', 'Value', 'Metric', 'Value']],
      body: summaryRows,
      theme: 'grid',
      headStyles: { fillColor: [18, 80, 26] },
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 20, halign: 'right' },
        2: { cellWidth: 50 },
        3: { cellWidth: 20, halign: 'right' },
      },
      margin: { left: marginLeft, right: marginLeft },
    });

    // Generate filename based on filters
    let filename = `item_activity_analytics_${new Date().toISOString().split('T')[0]}`;
    if (isFiltered) {
      filename += '_filtered';
      if (filterType !== 'all') filename += `_${filterType.replace(/-/g, '_')}`;
      if (filterItem !== 'all') filename += `_${filterItem.replace(/\s+/g, '_')}`;
      if (filterDateFrom) filename += `_from_${filterDateFrom}`;
      if (filterDateTo) filename += `_to_${filterDateTo}`;
    }
    filename += '.pdf';

    // Save PDF
    doc.save(filename);
  };

  return (
    <>
      <Helmet>
        <title> Analytics: Item Activity | Stock Management System </title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Item Activity Analytics"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Analytics' },
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
                Download PDF
              </Button>
            </Stack>
          }
        />

        {dataLoad ? (
          <Loader />
        ) : (
          <Card>
            <Divider />

            <AnalyticstableToolbar
              isFiltered={isFiltered}
              filterName={filterName}
              filterType={filterType}
              filterItem={filterItem}
              filterDateFrom={filterDateFrom}
              filterDateTo={filterDateTo}
              optionsType={['all', 'Stock-in', 'Stock-out', 'refunded-stock-in', 'Returning-stock-out', 'missing']}
              optionsItem={['all', ...uniqueItems]}
              onFilterName={handleFilterName}
              onFilterType={handleFilterType}
              onFilterItem={handleFilterItem}
              onFilterDateFrom={(e) => {
                setPage(0);
                setFilterDateFrom(e.target.value);
              }}
              onFilterDateTo={(e) => {
                setPage(0);
                setFilterDateTo(e.target.value);
              }}
              onResetFilter={handleResetFilter}
            />

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
                      .map((row) => (
                        <AnalyticsTableRow
                          key={row._id}
                          row={row}
                        />
                      ))}

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
  filterType,
  filterItem,
  filterDateFrom,
  filterDateTo,
}: {
  inputData: StockActivity[];
  comparator: (a: any, b: any) => number;
  filterName: string;
  filterType: string;
  filterItem: string;
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

  // Filter by operation type
  if (filterType !== 'all') {
    filteredData = filteredData.filter((activity) => activity.operationType === filterType);
  }

  // Filter by item name
  if (filterItem !== 'all') {
    filteredData = filteredData.filter((activity) => activity.itemName === filterItem);
  }

  // Filter by search name
  if (filterName) {
    filteredData = filteredData.filter(
      (activity) =>
        activity &&
        activity.itemName &&
        activity.itemName.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  // Filter by date range
  if (filterDateFrom) {
    const fromDate = new Date(filterDateFrom);
    fromDate.setHours(0, 0, 0, 0);
    filteredData = filteredData.filter((activity) => {
      const activityDate = new Date(activity.operationDate);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate >= fromDate;
    });
  }

  if (filterDateTo) {
    const toDate = new Date(filterDateTo);
    toDate.setHours(23, 59, 59, 999);
    filteredData = filteredData.filter((activity) => {
      const activityDate = new Date(activity.operationDate);
      return activityDate <= toDate;
    });
  }

  return filteredData;
}

