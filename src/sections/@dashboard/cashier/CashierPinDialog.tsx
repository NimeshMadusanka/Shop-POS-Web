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
  InputAdornment,
  IconButton,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useSnackbar } from '../../../components/snackbar';
import Iconify from '../../../components/iconify';
import { useAuthContext } from '../../../auth/useAuthContext';
import { loginPinApi } from '../../../api/UserApi';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
  requireCurrentUser?: boolean; // If true, verifies PIN against current logged-in user
};

export default function CashierPinDialog({
  open,
  onClose,
  onSuccess,
  title = 'Cashier PIN Verification',
  description = 'Enter your 6-digit PIN to continue',
  requireCurrentUser = false,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { user, loginPin } = useAuthContext();
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const handleSubmit = async () => {
    if (!pin.trim()) {
      enqueueSnackbar('Please enter PIN', { variant: 'warning' });
      return;
    }

    if (!/^\d{6}$/.test(pin)) {
      enqueueSnackbar('PIN must be exactly 6 digits', { variant: 'error' });
      return;
    }

    setLoading(true);

    try {
      if (requireCurrentUser && user) {
        // Verify PIN for current user
        const userEmail = user.email;
        if (!userEmail) {
          enqueueSnackbar('User email not found', { variant: 'error' });
          setLoading(false);
          return;
        }

        try {
          await loginPinApi(userEmail, pin);
          enqueueSnackbar('PIN verified successfully', { variant: 'success' });
          handleClose();
          onSuccess();
        } catch (error: any) {
          enqueueSnackbar(
            error?.response?.data?.message || 'Invalid PIN. Please try again.',
            { variant: 'error' }
          );
        }
      } else {
        // Login with PIN (requires email)
        if (!email.trim()) {
          enqueueSnackbar('Email is required', { variant: 'error' });
          setLoading(false);
          return;
        }

        if (!loginPin) {
          enqueueSnackbar('PIN login is not available', { variant: 'error' });
          setLoading(false);
          return;
        }

        await loginPin(email, pin);
        enqueueSnackbar('Login successful', { variant: 'success' });
        handleClose();
        onSuccess();
      }
    } catch (error: any) {
      enqueueSnackbar(
        error?.response?.data?.message || 'PIN verification failed. Please try again.',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPin('');
    setEmail('');
    onClose();
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setPin(value);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {description}
          </Typography>

          {!requireCurrentUser && (
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              autoFocus
              required
            />
          )}

          <TextField
            fullWidth
            type={showPin ? 'text' : 'password'}
            label="PIN (6 digits)"
            value={pin}
            onChange={handlePinChange}
            inputProps={{
              maxLength: 6,
              inputMode: 'numeric',
              pattern: '[0-9]*',
            }}
            autoFocus={requireCurrentUser}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPin(!showPin)} edge="end">
                    <Iconify icon={showPin ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            helperText="Enter exactly 6 digits"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && pin.length === 6) {
                handleSubmit();
              }
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <LoadingButton
          variant="contained"
          onClick={handleSubmit}
          loading={loading}
          disabled={!pin.trim() || pin.length !== 6 || (!requireCurrentUser && !email.trim())}
          color="primary"
        >
          {requireCurrentUser ? 'Verify' : 'Login'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

