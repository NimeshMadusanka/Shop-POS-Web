import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { getDashboardData } from 'src/api/Dashboard';
import { Grid, Container, Typography } from '@mui/material';
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
                sx={{ backgroundColor: '#6E9FC1', color: 'black' }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title="Total Transactions"
                total={dashboardData.totalTransactions || 0}
                color="info"
                icon=""
                sx={{ backgroundColor: '#A3CAE9' }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title="Low Stock Items"
                total={dashboardData.lowStockItems || 0}
                color="warning"
                icon=""
                sx={{ backgroundColor: '#E9ECEE' }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title="Total Sales"
                total={`Rs. ${(dashboardData.totalSales || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon=""
                sx={{ backgroundColor: '#ACACAC', color: '#333333' }}
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
                  colors: ['#0066CC', '#4caf50', '#f44336'],
                }}
              />
            </Grid>
          </Grid>
        )}
      </Container>
    </>
  );
}
