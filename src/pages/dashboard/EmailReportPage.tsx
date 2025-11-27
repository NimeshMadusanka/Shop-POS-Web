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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { PATH_DASHBOARD } from '../../routes/paths';
import { useSettingsContext } from '../../components/settings';
import { useSnackbar } from '../../components/snackbar';
import { useAuthContext } from '../../auth/useAuthContext';
import { sendDailyReportApi, getReportDataApi } from '../../api/EmailReportApi';
import { getBrandData } from '../../api/BrandApi';
import Iconify from '../../components/iconify';
import { Autocomplete } from '@mui/material';

export default function EmailReportPage() {
  const { themeStretch } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const companyID = user?.companyID;

  const [date, setDate] = useState<Moment | null>(moment());
  const [dateFrom, setDateFrom] = useState<Moment | null>(moment());
  const [dateTo, setDateTo] = useState<Moment | null>(moment());
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [reportFilter, setReportFilter] = useState<'all' | 'provider-shop' | 'shop-client'>('all');
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [brands, setBrands] = useState<any[]>([]);

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
      });
      enqueueSnackbar('Daily report sent successfully!', { variant: 'success' });
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Error sending daily report', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!companyID) {
      enqueueSnackbar('Company ID is required', { variant: 'error' });
      return;
    }

    setPdfLoading(true);
    try {
      const params: any = { companyID };
      if (dateFrom) {
        params.dateFrom = dateFrom.format('YYYY-MM-DD');
      }
      if (dateTo) {
        params.dateTo = dateTo.format('YYYY-MM-DD');
      }
      if (selectedBrand?._id) {
        params.brandId = selectedBrand._id;
      }

      const reportData = await getReportDataApi(params);

      // Generate PDF using jsPDF (like AnalyticsPage)
      const doc = new jsPDF();
      const marginLeft = 20;
      let currentY = 20;

      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Stock Report', marginLeft, currentY);
      currentY += 10;

      // Brand Name (if filtered)
      if (reportData.brandName) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Brand: ${reportData.brandName}`, marginLeft, currentY);
        currentY += 8;
      }

      // Report Date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleString()}`, marginLeft, currentY);
      currentY += 6;

      // Date Range
      if (reportData.dateFrom || reportData.dateTo) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Period:', marginLeft, currentY);
        doc.setFont('helvetica', 'normal');
        const periodText = `${reportData.dateFrom || 'Start'} - ${reportData.dateTo || 'End'}`;
        doc.text(periodText, marginLeft + 20, currentY);
        currentY += 6;
      } else {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text('Showing all records', marginLeft, currentY);
        currentY += 6;
      }

      // Truncate long text to prevent overflow
      const truncateText = (text: string, maxLength: number) => {
        if (!text) return 'N/A';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
      };

      // Filter transactions based on selected filter
      const showProviderShop = reportFilter === 'all' || reportFilter === 'provider-shop';
      const showShopClient = reportFilter === 'all' || reportFilter === 'shop-client';

      // Provider-Shop Transactions Table
      if (showProviderShop) {
        if (reportData.providerShopTransactions.length > 0) {
          // Section title
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Provider-Shop Transactions', marginLeft, currentY);
          currentY += 8;

          autoTable(doc, {
            startY: currentY,
            head: [['Date', 'Provider', 'Item Name', 'Brand', 'Amount', 'Type']],
            body: reportData.providerShopTransactions.map((t) => [
              new Date(t.operationDate).toLocaleDateString(),
              truncateText(t.providerName || 'N/A', 18),
              truncateText(t.itemName || 'N/A', 22),
              truncateText(t.brandName || 'N/A', 12),
              String(t.amount || 0),
              truncateText(t.operationType || 'N/A', 15),
            ]),
            theme: 'grid',
            headStyles: { fillColor: [0, 102, 204], fontSize: 9 },
            margin: { left: marginLeft, right: 20 },
            styles: { fontSize: 7, cellPadding: 1.5 },
            columnStyles: {
              0: { cellWidth: 28 }, // Date
              1: { cellWidth: 35 }, // Provider
              2: { cellWidth: 40 }, // Item Name
              3: { cellWidth: 25 }, // Brand
              4: { cellWidth: 20 }, // Amount
              5: { cellWidth: 30 }, // Type
            },
            tableWidth: 'auto',
          });

          const finalY = (doc as any).lastAutoTable?.finalY || currentY + 50;
          currentY = finalY + 10;
        } else {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          doc.text('No Provider-Shop transactions found.', marginLeft, currentY);
          currentY += 10;
        }
      }

      // Add new page for Shop-Client transactions if showing both sections
      if (showProviderShop && showShopClient && reportData.providerShopTransactions.length > 0) {
        doc.addPage();
        currentY = 20;
      }

      // Shop-Client Transactions Table
      if (showShopClient) {
        // Section title
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Shop-Client Transactions', marginLeft, currentY);
        currentY += 8;

        if (reportData.shopClientTransactions.length > 0) {
          autoTable(doc, {
            startY: currentY,
            head: [['Date', 'Invoice', 'Item Name', 'Brand', 'Qty', 'Total', 'Type']],
            body: reportData.shopClientTransactions.map((t) => [
              new Date(t.date).toLocaleDateString(),
              truncateText(t.invoiceNumber || 'N/A', 15),
              truncateText(t.itemName || 'N/A', 22),
              truncateText(t.brandName || 'N/A', 12),
              String(t.quantity || 0),
              `$${Number(t.total || 0).toFixed(2)}`,
              truncateText(t.operationType || 'N/A', 12),
            ]),
            theme: 'grid',
            headStyles: { fillColor: [0, 102, 204], fontSize: 9 },
            margin: { left: marginLeft, right: 20 },
            styles: { fontSize: 7, cellPadding: 1.5 },
            columnStyles: {
              0: { cellWidth: 25 }, // Date
              1: { cellWidth: 30 }, // Invoice
              2: { cellWidth: 40 }, // Item Name
              3: { cellWidth: 25 }, // Brand
              4: { cellWidth: 15 }, // Quantity
              5: { cellWidth: 22 }, // Total
              6: { cellWidth: 25 }, // Type
            },
            tableWidth: 'auto',
          });

          const finalY = (doc as any).lastAutoTable?.finalY || currentY + 50;
          currentY = finalY + 10;

          // Summary
          const totalSold = reportData.shopClientTransactions
            .filter((t) => t.operationType === 'Sold')
            .reduce((sum, t) => sum + (t.total || 0), 0);
          const totalRefunded = reportData.shopClientTransactions
            .filter((t) => t.operationType === 'Refunded')
            .reduce((sum, t) => sum + (t.total || 0), 0);
          const soldCount = reportData.shopClientTransactions.filter((t) => t.operationType === 'Sold').length;
          const refundedCount = reportData.shopClientTransactions.filter((t) => t.operationType === 'Refunded').length;

          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Summary', marginLeft, currentY);
          currentY += 8;

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text(`Total Sold: ${soldCount} transactions - $${totalSold.toFixed(2)}`, marginLeft, currentY);
          currentY += 6;
          doc.text(`Total Refunded: ${refundedCount} transactions - $${totalRefunded.toFixed(2)}`, marginLeft, currentY);
          currentY += 10; // Add extra space after summary
        } else {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          doc.text('No Shop-Client transactions found.', marginLeft, currentY);
          currentY += 10;
        }
      }

      // Add Statistics Section
      if (reportData.statistics) {
        // Get the current Y position from the last table or use currentY
        const lastTableY = (doc as any).lastAutoTable?.finalY;
        if (lastTableY) {
          currentY = lastTableY + 35; // Add more space after the last table
        } else {
          currentY += 35; // Add space if no table
        }

        // Check if we need a new page (leave room for statistics section)
        if (currentY > 230) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Statistics', marginLeft, currentY);
        currentY += 10;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total Products Stock In: ${reportData.statistics.totalStockIn}`, marginLeft, currentY);
        currentY += 7;
        doc.text(`Total Products Sold: ${reportData.statistics.totalSold}`, marginLeft, currentY);
        currentY += 7;
        doc.text(`Total Products Returned: ${reportData.statistics.totalReturned}`, marginLeft, currentY);
      }

      // Generate filename based on filters
      let filename = `daily_report_${new Date().toISOString().split('T')[0]}`;
      if (reportFilter !== 'all') {
        filename += `_${reportFilter}`;
      }
      if (reportData.brandName) {
        filename += `_${reportData.brandName.replace(/\s+/g, '_')}`;
      }
      if (reportData.dateFrom || reportData.dateTo) {
        filename += '_filtered';
        if (reportData.dateFrom) filename += `_from_${reportData.dateFrom}`;
        if (reportData.dateTo) filename += `_to_${reportData.dateTo}`;
      }
      filename += '.pdf';

      // Save PDF
      doc.save(filename);
      enqueueSnackbar('PDF report downloaded successfully!', { variant: 'success' });
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Error generating PDF report', { variant: 'error' });
    } finally {
      setPdfLoading(false);
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
            Send daily stock reports via email or download as PDF. Reports include Provider-Shop
            transactions (Stock-in and Returning-stock-out) and Shop-Client transactions (Sales and
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
                  Download a PDF report for a specific date or date range. Select which sections to include.
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
                        <ToggleButton value="provider-shop" aria-label="provider-shop">
                          Provider-Shop
                        </ToggleButton>
                        <ToggleButton value="shop-client" aria-label="shop-client">
                          Shop-Client
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Box>

                    <LoadingButton
                      variant="outlined"
                      onClick={handleDownloadPDF}
                      loading={pdfLoading}
                      startIcon={<Iconify icon="eva:download-fill" />}
                      color="primary"
                      fullWidth
                    >
                      Download PDF Report
                    </LoadingButton>
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
              <strong>Provider-Shop Transactions:</strong> Stock-in and Returning-stock-out
              operations between providers and the shop.
              <br />
              <strong>Shop-Client Transactions:</strong> Sales and refunds between the shop and
              customers.
              <br />
              <br />
              Reports are automatically sent daily at 11:59 PM. You can also manually send reports
              using the form above. Filter by brand to see transactions for a specific brand only.
            </Typography>
          </Box>
        </Card>
      </Container>
    </>
  );
}

