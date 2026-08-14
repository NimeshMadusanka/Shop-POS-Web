import { useCallback, useEffect, useMemo, useState } from 'react';
import { Fragment } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Collapse,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { LoadingButton } from '@mui/lab';
import { useSnackbar } from '../../../components/snackbar';
import {
  getPaymentData,
  refundPaymentApi,
  partialRefundApi,
  getPaymentByInvoiceNumber,
} from '../../../api/PaymentApi';
import { NewPaymentCreate } from '../../../@types/user';

type Props = {
  open: boolean;
  onClose: () => void;
  companyID: string;
  onRefundSuccess?: () => void;
};

type RefundMode = 'full' | 'partial';

export default function RefundFlowDialog({ open, onClose, companyID, onRefundSuccess }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [payments, setPayments] = useState<NewPaymentCreate[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<NewPaymentCreate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<RefundMode>('full');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [confirmRefundId, setConfirmRefundId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [invoiceLookup, setInvoiceLookup] = useState('');
  const [viewingInvoiceId, setViewingInvoiceId] = useState<string | null>(null);

  const loadPayments = useCallback(async () => {
    if (!companyID) return;
    setLoading(true);
    try {
      const data = await getPaymentData(companyID);
      const sorted = (Array.isArray(data) ? data : [])
        .filter((p: any) => !p.refunded && !p.isReversal)
        .sort((a: any, b: any) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      setPayments(sorted);
      setFilteredPayments(sorted);
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Error loading payments', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [companyID, enqueueSnackbar]);

  useEffect(() => {
    if (open) loadPayments();
  }, [open, loadPayments]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPayments(payments);
      return;
    }
    const q = searchTerm.toLowerCase();
    setFilteredPayments(
      payments.filter((payment: any) => String(payment.invoiceNumber || '').toLowerCase().includes(q))
    );
  }, [searchTerm, payments]);

  const handleClose = () => {
    setSearchTerm('');
    setMode('full');
    setSelectedPayment(null);
    setQuantities({});
    setConfirmRefundId(null);
    setInvoiceLookup('');
    onClose();
  };

  const getRowKey = (item: any, index: number) => `${String(item.itemId)}-${index}`;

  const getRemainingQty = (payment: any, item: any) => {
    const refundedItems = Array.isArray(payment?.refundedItems) ? payment.refundedItems : [];
    const refundedQty = refundedItems
      .filter((ri: any) => String(ri.itemId?._id || ri.itemId) === String(item.itemId))
      .reduce((sum: number, ri: any) => sum + (Number(ri.quantity) || 0), 0);
    return Math.max(0, (Number(item.quantity) || 0) - refundedQty);
  };

  const partialSelectionCount = useMemo(() => {
    if (!selectedPayment?.items) return 0;
    return selectedPayment.items.reduce((sum: number, item: any, index: number) => {
      const key = getRowKey(item, index);
      return sum + ((Number(quantities[key]) || 0) > 0 ? 1 : 0);
    }, 0);
  }, [selectedPayment, quantities]);

  const handleInvoiceLookup = async () => {
    if (!invoiceLookup.trim()) return;
    try {
      const payment = await getPaymentByInvoiceNumber(invoiceLookup.trim(), companyID);
      if (!payment?._id || payment.refunded || payment.isReversal) {
        enqueueSnackbar('Invoice not available for refund', { variant: 'warning' });
        return;
      }
      setSelectedPayment(payment);
      setMode('partial');
      setQuantities({});
    } catch (error: any) {
      enqueueSnackbar(error.message || error.response?.data?.message || 'Invoice not found', {
        variant: 'error',
      });
    }
  };

  const handleViewInvoice = async (payment: NewPaymentCreate) => {
    if (!payment._id) return;
    setViewingInvoiceId(payment._id);
    try {
      const { generateInvoicePDF } = await import('./InvoicePDF');
      generateInvoicePDF(payment);
    } catch (error) {
      enqueueSnackbar('Error generating invoice PDF', { variant: 'error' });
    } finally {
      setViewingInvoiceId(null);
    }
  };

  const handleConfirm = async () => {
    if (!selectedPayment?._id) return;
    setProcessing(true);
    try {
      if (mode === 'full') {
        await refundPaymentApi(selectedPayment._id, companyID);
        enqueueSnackbar('Full refund processed successfully', { variant: 'success' });
      } else {
        const returnItems = (selectedPayment.items || [])
          .map((item: any, index: number) => {
            const rowKey = getRowKey(item, index);
            return {
              itemId: item.itemId,
              quantity: Number(quantities[rowKey]) || 0,
            };
          })
          .filter((i: any) => i.quantity > 0);

        if (returnItems.length === 0) {
          enqueueSnackbar('Select at least one item quantity for partial refund', {
            variant: 'warning',
          });
          return;
        }

        await partialRefundApi(selectedPayment._id, returnItems, companyID);
        enqueueSnackbar('Partial refund processed successfully', { variant: 'success' });
      }

      await loadPayments();
      onRefundSuccess?.();
      setSelectedPayment(null);
      setQuantities({});
      setConfirmRefundId(null);
    } catch (error: any) {
      enqueueSnackbar(
        error.message || error.response?.data?.message || 'Refund processing failed',
        { variant: 'error' }
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Refund</Typography>
          <Button size="small" onClick={loadPayments} startIcon={<RefreshIcon />}>
            Refresh
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1, display: 'grid', gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by invoice number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              label="Quick invoice lookup"
              value={invoiceLookup}
              onChange={(e) => setInvoiceLookup(e.target.value)}
            />
            <Button variant="outlined" onClick={handleInvoiceLookup}>
              Load
            </Button>
          </Box>

          {loading ? (
            <Typography>Loading...</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Invoice</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPayments.map((payment: any) => {
                  const isSelected = selectedPayment?._id === payment._id;
                  return (
                    <Fragment key={payment._id}>
                      <TableRow key={payment._id} hover selected={isSelected}>
                        <TableCell>{payment.invoiceNumber || 'N/A'}</TableCell>
                        <TableCell>{payment.date || 'N/A'}</TableCell>
                        <TableCell>{payment.items?.length || 0}</TableCell>
                        <TableCell>{Number(payment.grandTotal || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant={isSelected ? 'contained' : 'outlined'}
                              onClick={() => {
                                setSelectedPayment(payment);
                                setQuantities({});
                              }}
                            >
                              {isSelected ? 'Selected' : 'Select'}
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleViewInvoice(payment)}
                              disabled={viewingInvoiceId === payment._id}
                            >
                              View Invoice
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={5} sx={{ p: 0, borderBottom: isSelected ? undefined : 0 }}>
                          <Collapse in={isSelected} timeout="auto" unmountOnExit>
                            <Box sx={{ m: 1.5, p: 1.5, border: '1px solid #eee', borderRadius: 1 }}>
                              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Refund options for {payment.invoiceNumber || 'N/A'}
                              </Typography>
                              <ToggleButtonGroup
                                exclusive
                                value={mode}
                                onChange={(_, v) => {
                                  if (v) setMode(v);
                                }}
                                size="small"
                                sx={{ mb: 2 }}
                              >
                                <ToggleButton value="full">Full Refund</ToggleButton>
                                <ToggleButton value="partial">Partial Refund</ToggleButton>
                              </ToggleButtonGroup>

                              {mode === 'partial' && (
                                <>
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>Item</TableCell>
                                        <TableCell>Purchased</TableCell>
                                        <TableCell>Remaining</TableCell>
                                        <TableCell>Refund Qty</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {(payment.items || []).map((item: any, index: number) => {
                                        const rowKey = getRowKey(item, index);
                                        const remaining = getRemainingQty(payment, item);
                                        return (
                                          <TableRow key={rowKey}>
                                            <TableCell>{item.itemName || 'N/A'}</TableCell>
                                            <TableCell>{Number(item.quantity) || 0}</TableCell>
                                            <TableCell>{remaining}</TableCell>
                                            <TableCell>
                                              <TextField
                                                type="number"
                                                size="small"
                                                value={quantities[rowKey] ?? ''}
                                                onChange={(e) => {
                                                  const raw = Number(e.target.value) || 0;
                                                  const val = Math.min(Math.max(raw, 0), remaining);
                                                  setQuantities((prev) => ({ ...prev, [rowKey]: val }));
                                                }}
                                                inputProps={{ min: 0, max: remaining }}
                                                sx={{ width: 110 }}
                                              />
                                            </TableCell>
                                          </TableRow>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ mt: 1, display: 'block' }}
                                  >
                                    {partialSelectionCount} item line(s) selected for partial refund.
                                  </Typography>
                                </>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <LoadingButton
          variant="contained"
          color="error"
          loading={processing}
          disabled={!selectedPayment}
          onClick={() => setConfirmRefundId(selectedPayment?._id || null)}
        >
          {mode === 'full' ? 'Refund All' : 'Confirm Partial Refund'}
        </LoadingButton>
      </DialogActions>

      <Dialog open={!!confirmRefundId} onClose={() => setConfirmRefundId(null)}>
        <DialogTitle>{mode === 'full' ? 'Confirm Full Refund' : 'Confirm Partial Refund'}</DialogTitle>
        <DialogContent>
          <Typography>
            {mode === 'full'
              ? 'Refund the full invoice amount and all items?'
              : 'Proceed with partial refund for the selected item quantities?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRefundId(null)}>Cancel</Button>
          <LoadingButton color="error" variant="contained" loading={processing} onClick={handleConfirm}>
            Confirm
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}

