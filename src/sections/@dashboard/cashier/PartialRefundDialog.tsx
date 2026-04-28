import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { getPaymentByInvoiceNumber, partialRefundApi } from '../../../api/PaymentApi';
import { useSnackbar } from '../../../components/snackbar';

type Props = {
  open: boolean;
  onClose: () => void;
  companyID: string;
  onRefundSuccess?: () => void;
};

export default function PartialRefundDialog({ open, onClose, companyID, onRefundSuccess }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);
  const [payment, setPayment] = useState<any>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleSearch = async () => {
    if (!invoiceNumber.trim()) {
      enqueueSnackbar('Enter an invoice number', { variant: 'warning' });
      return;
    }
    setLoadingInvoice(true);
    try {
      const found = await getPaymentByInvoiceNumber(invoiceNumber.trim(), companyID);
      if (!found || !found._id) {
        enqueueSnackbar('Invoice not found', { variant: 'error' });
        return;
      }
      setPayment(found);
      setQuantities({});
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to find invoice', { variant: 'error' });
    } finally {
      setLoadingInvoice(false);
    }
  };

  const getRemainingQty = (item: any) => {
    const refundedItems = Array.isArray(payment?.refundedItems) ? payment.refundedItems : [];
    const refundedQty = refundedItems
      .filter((ri: any) => (ri.itemId?._id || ri.itemId)?.toString() === item.itemId?.toString())
      .reduce((sum: number, ri: any) => sum + (Number(ri.quantity) || 0), 0);
    return Math.max(0, (Number(item.quantity) || 0) - refundedQty);
  };

  const handleSubmit = async () => {
    if (!payment?._id) return;
    const returnItems = (payment.items || [])
      .map((item: any) => ({
        itemId: item.itemId,
        quantity: Number(quantities[item.itemId]) || 0,
      }))
      .filter((item: any) => item.quantity > 0);

    if (returnItems.length === 0) {
      enqueueSnackbar('Select at least one item quantity', { variant: 'warning' });
      return;
    }

    setRefundLoading(true);
    try {
      await partialRefundApi(payment._id, returnItems, companyID);
      enqueueSnackbar('Partial refund completed', { variant: 'success' });
      onRefundSuccess?.();
      handleClose();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Partial refund failed', { variant: 'error' });
    } finally {
      setRefundLoading(false);
    }
  };

  const handleClose = () => {
    setInvoiceNumber('');
    setPayment(null);
    setQuantities({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Partial Refund</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 2 }}>
          <TextField
            fullWidth
            label="Invoice Number"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
          />
          <LoadingButton loading={loadingInvoice} variant="contained" onClick={handleSearch}>
            Search
          </LoadingButton>
        </Box>

        {!payment ? (
          <Typography variant="body2" color="text.secondary">
            Search for an invoice to select returned item quantities.
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Purchased Qty</TableCell>
                <TableCell>Remaining Qty</TableCell>
                <TableCell>Refund Qty</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(payment.items || []).map((item: any) => {
                const remaining = getRemainingQty(item);
                return (
                  <TableRow key={item.itemId}>
                    <TableCell>{item.itemName || 'N/A'}</TableCell>
                    <TableCell>{item.quantity || 0}</TableCell>
                    <TableCell>{remaining}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={quantities[item.itemId] ?? ''}
                        onChange={(e) => {
                          const raw = Number(e.target.value) || 0;
                          const next = Math.min(Math.max(raw, 0), remaining);
                          setQuantities((prev) => ({ ...prev, [item.itemId]: next }));
                        }}
                        inputProps={{ min: 0, max: remaining }}
                        sx={{ width: 120 }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <LoadingButton onClick={handleSubmit} loading={refundLoading} color="error" variant="contained">
          Refund Selected Items
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
