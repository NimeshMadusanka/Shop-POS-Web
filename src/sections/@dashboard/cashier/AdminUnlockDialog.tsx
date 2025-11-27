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
import { useAdminUnlock } from '../../../contexts/AdminUnlockContext';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

// Admin password - should be stored in environment variable in production
const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'admin123';

export default function AdminUnlockDialog({ open, onClose, onSuccess }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { unlockAdmin } = useAdminUnlock();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!password.trim()) {
      enqueueSnackbar('Please enter password', { variant: 'warning' });
      return;
    }

    setLoading(true);
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (password.trim() === ADMIN_PASSWORD) {
      unlockAdmin(); // Unlock admin access
      enqueueSnackbar('Admin access granted', { variant: 'success' });
      handleClose();
      onSuccess();
    } else {
      enqueueSnackbar('Incorrect password', { variant: 'error' });
    }
    setLoading(false);
  };

  const handleClose = () => {
    setPassword('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Admin Access</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter admin password to unlock additional features
          </Typography>
          <TextField
            fullWidth
            type="password"
            label="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
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
          disabled={!password.trim()}
          color="primary"
        >
          Unlock
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

