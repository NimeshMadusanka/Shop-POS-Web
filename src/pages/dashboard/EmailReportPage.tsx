import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import {
  Container,
  Card,
  Box,
  Typography,
  Stack,
  TextField,
  Grid,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment, { Moment } from 'moment';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { PATH_DASHBOARD } from '../../routes/paths';
import { useSettingsContext } from '../../components/settings';
import { useSnackbar } from '../../components/snackbar';
import { useAuthContext } from '../../auth/useAuthContext';
import {
  sendDailyReportApi,
  getReportDataApi,
  ReportData,
  GetPDFReportParams,
} from '../../api/EmailReportApi';
import { getBrandData } from '../../api/BrandApi';
import { getPaymentData } from '../../api/PaymentApi';
import Iconify from '../../components/iconify';
import { Autocomplete } from '@mui/material';
import { useOutlet } from '../../contexts/OutletContext';
import { DailyReportPreviewDialog } from '../../sections/@dashboard/emailReport';
import {
  computePaymentMethodTotals,
  generateDailyReportPdf,
  PaymentMethodTotals,
} from '../../utils/dailyReportPdf';

export default function EmailReportPage() {
  const { themeStretch } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const { outletId } = useOutlet();
  const companyID = user?.companyID;

  const [date, setDate] = useState<Moment | null>(moment());
  const [dateFrom, setDateFrom] = useState<Moment | null>(moment());
  const [dateTo, setDateTo] = useState<Moment | null>(moment());
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<ReportData | null>(null);
  const [previewPaymentTotals, setPreviewPaymentTotals] = useState<PaymentMethodTotals | null>(
    null
  );
  const [reportFilter, setReportFilter] = useState<'all' | 'provider-shop' | 'shop-client'>('all');
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [brands, setBrands] = useState<any[]>([]);

  const buildReportParams = (): GetPDFReportParams => {
    const params: GetPDFReportParams = { companyID: companyID as string };
    if (dateFrom) params.dateFrom = dateFrom.format('YYYY-MM-DD');
    if (dateTo) params.dateTo = dateTo.format('YYYY-MM-DD');
    if (selectedBrand?._id) params.brandId = selectedBrand._id;
    if (outletId !== 'combined') params.outletId = outletId;
    return params;
  };

  const loadReportBundle = async () => {
    const [reportData, allPayments] = await Promise.all([
      getReportDataApi(buildReportParams()),
      getPaymentData(companyID as string, outletId === 'combined' ? undefined : outletId),
    ]);
    const paymentMethodTotals = computePaymentMethodTotals(
      allPayments,
      dateFrom,
      dateTo,
      selectedBrand
    );
    return { reportData, paymentMethodTotals };
  };

  // Load brands on mount
  useEffect(() => {
    const loadBrands = async () => {
      if (!companyID) return;
      try {
        const brandData = await getBrandData(companyID);
        setBrands(brandData || []);
      } catch (error) {
        console.error('Error loading brands:', error);
        enqueueSnackbar('Error loading brands', { variant: 'error' });
      }
    };
    loadBrands();
  }, [companyID, enqueueSnackbar]);

  const handleSendDailyReport = async () => {
    if (!companyID) {
      enqueueSnackbar('Company ID is required', { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      await sendDailyReportApi({
        companyID,
        date: date ? date.format('YYYY-MM-DD') : undefined,
        brandId: selectedBrand?._id,
        outletId: outletId === 'combined' ? undefined : outletId,
      });
      enqueueSnackbar('Daily report sent successfully!', { variant: 'success' });
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Error sending daily report', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!companyID) {
      enqueueSnackbar('Company ID is required', { variant: 'error' });
      return;
    }
    if (!dateFrom || !dateTo) {
      enqueueSnackbar('Please set date from and date to', { variant: 'warning' });
      return;
    }

    setPreviewLoading(true);
    try {
      const { reportData, paymentMethodTotals } = await loadReportBundle();
      setPreviewData(reportData);
      setPreviewPaymentTotals(paymentMethodTotals);
      setPreviewOpen(true);
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Error loading report preview', { variant: 'error' });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
  };

  const handleDownloadPDF = async (reportDataOverride?: ReportData) => {
    if (!companyID) {
      enqueueSnackbar('Company ID is required', { variant: 'error' });
      return;
    }

    setPdfLoading(true);
    try {
      let reportData = reportDataOverride;
      let paymentMethodTotals = previewPaymentTotals;

      if (!reportData) {
        const bundle = await loadReportBundle();
        reportData = bundle.reportData;
        paymentMethodTotals = bundle.paymentMethodTotals;
      }

      if (!paymentMethodTotals) {
        const allPayments = await getPaymentData(
          companyID,
          outletId === 'combined' ? undefined : outletId
        );
        paymentMethodTotals = computePaymentMethodTotals(
          allPayments,
          dateFrom,
          dateTo,
          selectedBrand
        );
      }

      const { doc, filename } = await generateDailyReportPdf({
        reportData,
        reportFilter,
        isBrandFiltered: !!selectedBrand?._id,
        paymentMethodTotals,
      });

      doc.save(filename);
      enqueueSnackbar('PDF report downloaded successfully!', { variant: 'success' });
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Error generating PDF report', { variant: 'error' });
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadFromPreview = () => {
    if (previewData) {
      handleDownloadPDF(previewData);
    }
  };

  return (
    <>
      <Helmet>
        <title> Daily Reports | POS System </title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Daily Reports"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Daily Reports' },
          ]}
        />

        <Card sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Daily Reports
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Send daily stock reports via email or download as PDF. Reports include Stock Management
            transactions (Stock-in and Returning-stock-out) and Sales transactions (Sales and
            Refunds).
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Send Daily Report via Email
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Send a formatted email report to the shop owner for the selected date.
                </Typography>

                <LocalizationProvider dateAdapter={AdapterMoment}>
                  <DatePicker
                    label="Select Date"
                    value={date}
                    onChange={(newValue) => setDate(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
                  />
                </LocalizationProvider>

                <Autocomplete
                  options={brands}
                  getOptionLabel={(option) => option.brandName || ''}
                  value={selectedBrand}
                  onChange={(event, newValue) => setSelectedBrand(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} label="Filter by Brand (Optional)" fullWidth sx={{ mb: 2 }} />
                  )}
                  sx={{ mb: 2 }}
                />

                <LoadingButton
                  variant="contained"
                  onClick={handleSendDailyReport}
                  loading={loading}
                  startIcon={<Iconify icon="eva:email-fill" />}
                  color="primary"
                >
                  Send Daily Report
                </LoadingButton>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Download PDF Report
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Set filters, preview the report, then download as PDF.
                </Typography>

                <LocalizationProvider dateAdapter={AdapterMoment}>
                  <Stack spacing={2}>
                    <DatePicker
                      label="Date From"
                      value={dateFrom}
                      onChange={(newValue) => setDateFrom(newValue)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                    <DatePicker
                      label="Date To"
                      value={dateTo}
                      onChange={(newValue) => setDateTo(newValue)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />

                    <Autocomplete
                      options={brands}
                      getOptionLabel={(option) => option.brandName || ''}
                      value={selectedBrand}
                      onChange={(event, newValue) => setSelectedBrand(newValue)}
                      renderInput={(params) => (
                        <TextField {...params} label="Filter by Brand (Optional)" fullWidth />
                      )}
                    />
                    
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Report Sections:
                      </Typography>
                      <ToggleButtonGroup
                        value={reportFilter}
                        exclusive
                        onChange={(e, newValue) => {
                          if (newValue !== null) {
                            setReportFilter(newValue);
                          }
                        }}
                        aria-label="report filter"
                        fullWidth
                      >
                        <ToggleButton value="all" aria-label="all">
                          All
                        </ToggleButton>
                        <ToggleButton value="provider-shop" aria-label="stock-management">
                          Stock Management
                        </ToggleButton>
                        <ToggleButton value="shop-client" aria-label="sales">
                          Sales
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Box>

                    <Stack direction="row" spacing={1}>
                      <LoadingButton
                        variant="outlined"
                        onClick={handlePreview}
                        loading={previewLoading}
                        startIcon={<Iconify icon="eva:eye-fill" />}
                        color="primary"
                        fullWidth
                      >
                        Preview
                      </LoadingButton>
                      <LoadingButton
                        variant="contained"
                        onClick={() => handleDownloadPDF()}
                        loading={pdfLoading}
                        startIcon={<Iconify icon="eva:download-fill" />}
                        color="primary"
                        fullWidth
                      >
                        Download PDF
                      </LoadingButton>
                    </Stack>
                  </Stack>
                </LocalizationProvider>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Report Information
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Stock Management:</strong> Stock-in and Returning-stock-out operations between
              providers and the shop.
              <br />
              <strong>Sales:</strong> Sales and refunds between the shop and customers.
              <br />
              <br />
              Reports are automatically sent daily at 11:59 PM. You can also manually send reports
              using the form above. Filter by brand to see transactions for a specific brand only.
            </Typography>
          </Box>
        </Card>
      </Container>

      <DailyReportPreviewDialog
        open={previewOpen}
        onClose={handleClosePreview}
        reportData={previewData}
        reportFilter={reportFilter}
        isBrandFiltered={!!selectedBrand?._id}
        paymentMethodTotals={previewPaymentTotals}
        onDownload={handleDownloadFromPreview}
        downloadLoading={pdfLoading}
      />
    </>
  );
}
