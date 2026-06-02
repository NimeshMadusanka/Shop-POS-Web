import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback, useMemo } from 'react';
// @mui
import {
  Card,
  Divider,
  Container,
  Button,
  Stack,
  Typography,
  Box,
} from '@mui/material';
import { getStockActivityData } from 'src/api/AnalyticsApi';
import { getBrandData } from 'src/api/BrandApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';
import { getComparator } from '../../components/table';
import Loader from '../../components/loading-screen';
import { useAuthContext } from 'src/auth/useAuthContext';
import Iconify from '../../components/iconify';
import { useOutlet } from 'src/contexts/OutletContext';
import { OUTLETS, OUTLET_META, OutletId } from 'src/config/outlets';
import AlignedGroupedTables from 'src/components/table/AlignedGroupedTables';
import { groupByOutletAndBrand } from 'src/utils/groupByOutletAndBrand';
// sections
import { AnalyticstableToolbar } from '../../sections/@dashboard/analytics/list';

// ----------------------------------------------------------------------

interface StockActivity {
  _id: string;
  itemId: string;
  itemName: string;
  amount: number;
  operationType: 'Stock-in' | 'Stock-out' | 'refunded-stock-in' | 'Returning-stock-out' | 'missing';
  operationDate: string;
  outletId?: string;
  brandName?: string | null;
  brandId?: string | null;
}

const ANALYTICS_COLUMNS = [
  {
    id: 'itemId',
    label: 'Item ID',
    width: '14%',
    render: (row: StockActivity) => String(row.itemId).slice(-8),
  },
  {
    id: 'itemName',
    label: 'Item Name',
    width: '26%',
    render: (row: StockActivity) => row.itemName,
  },
  {
    id: 'amount',
    label: 'Amount',
    width: '12%',
    align: 'right' as const,
    render: (row: StockActivity) => row.amount,
  },
  {
    id: 'operationType',
    label: 'Type',
    width: '18%',
    render: (row: StockActivity) => row.operationType,
  },
  {
    id: 'operationDate',
    label: 'Date and Time',
    width: '30%',
    render: (row: StockActivity) => new Date(row.operationDate).toLocaleString(),
  },
];

// ----------------------------------------------------------------------

export default function AnalyticsPage() {
  const { themeStretch } = useSettingsContext();
  const [tableData, setTableData] = useState<StockActivity[]>([]);
  const [brands, setBrands] = useState<{ _id: string; brandName: string }[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<{ _id: string; brandName: string } | null>(
    null
  );
  const [filterName, setFilterName] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterItem, setFilterItem] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const { user } = useAuthContext();
  const { outletId } = useOutlet();
  const [dataLoad, setDataLoad] = useState(false);

  const outletsToShow = useMemo<OutletId[]>(
    () => (outletId === 'combined' ? [...OUTLETS] : [outletId as OutletId]),
    [outletId]
  );

  const uniqueItems = Array.from(new Set(tableData.map((item) => item.itemName))).sort();

  const dataFiltered = useMemo(
    () =>
      applyFilter({
        inputData: tableData,
        comparator: getComparator('desc', 'operationDate'),
        filterName,
        filterType,
        filterItem,
        filterDateFrom,
        filterDateTo,
        brandId: selectedBrand?._id || null,
      }),
    [
      tableData,
      filterName,
      filterType,
      filterItem,
      filterDateFrom,
      filterDateTo,
      selectedBrand?._id,
    ]
  );

  const groupedSections = useMemo(
    () =>
      groupByOutletAndBrand<StockActivity>(dataFiltered, {
        outletsToShow,
        brandId: selectedBrand?._id || null,
      }),
    [dataFiltered, outletsToShow, selectedBrand?._id]
  );

  const isFiltered =
    filterName !== '' ||
    filterType !== 'all' ||
    filterItem !== 'all' ||
    filterDateFrom !== '' ||
    filterDateTo !== '' ||
    !!selectedBrand;

  const isNotFound = !dataFiltered.length && isFiltered;

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value);
  };

  const handleFilterType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterType(event.target.value);
  };

  const handleFilterItem = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterItem(event.target.value);
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterType('all');
    setFilterItem('all');
    setFilterDateFrom('');
    setFilterDateTo('');
    setSelectedBrand(null);
  };

  const loadData = useCallback(async () => {
    setDataLoad(true);
    const companyID = user?.companyID;
    try {
      const outletParam = outletId === 'combined' ? undefined : outletId;
      const [data, brandList] = await Promise.all([
        getStockActivityData(companyID, outletParam),
        companyID ? getBrandData(companyID) : Promise.resolve([]),
      ]);
      setTableData(data);
      setBrands(Array.isArray(brandList) ? brandList : []);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setDataLoad(false);
    }
  }, [outletId, user?.companyID]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Item Activity Analytics Report', marginLeft, currentY);
    currentY += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleString()}`, marginLeft, currentY);
    currentY += 6;

    if (outletId !== 'combined') {
      doc.text(`Outlet: ${OUTLET_META[outletsToShow[0]].label}`, marginLeft, currentY);
      currentY += 6;
    }

    if (isFiltered) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Applied Filters:', marginLeft, currentY);
      currentY += 5;
      doc.setFont('helvetica', 'normal');
      if (selectedBrand) {
        doc.text(`Brand: ${selectedBrand.brandName}`, marginLeft + 5, currentY);
        currentY += 5;
      }
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
      if (filterDateFrom) {
        doc.text(`Date from: ${filterDateFrom}`, marginLeft + 5, currentY);
        currentY += 5;
      }
      if (filterDateTo) {
        doc.text(`Date to: ${filterDateTo}`, marginLeft + 5, currentY);
        currentY += 5;
      }
      currentY += 3;
    }

    const truncateText = (text: string, maxLength: number) => {
      if (text.length <= maxLength) return text;
      return `${text.substring(0, maxLength - 3)}...`;
    };

    groupedSections.forEach((section) => {
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(section.outletLabel, marginLeft, currentY);
      currentY += 6;

      const body: any[] = [];
      section.brands.forEach((brand) => {
        body.push([
          {
            content: brand.brandName,
            colSpan: 5,
            styles: { fillColor: [232, 245, 233], fontStyle: 'bold', fontSize: 9 },
          },
        ]);
        brand.items.forEach((activity) => {
          body.push([
            String(activity.itemId).slice(-8),
            truncateText(activity.itemName, 28),
            String(activity.amount),
            activity.operationType,
            new Date(activity.operationDate).toLocaleString(),
          ]);
        });
      });

      autoTable(doc, {
        startY: currentY,
        head: [['Item ID', 'Item Name', 'Amount', 'Type', 'Date and Time']],
        body,
        theme: 'grid',
        headStyles: { fillColor: [0, 102, 204], fontSize: 9 },
        margin: { left: marginLeft, right: 20 },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 22 },
          1: { cellWidth: 42 },
          2: { cellWidth: 18 },
          3: { cellWidth: 28 },
          4: { cellWidth: 50 },
        },
      });
      currentY = (doc as any).lastAutoTable?.finalY + 10 || currentY + 50;
    });

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

    currentY = (doc as any).lastAutoTable?.finalY + 10 || currentY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', marginLeft, currentY);
    currentY += 6;

    autoTable(doc, {
      startY: currentY,
      head: [['Metric', 'Value', 'Metric', 'Value']],
      body: [
        ['Total Stock-in Operations', stockInCount, 'Total Stock-out Operations', stockOutCount],
        ['Total Stock-in Amount', totalStockIn, 'Total Stock-out Amount', totalStockOut],
        ['Total Missing Operations', missingCount, 'Total Missing Amount', totalMissing],
      ],
      theme: 'grid',
      headStyles: { fillColor: [18, 80, 26] },
      styles: { fontSize: 9, cellPadding: 2 },
      margin: { left: marginLeft, right: marginLeft },
    });

    let filename = `item_activity_analytics_${new Date().toISOString().split('T')[0]}`;
    if (isFiltered) filename += '_filtered';
    if (selectedBrand) filename += `_${selectedBrand.brandName.replace(/\s+/g, '_')}`;
    if (outletId !== 'combined') filename += `_${outletId}`;
    filename += '.pdf';

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
                disabled={!dataFiltered.length}
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
              optionsType={[
                'all',
                'Stock-in',
                'Stock-out',
                'refunded-stock-in',
                'Returning-stock-out',
                'missing',
              ]}
              optionsItem={['all', ...uniqueItems]}
              brands={brands}
              selectedBrand={selectedBrand}
              onBrandChange={setSelectedBrand}
              onFilterName={handleFilterName}
              onFilterType={handleFilterType}
              onFilterItem={handleFilterItem}
              onFilterDateFrom={(e) => setFilterDateFrom(e.target.value)}
              onFilterDateTo={(e) => setFilterDateTo(e.target.value)}
              onResetFilter={handleResetFilter}
            />

            <Box sx={{ px: 2, pb: 3 }}>
              {isNotFound ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No records match your filters.
                </Typography>
              ) : (
                <AlignedGroupedTables
                  sections={groupedSections}
                  columns={ANALYTICS_COLUMNS}
                  emptyMessage="No stock activity records found."
                  brandHeaderColor="primary.main"
                />
              )}
              {!isNotFound && dataFiltered.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Showing {dataFiltered.length} record{dataFiltered.length === 1 ? '' : 's'}
                  {selectedBrand ? ` for ${selectedBrand.brandName}` : ''}.
                </Typography>
              )}
            </Box>
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
  brandId,
}: {
  inputData: StockActivity[];
  comparator: (a: any, b: any) => number;
  filterName: string;
  filterType: string;
  filterItem: string;
  filterDateFrom: string;
  filterDateTo: string;
  brandId: string | null;
}) {
  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  let filteredData = stabilizedThis.map((el) => el[0]);

  if (brandId) {
    filteredData = filteredData.filter(
      (activity) => activity.brandId && String(activity.brandId) === String(brandId)
    );
  }

  if (filterType !== 'all') {
    filteredData = filteredData.filter((activity) => activity.operationType === filterType);
  }

  if (filterItem !== 'all') {
    filteredData = filteredData.filter((activity) => activity.itemName === filterItem);
  }

  if (filterName) {
    filteredData = filteredData.filter(
      (activity) =>
        activity?.itemName?.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

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
