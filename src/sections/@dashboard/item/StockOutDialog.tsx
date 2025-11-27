import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useSnackbar } from '../../../components/snackbar';
import { stockOutApi } from '../../../api/ItemApi';
import { useAuthContext } from '../../../auth/useAuthContext';

type Props = {
  open: boolean;
  onClose: () => void;
  itemId: string;
  itemName: string;
  currentStock: number;
  onSuccess?: () => void;
};

export default function StockOutDialog({
  open,
  onClose,
  itemId,
  itemName,
  currentStock,
  onSuccess,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const companyID = user?.companyID;
  const [quantity, setQuantity] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      enqueueSnackbar('Please enter a valid quantity', { variant: 'error' });
      return;
    }

    const qty = Number(quantity);
    if (qty > currentStock) {
      enqueueSnackbar(`Cannot return ${qty} units. Only ${currentStock} units available in stock.`, {
        variant: 'error',
      });
      return;
    }

    if (!companyID) {
      enqueueSnackbar('Company ID is required', { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      await stockOutApi(itemId, qty, reason, companyID);
      enqueueSnackbar('Stock out processed successfully!', { variant: 'success' });
      handleClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Error processing stock out', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuantity('');
    setReason('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Stock Out - {itemName}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Current Stock: <strong>{currentStock}</strong>
          </Typography>
          <TextField
            fullWidth
            label="Quantity to Return"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            inputProps={{ min: 1, max: currentStock }}
            helperText={`Enter the quantity to return (max: ${currentStock})`}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Reason (Optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            rows={3}
            helperText="Optional: Enter reason for returning this stock"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <LoadingButton
          onClick={handleSubmit}
          variant="contained"
          loading={loading}
          color="primary"
        >
          Process Stock Out
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

