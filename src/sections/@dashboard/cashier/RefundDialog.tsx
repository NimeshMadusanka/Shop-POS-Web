import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { LoadingButton } from '@mui/lab';
import { useSnackbar } from '../../../components/snackbar';
import { getPaymentData } from '../../../api/PaymentApi';
import { refundPaymentApi } from '../../../api/PaymentApi';
import { NewPaymentCreate } from '../../../@types/user';

type Props = {
  open: boolean;
  onClose: () => void;
  companyID: string;
  onRefundSuccess?: () => void;
};

export default function RefundDialog({ open, onClose, companyID, onRefundSuccess }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [payments, setPayments] = useState<NewPaymentCreate[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<NewPaymentCreate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [confirmRefundId, setConfirmRefundId] = useState<string | null>(null);
  const [viewingInvoiceId, setViewingInvoiceId] = useState<string | null>(null);

  const loadPayments = useCallback(async () => {
    if (!companyID) return;
    setLoading(true);
    try {
      const data = await getPaymentData(companyID);
      // Filter out already refunded payments and sort by date (recent first)
      const sorted = data
        .filter((p: NewPaymentCreate) => !(p as any).refunded)
        .sort((a: NewPaymentCreate, b: NewPaymentCreate) => {
          const dateA = new Date(a.date || 0).getTime();
          const dateB = new Date(b.date || 0).getTime();
          return dateB - dateA;
        });
      setPayments(sorted);
      setFilteredPayments(sorted);
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Error loading payments', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [companyID, enqueueSnackbar]);

  useEffect(() => {
    if (open) {
      loadPayments();
    }
  }, [open, loadPayments]);

  useEffect(() => {
    if (searchTerm.trim()) {
      // Search by invoice number
      const filtered = payments.filter((payment) => {
        const invoiceNumber = (payment as any).invoiceNumber || '';
        return invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredPayments(filtered);
    } else {
      setFilteredPayments(payments);
    }
  }, [searchTerm, payments]);

  const handleRefundClick = (payment: NewPaymentCreate) => {
    if (!payment._id) return;
    setConfirmRefundId(payment._id);
  };

  const handleConfirmRefund = async () => {
    if (!confirmRefundId) return;
    setRefundingId(confirmRefundId);
    setConfirmRefundId(null);
    try {
      await refundPaymentApi(confirmRefundId, companyID);
      enqueueSnackbar('Refund processed successfully', { variant: 'success' });
      await loadPayments();
      // Call the callback to refresh item data in parent component
      if (onRefundSuccess) {
        onRefundSuccess();
      }
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Error processing refund', { variant: 'error' });
    } finally {
      setRefundingId(null);
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

  const handleClose = () => {
    setSearchTerm('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Refund Sales</Typography>
          <IconButton onClick={loadPayments} size="small">
            <RefreshIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
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
            sx={{ mb: 2 }}
          />

          {loading ? (
            <Typography>Loading...</Typography>
          ) : filteredPayments.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              {searchTerm ? 'No payments found matching your search' : 'No payments available for refund'}
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Invoice Number</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment._id} hover>
                    <TableCell>{(payment as any).invoiceNumber || 'N/A'}</TableCell>
                    <TableCell>
                      {payment.date ? new Date(payment.date).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {payment.items?.length || 0} item{payment.items?.length !== 1 ? 's' : ''}
                    </TableCell>
                    <TableCell>{payment.grandTotal ? Number(payment.grandTotal).toFixed(2) : '0.00'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => handleViewInvoice(payment)}
                          disabled={viewingInvoiceId === payment._id}
                        >
                          View Invoice
                        </Button>
                        <LoadingButton
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleRefundClick(payment)}
                          loading={refundingId === payment._id}
                          disabled={refundingId !== null}
                        >
                          Refund
                        </LoadingButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>

      {/* Confirmation Dialog */}
      <Dialog open={confirmRefundId !== null} onClose={() => setConfirmRefundId(null)}>
        <DialogTitle>Confirm Refund</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to refund this payment? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRefundId(null)}>Cancel</Button>
          <Button onClick={handleConfirmRefund} color="error" variant="contained">
            Yes, Refund
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}

