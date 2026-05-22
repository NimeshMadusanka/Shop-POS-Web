import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { getDashboardData } from 'src/api/Dashboard';
import {
  Grid,
  Container,
  Typography,
  Card,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Box,
  Collapse,
  IconButton,
  Autocomplete,
  TextField,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { getPaymentData } from 'src/api/PaymentApi';
import { getBrandData } from 'src/api/BrandApi';
import { getItemData } from 'src/api/ItemApi';

// components
import { useSettingsContext } from '../../components/settings';
import Loader from '../../components/loading-screen';
import { useAuthContext } from '../../auth/useAuthContext';
import { useOutlet } from '../../contexts/OutletContext';
// sections
import {
  AnalyticsWebsiteVisits,
  AnalyticsWidgetSummary,
  DailyItemActivityTable,
  DailyItemActivity,
} from '../../sections/@dashboard/general/analytics';

// ----------------------------------------------------------------------

export default function GeneralAnalyticsPage() {
  const { themeStretch } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const { outletId } = useOutlet();
  const [dataLoad, setDataLoad] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>({
    totalProducts: 0,
    totalSales: 0,
    totalTransactions: 0,
    lowStockItems: 0,
    lowStockItemsList: [],
    stockInToday: 0,
    stockOutToday: 0,
    dailyItemActivity: [] as DailyItemActivity[],
    userVisitChartData: {
      xAxis: {
        name: '',
        categories: [],
      },
      yAxis: {
        name: '',
      },
      jobPost: [],
    },
  });
  const [xAxisLabels, setXAxisLabels] = useState<string[]>([]);
  const [chartSeries, setChartSeries] = useState<any[]>([]);
  const [monthlySales, setMonthlySales] = useState(0);
  const [lowStockOpen, setLowStockOpen] = useState(true);
  const [brands, setBrands] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<any | null>(null);
  const [brandTotalProducts, setBrandTotalProducts] = useState<number | null>(null);
  const [brandTotalTransactions, setBrandTotalTransactions] = useState<number | null>(null);

  const loadDashboardData = useCallback(async () => {
    if (!user?.companyID) {
      console.error('Company ID is missing');
      return;
    }

    try {
      setDataLoad(true);
      const outletParam = outletId === 'combined' ? undefined : outletId;
      const data = await getDashboardData(user.companyID, outletParam);
      const payments = await getPaymentData(user.companyID, outletParam);
      const loadedBrands = await getBrandData(user.companyID);
      setDashboardData(data);
      setBrands(Array.isArray(loadedBrands) ? loadedBrands : []);
      const now = new Date();
      const monthlyTotal = (Array.isArray(payments) ? payments : [])
        .filter((payment: any) => {
          const parsedDate = new Date(payment.date || payment.createdAt);
          return (
            parsedDate.getMonth() === now.getMonth() &&
            parsedDate.getFullYear() === now.getFullYear() &&
            !payment.refunded
          );
        })
        .reduce((sum: number, payment: any) => sum + (Number(payment.grandTotal) || 0), 0);
      setMonthlySales(monthlyTotal);

      setXAxisLabels(data?.userVisitChartData?.xAxis?.categories || []);
      setChartSeries(
        data?.userVisitChartData?.jobPost?.map((job: any) => ({
          name: job.name,
          data: job.data,
        })) || []
      );

      setDataLoad(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      enqueueSnackbar('Something went wrong!', {
        variant: 'warning',
      });
      setDataLoad(false);
    }
  }, [enqueueSnackbar, outletId, user?.companyID]);

  const loadBrandScopedData = useCallback(async () => {
    if (!user?.companyID || !selectedBrand?._id) {
      setBrandTotalProducts(null);
      setBrandTotalTransactions(null);
      return;
    }
    try {
      const [items, payments] = await Promise.all([
        getItemData(user.companyID, selectedBrand._id),
        getPaymentData(user.companyID, outletId === 'combined' ? undefined : outletId),
      ]);

      const scopedPayments = (Array.isArray(payments) ? payments : []).filter((payment: any) =>
        (payment.items || []).some(
          (item: any) => (item.brandId?._id || item.brandId)?.toString() === selectedBrand._id.toString()
        )
      );

      const now = new Date();
      const brandMonthlySales = scopedPayments
        .filter((payment: any) => {
          const parsedDate = new Date(payment.date || payment.createdAt);
          return (
            parsedDate.getMonth() === now.getMonth() &&
            parsedDate.getFullYear() === now.getFullYear() &&
            !payment.refunded &&
            !payment.isReversal
          );
        })
        .reduce((sum: number, payment: any) => sum + (Number(payment.grandTotal) || 0), 0);

      setMonthlySales(brandMonthlySales);
      setBrandTotalProducts(Array.isArray(items) ? items.length : 0);
      setBrandTotalTransactions(scopedPayments.length);
    } catch (error) {
      console.error('Error loading brand-scoped analytics:', error);
      enqueueSnackbar('Error loading brand analytics', { variant: 'warning' });
    }
  }, [enqueueSnackbar, outletId, selectedBrand, user?.companyID]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    loadBrandScopedData();
  }, [loadBrandScopedData]);

  const displayedLowStockItems = selectedBrand?._id
    ? (dashboardData.lowStockItemsList || []).filter(
        (item: any) =>
          (item.brandId?._id || item.brandId)?.toString() === selectedBrand._id.toString() ||
          item.brandName === selectedBrand.brandName
      )
    : dashboardData.lowStockItemsList || [];

  return (
    <>
      <Helmet>
        <title> General: Analytics | POS system</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back {''}
        </Typography>
        <Grid container spacing={3} sx={{ mb: 1 }}>
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={brands}
              getOptionLabel={(option) => option?.brandName || ''}
              value={selectedBrand}
              onChange={(_, newValue) => setSelectedBrand(newValue)}
              renderInput={(params) => <TextField {...params} label="Filter by Brand (optional)" />}
            />
          </Grid>
        </Grid>

        {dataLoad ? (
          <Loader />
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title="Total Products"
                total={brandTotalProducts ?? (dashboardData.totalProducts || 0)}
                color="primary"
                icon=""
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title="Total Transactions"
                total={brandTotalTransactions ?? (dashboardData.totalTransactions || 0)}
                color="primary"
                icon=""
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title="Low Stock Items"
                total={displayedLowStockItems.length || 0}
                color="primary"
                icon=""
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title="Total Monthly Sales"
                total={`Rs. ${monthlySales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                color="primary"
                icon=""
              />
            </Grid>

            <Grid item xs={12} md={12} lg={12}>
              <AnalyticsWebsiteVisits
                title="Sales & Stock Activity (Last 7 Days)"
                chart={{
                  labels: xAxisLabels,
                  series: chartSeries,
                  xAxisLabel: 'Date',
                  yAxisLabel: 'Amount',
                  colors: ['#FF9800', '#4caf50', '#f44336'],
                }}
              />
            </Grid>

            <Grid item xs={12} md={12} lg={12}>
              <DailyItemActivityTable
                activities={dashboardData.dailyItemActivity || []}
                showOutlet={outletId === 'combined'}
              />
            </Grid>

            {displayedLowStockItems && displayedLowStockItems.length > 0 && (
              <Grid item xs={12} md={12} lg={12}>
                <Card>
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: 'error.main' }}>
                        ⚠️ Low Stock Alerts
                      </Typography>
                      <IconButton onClick={() => setLowStockOpen((prev) => !prev)}>
                        {lowStockOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      </IconButton>
                    </Box>
                    <Collapse in={lowStockOpen}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Item Name</TableCell>
                            <TableCell>Brand</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell align="right">Current Stock</TableCell>
                            <TableCell align="center">Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {displayedLowStockItems.map((item: any, index: number) => {
                            const stockLevel = item.stockQuantity || 0;
                            const statusColor =
                              stockLevel === 0 ? 'error' : stockLevel <= 10 ? 'warning' : 'info';
                            const statusText =
                              stockLevel === 0 ? 'Out of Stock' : stockLevel <= 10 ? 'Critical' : 'Low';

                            return (
                              <TableRow key={index} hover>
                                <TableCell>
                                  <Typography variant="subtitle2">{item.itemName || 'N/A'}</Typography>
                                </TableCell>
                                <TableCell>{item.brandName || 'N/A'}</TableCell>
                                <TableCell>{item.itemCategory || 'N/A'}</TableCell>
                                <TableCell align="right">
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 'bold',
                                      color:
                                        stockLevel === 0
                                          ? 'error.main'
                                          : stockLevel <= 10
                                            ? 'warning.main'
                                            : 'info.main',
                                    }}
                                  >
                                    {stockLevel}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Chip label={statusText} color={statusColor} size="small" variant="filled" />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </Collapse>
                  </Box>
                </Card>
              </Grid>
            )}
          </Grid>
        )}
      </Container>
    </>
  );
}
