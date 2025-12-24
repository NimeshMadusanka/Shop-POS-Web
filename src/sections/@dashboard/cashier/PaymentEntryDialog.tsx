import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Stack,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from '../../../components/snackbar';

type PaymentMethod = 'CASH' | 'CREDIT' | 'DEBIT' | 'SPLIT';

type Props = {
  open: boolean;
  onClose: () => void;
  grandTotal: number;
  onConfirm: (cashAmount: number, creditAmount: number, debitAmount: number) => void;
};

export default function PaymentEntryDialog({ open, onClose, grandTotal, onConfirm }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashAmount, setCashAmount] = useState<string>('');
  const [creditAmount, setCreditAmount] = useState<string>('');
  const [debitAmount, setDebitAmount] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate totals and balance
  const calculations = useMemo(() => {
    const cash = parseFloat(cashAmount) || 0;
    const credit = parseFloat(creditAmount) || 0;
    const debit = parseFloat(debitAmount) || 0;
    const totalPaid = cash + credit + debit;
    const balance = totalPaid - grandTotal;

    return { cash, credit, debit, totalPaid, balance };
  }, [cashAmount, creditAmount, debitAmount, grandTotal]);

  const handleNumberInput = (value: string) => {
    // For single method, update directly
    const current = paymentMethod === 'CASH' ? cashAmount : 
                   paymentMethod === 'CREDIT' ? creditAmount : debitAmount;
    const newValue = current === '0' || current === '' ? value : current + value;
    
    if (paymentMethod === 'CASH') setCashAmount(newValue);
    else if (paymentMethod === 'CREDIT') setCreditAmount(newValue);
    else setDebitAmount(newValue);
  };

  const handleDecimal = () => {
    const current = paymentMethod === 'CASH' ? cashAmount : 
                   paymentMethod === 'CREDIT' ? creditAmount : debitAmount;
    if (!current.includes('.')) {
      const newValue = (current || '0') + '.';
      if (paymentMethod === 'CASH') setCashAmount(newValue);
      else if (paymentMethod === 'CREDIT') setCreditAmount(newValue);
      else setDebitAmount(newValue);
    }
  };

  const handleBackspace = () => {
    const current = paymentMethod === 'CASH' ? cashAmount : 
                   paymentMethod === 'CREDIT' ? creditAmount : debitAmount;
    const newValue = current.slice(0, -1) || '';
    if (paymentMethod === 'CASH') setCashAmount(newValue);
    else if (paymentMethod === 'CREDIT') setCreditAmount(newValue);
    else setDebitAmount(newValue);
  };

  const handleClear = () => {
    if (paymentMethod === 'CASH') setCashAmount('');
    else if (paymentMethod === 'CREDIT') setCreditAmount('');
    else if (paymentMethod === 'DEBIT') setDebitAmount('');
    else if (paymentMethod === 'SPLIT') {
      setCashAmount('');
      setCreditAmount('');
      setDebitAmount('');
    }
  };

  const handleConfirm = () => {
    const { totalPaid, balance } = calculations;

    if (totalPaid < grandTotal) {
      enqueueSnackbar(`Payment amount (${totalPaid.toFixed(2)}) is less than total (${grandTotal.toFixed(2)})`, {
        variant: 'error',
      });
      return;
    }

    if (balance < 0) {
      enqueueSnackbar('Invalid payment amount', { variant: 'error' });
      return;
    }

    onConfirm(calculations.cash, calculations.credit, calculations.debit);
    
    // Clear fields after successful payment confirmation
    setPaymentMethod('CASH');
    setCashAmount('');
    setCreditAmount('');
    setDebitAmount('');
  };

  const handleClose = () => {
    // Clear all fields when dialog closes
    setPaymentMethod('CASH');
    setCashAmount('');
    setCreditAmount('');
    setDebitAmount('');
    onClose();
  };

  // Clear fields when dialog is closed and focus input when opened
  useEffect(() => {
    if (!open) {
      setPaymentMethod('CASH');
      setCashAmount('');
      setCreditAmount('');
      setDebitAmount('');
    } else {
      // Focus the input field when dialog opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Enter Payment</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Total Due: LKR {grandTotal.toFixed(2)}
          </Typography>

          {/* Payment Method Buttons */}
          <Stack direction="row" spacing={2} sx={{ mb: 3, mt: 2 }}>
            <Button
              variant={paymentMethod === 'CASH' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => setPaymentMethod('CASH')}
              sx={{ flex: 1 }}
            >
              Cash
            </Button>
            <Button
              variant={paymentMethod === 'CREDIT' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => setPaymentMethod('CREDIT')}
              sx={{ flex: 1 }}
            >
              Credit Card
            </Button>
            <Button
              variant={paymentMethod === 'DEBIT' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => setPaymentMethod('DEBIT')}
              sx={{ flex: 1 }}
            >
              Debit Card
            </Button>
            <Button
              variant={paymentMethod === 'SPLIT' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => setPaymentMethod('SPLIT')}
              sx={{ flex: 1 }}
            >
              Split Payment
            </Button>
          </Stack>

          {/* Amount Input Fields */}
          {paymentMethod === 'SPLIT' ? (
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Cash Amount"
                    value={cashAmount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      setCashAmount(value);
                    }}
                    variant="outlined"
                    type="text"
                    inputProps={{ inputMode: 'decimal' }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Credit Card Amount"
                    value={creditAmount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      setCreditAmount(value);
                    }}
                    variant="outlined"
                    type="text"
                    inputProps={{ inputMode: 'decimal' }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Debit Card Amount"
                    value={debitAmount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      setDebitAmount(value);
                    }}
                    variant="outlined"
                    type="text"
                    inputProps={{ inputMode: 'decimal' }}
                  />
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box sx={{ mb: 3 }}>
              <TextField
                inputRef={inputRef}
                fullWidth
                autoFocus
                label={
                  paymentMethod === 'CASH'
                    ? 'Cash Amount'
                    : paymentMethod === 'CREDIT'
                    ? 'Credit Card Amount'
                    : 'Debit Card Amount'
                }
                value={
                  paymentMethod === 'CASH'
                    ? cashAmount
                    : paymentMethod === 'CREDIT'
                    ? creditAmount
                    : debitAmount
                }
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, '');
                  // Prevent multiple decimal points
                  const parts = value.split('.');
                  const sanitized = parts.length > 2 
                    ? parts[0] + '.' + parts.slice(1).join('')
                    : value;
                  
                  if (paymentMethod === 'CASH') setCashAmount(sanitized);
                  else if (paymentMethod === 'CREDIT') setCreditAmount(sanitized);
                  else setDebitAmount(sanitized);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && calculations.totalPaid >= grandTotal) {
                    handleConfirm();
                  } else if (e.key === 'Escape') {
                    handleClose();
                  }
                }}
                variant="outlined"
                type="text"
                inputProps={{ inputMode: 'decimal' }}
                placeholder="0.00"
              />
            </Box>
          )}

          {/* Numeric Keypad */}
          <Grid container spacing={1}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <Grid item xs={4} key={num}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleNumberInput(num.toString())}
                  sx={{ py: 2, fontSize: '1.2rem' }}
                >
                  {num}
                </Button>
              </Grid>
            ))}
            <Grid item xs={4}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleClear}
                sx={{ py: 2 }}
                color="error"
              >
                Clear
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleNumberInput('0')}
                sx={{ py: 2, fontSize: '1.2rem' }}
              >
                0
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleDecimal}
                sx={{ py: 2, fontSize: '1.2rem' }}
              >
                .
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleBackspace}
                sx={{ py: 1.5 }}
                startIcon={<Typography>⌫</Typography>}
              >
                Backspace
              </Button>
            </Grid>
          </Grid>

          {/* Summary */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Payment Summary
            </Typography>
            <Typography variant="body1">
              Total Paid: LKR {calculations.totalPaid.toFixed(2)}
            </Typography>
            <Typography
              variant="body1"
              color={calculations.balance >= 0 ? 'success.main' : 'error.main'}
            >
              Balance: LKR {calculations.balance.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={calculations.totalPaid < grandTotal}
        >
          Confirm Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
}

