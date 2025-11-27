import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
} from '@mui/material';
import PinNumberPad from '../../components/pin-number-pad/PinNumberPad';

type Props = {
  open: boolean;
  onClose: () => void;
  onPinComplete: (pin: string) => void;
  email: string;
};

export default function PinEntryDialog({ open, onClose, onPinComplete, email }: Props) {
  const [pin, setPin] = useState('');

  useEffect(() => {
    if (open) {
      setPin('');
    }
  }, [open]);

  const handlePinChange = (newPin: string) => {
    setPin(newPin);
    if (newPin.length === 6) {
      // Auto-submit when PIN is complete
      setTimeout(() => {
        onPinComplete(newPin);
        setPin('');
      }, 200);
    }
  };

  const handleClose = () => {
    setPin('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1,
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h5" align="center">
          Enter PIN
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          {email}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <PinNumberPad pin={pin} onPinChange={handlePinChange} maxLength={6} />
        </Box>
      </DialogContent>
    </Dialog>
  );
}

