import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  Chip,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { LoadingButton } from '@mui/lab';
import { ReportData } from 'src/api/EmailReportApi';
import { PaymentMethodTotals, ReportFilter } from 'src/utils/dailyReportPdf';
import { getLowStockStatus } from 'src/utils/groupLowStockByBrand';
import { groupLowStockByOutletAndBrand } from 'src/utils/groupLowStockByOutletAndBrand';
import AlignedGroupedTables from 'src/components/table/AlignedGroupedTables';
import { OUTLETS, OutletId } from 'src/config/outlets';
import { DISCOUNT_LEGEND } from 'src/utils/discountCalc';
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';

type Props = {
  open: boolean;
  onClose: () => void;
  reportData: ReportData | null;
  reportFilter: ReportFilter;
  isBrandFiltered: boolean;
  isCombinedOutlets?: boolean;
  activeOutletId?: OutletId;
  selectedBrandId?: string | null;
  paymentMethodTotals: PaymentMethodTotals | null;
  onDownload: () => void;
  downloadLoading?: boolean;
};

const formatLkr = (n: number) => `LKR ${Number(n || 0).toFixed(2)}`;

function SectionTable({
  title,
  headers,
  rows,
  emptyMessage,
}: {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  emptyMessage?: string;
}) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
        {title}
      </Typography>
      {rows.length === 0 ? (
        <Typography variant="body2" color="text.secondary" fontStyle="italic">
          {emptyMessage || 'No records found.'}
        </Typography>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {headers.map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, idx) => (
                <TableRow key={`${title}-row-${idx}`}>
                  {row.map((cell, cellIdx) => (
                    <TableCell key={`${idx}-${cellIdx}`}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
}

export default function DailyReportPreviewDialog({
  open,
  onClose,
  reportData,
  reportFilter,
  isBrandFiltered,
  isCombinedOutlets = false,
  activeOutletId = 'AHANGAMA',
  selectedBrandId = null,
  paymentMethodTotals,
  onDownload,
  downloadLoading = false,
}: Props) {
  const showStockManagement = reportFilter === 'all' || reportFilter === 'provider-shop';
  const showSales = reportFilter === 'all' || reportFilter === 'shop-client';

  const stockRows =
    reportData?.providerShopTransactions.map((t) => [
      new Date(t.operationDate).toLocaleDateString(),
      t.providerName || 'N/A',
      t.itemName || 'N/A',
      t.brandName || 'N/A',
      t.amount ?? 0,
      t.operationType || 'N/A',
    ]) || [];

  const salesRows =
    reportData?.shopClientTransactions.map((t) => {
      const discountLabel =
        t.discountLabel ||
        (Number(t.discountAmount || 0) > 0 ? `cd-${Number(t.discountAmount).toFixed(0)}` : '');
      return [
        new Date(t.date).toLocaleDateString(),
        t.invoiceNumber || 'N/A',
        t.itemName || 'N/A',
        t.brandName || 'N/A',
        t.quantity ?? 0,
        formatLkr(Number(t.total || 0)),
        t.operationType || 'N/A',
        discountLabel || '-',
      ];
    }) || [];

  const sold = reportData?.shopClientTransactions.filter((t) => t.operationType === 'Sold') || [];
  const refunded =
    reportData?.shopClientTransactions.filter((t) => t.operationType === 'Refunded') || [];
  const totalSold = sold.reduce((s, t) => s + Number(t.total || 0), 0);
  const totalRefunded = refunded.reduce((s, t) => s + Number(t.total || 0), 0);
  const totalDiscount = sold.reduce((s, t) => s + Number(t.discountAmount || 0), 0);

  const rs = reportData?.revenueShare;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth scroll="paper">
      <DialogTitle sx={{ pr: 6 }}>
        Report Preview
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {!reportData ? (
          <Box sx={{ p: 3 }}>
            <Typography color="text.secondary">No preview data loaded.</Typography>
          </Box>
        ) : (
          <Scrollbar sx={{ maxHeight: '70vh', px: 3, py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Stock Report
            </Typography>
            {reportData.brandName && (
              <Chip label={`Brand: ${reportData.brandName}`} size="small" sx={{ mb: 1 }} />
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Generated: {new Date().toLocaleString()}
              {(reportData.dateFrom || reportData.dateTo) &&
                ` · Period: ${reportData.dateFrom || 'Start'} – ${reportData.dateTo || 'End'}`}
            </Typography>

            {showStockManagement && (
              <SectionTable
                title="Stock Management"
                headers={['Date', 'Provider', 'Item', 'Brand', 'Amount', 'Type']}
                rows={stockRows}
                emptyMessage="No stock management transactions found."
              />
            )}

            {showSales && (
              <>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  {DISCOUNT_LEGEND}
                </Typography>
                <SectionTable
                  title="Sales"
                  headers={['Date', 'Invoice', 'Item', 'Brand', 'Qty', 'Total', 'Type', 'Discount']}
                  rows={salesRows}
                  emptyMessage="No sales transactions found."
                />

                {salesRows.length > 0 && (
                  <Box sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Sales Summary
                    </Typography>
                    <Typography variant="body2">Sold: {sold.length} line(s)</Typography>
                    <Typography variant="body2">
                      Refunded (flipped originals): {refunded.length} line(s) ({formatLkr(totalRefunded)})
                    </Typography>
                    <Typography variant="body2">
                      Gross (after discount): {formatLkr(totalSold)}
                    </Typography>
                    <Typography variant="body2">
                      Total discount: {formatLkr(totalDiscount)}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      Net Sale: {formatLkr(totalSold)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Refunded = original sale line flipped after refund. Already removed from Sold,
                      so Net does not subtract it again.
                    </Typography>
                  </Box>
                )}

                {rs && (
                  <Box sx={{ mb: 3, p: 2, bgcolor: 'action.selected', borderRadius: 1 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                      Revenue Share
                    </Typography>
                    {isBrandFiltered && reportData.brandName && (
                      <Typography variant="body2">
                        Shop commission: {Number(rs.commissionPercent || 0).toFixed(2)}%
                      </Typography>
                    )}
                    <Typography variant="body2">Net total: {formatLkr(rs.netTotal)}</Typography>
                    <Typography variant="body2">Shop share: {formatLkr(rs.shopShare)}</Typography>
                    <Typography variant="body2">
                      {isBrandFiltered ? 'Brand share' : 'Brands share'}:{' '}
                      {formatLkr(rs.brandShare)}
                    </Typography>
                    {!isBrandFiltered && rs.perBrand?.length ? (
                      <Box sx={{ mt: 2, overflowX: 'auto' }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Brand</TableCell>
                              <TableCell>Comm %</TableCell>
                              <TableCell>Net</TableCell>
                              <TableCell>Shop</TableCell>
                              <TableCell>Brand</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {rs.perBrand.map((row) => (
                              <TableRow key={row.brandId || row.brandName}>
                                <TableCell>{row.brandName}</TableCell>
                                <TableCell>{Number(row.commissionPercent).toFixed(2)}%</TableCell>
                                <TableCell>{formatLkr(row.netTotal)}</TableCell>
                                <TableCell>{formatLkr(row.shopShare)}</TableCell>
                                <TableCell>{formatLkr(row.brandShare)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    ) : null}
                  </Box>
                )}
              </>
            )}

            {reportData.statistics && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  Statistics
                </Typography>
                <Typography variant="body2">
                  Stock in: {reportData.statistics.totalStockIn} · Sold qty:{' '}
                  {reportData.statistics.totalSold} · Returned qty:{' '}
                  {reportData.statistics.totalReturned}
                </Typography>
                {reportData.statistics.totalMissing !== undefined && (
                  <Typography variant="body2" color="secondary.main">
                    Missing: {reportData.statistics.totalMissing} items (
                    {reportData.statistics.totalMissingAmount} units)
                  </Typography>
                )}
              </>
            )}

            {reportData.lowStockItems && reportData.lowStockItems.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  Low Stock Alerts
                </Typography>
                <AlignedGroupedTables
                  sections={groupLowStockByOutletAndBrand(
                    reportData.lowStockItems,
                    isCombinedOutlets
                      ? [...OUTLETS]
                      : [((reportData.scope as OutletId) || activeOutletId)],
                    selectedBrandId
                  )}
                  columns={[
                    {
                      id: 'item',
                      label: 'Item',
                      width: '38%',
                      render: (item) => item.itemName,
                    },
                    {
                      id: 'category',
                      label: 'Category',
                      width: '27%',
                      render: (item) => item.itemCategory || 'N/A',
                    },
                    {
                      id: 'stock',
                      label: 'Stock',
                      width: '15%',
                      align: 'right',
                      render: (item) => item.stockQuantity ?? 0,
                    },
                    {
                      id: 'status',
                      label: 'Status',
                      width: '20%',
                      render: (item) => getLowStockStatus(item.stockQuantity || 0),
                    },
                  ]}
                  brandHeaderColor="error.main"
                />
              </Box>
            )}

            {reportData.missingStockItems && reportData.missingStockItems.length > 0 && (
              <SectionTable
                title="Missing Stock Alerts"
                headers={['Item', 'Brand', 'Category', 'Missing', 'Date']}
                rows={reportData.missingStockItems.map((item) => [
                  item.itemName,
                  item.brandName,
                  item.itemCategory,
                  item.missingAmount,
                  new Date(item.operationDate).toLocaleDateString(),
                ])}
              />
            )}

            {paymentMethodTotals && (
              <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  Payment Method Totals
                </Typography>
                <Typography variant="body2">Cash: {formatLkr(paymentMethodTotals.cash)}</Typography>
                <Typography variant="body2">Card: {formatLkr(paymentMethodTotals.card)}</Typography>
                <Typography variant="body2">Wire: {formatLkr(paymentMethodTotals.wire)}</Typography>
                <Typography variant="body2" fontWeight={600}>
                  Net: {formatLkr(paymentMethodTotals.net)}
                </Typography>
              </Box>
            )}
          </Scrollbar>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <LoadingButton
          variant="contained"
          onClick={onDownload}
          loading={downloadLoading}
          startIcon={<Iconify icon="eva:download-fill" />}
          disabled={!reportData}
        >
          Download PDF
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
