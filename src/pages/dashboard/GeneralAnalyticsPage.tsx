import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { getDashboardData } from 'src/api/Dashboard';
import { Grid, Container, Typography, Card, Table, TableHead, TableBody, TableRow, TableCell, Chip, Box } from '@mui/material';
import { useSnackbar } from 'notistack';

// components
import { useSettingsContext } from '../../components/settings';
import Loader from '../../components/loading-screen';
import { useAuthContext } from '../../auth/useAuthContext';
// sections
import {
  AnalyticsWebsiteVisits,
  AnalyticsWidgetSummary,
} from '../../sections/@dashboard/general/analytics';

// ----------------------------------------------------------------------

export default function GeneralAnalyticsPage() {
  const { themeStretch } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const [dataLoad, setDataLoad] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>({
    totalProducts: 0,
    totalSales: 0,
    totalTransactions: 0,
    lowStockItems: 0,
    lowStockItemsList: [],
    stockInToday: 0,
    stockOutToday: 0,
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

  const loadDashboardData = useCallback(async () => {
    if (!user?.companyID) {
      console.error('Company ID is missing');
      return;
    }

    try {
      setDataLoad(true);
      const data = await getDashboardData(user.companyID);
      setDashboardData(data);

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
  }, [enqueueSnackbar, user?.companyID]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <>
      <Helmet>
        <title> General: Analytics | POS system</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back {''}
        </Typography>

        {dataLoad ? (
          <Loader />
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title="Total Products"
                total={dashboardData.totalProducts || 0}
                color="primary"
                icon=""
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title="Total Transactions"
                total={dashboardData.totalTransactions || 0}
                color="primary"
                icon=""
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title="Low Stock Items"
                total={dashboardData.lowStockItems || 0}
                color="primary"
                icon=""
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title="Total Sales"
                total={`Rs. ${(dashboardData.totalSales || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
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

            {dashboardData.lowStockItemsList && dashboardData.lowStockItemsList.length > 0 && (
              <Grid item xs={12} md={12} lg={12}>
                <Card>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'error.main' }}>
                      ⚠️ Low Stock Alerts
                    </Typography>
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
                        {dashboardData.lowStockItemsList.map((item: any, index: number) => {
                          const stockLevel = item.stockQuantity || 0;
                          const statusColor = stockLevel === 0 ? 'error' : stockLevel <= 10 ? 'warning' : 'info';
                          const statusText = stockLevel === 0 ? 'Out of Stock' : stockLevel <= 10 ? 'Critical' : 'Low';
                          
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
                                    color: stockLevel === 0 ? 'error.main' : stockLevel <= 10 ? 'warning.main' : 'info.main',
                                  }}
                                >
                                  {stockLevel}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={statusText}
                                  color={statusColor}
                                  size="small"
                                  variant="filled"
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
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
