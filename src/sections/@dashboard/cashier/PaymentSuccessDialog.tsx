import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Stack } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import SaveIcon from '@mui/icons-material/Save';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { generateReceiptPDF } from './ReceiptPDF';

type Props = {
  open: boolean;
  onClose: () => void;
  paymentData: any;
  onPrintAndSave: () => void;
  onSaveOnly: () => void;
};

export default function PaymentSuccessDialog({
  open,
  onClose,
  paymentData,
  onPrintAndSave,
  onSaveOnly,
}: Props) {
  const handlePrint = async () => {
    if (paymentData) {
      const doc = await generateReceiptPDF(paymentData);
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
      onPrintAndSave();
    }
  };

  const handleSave = async () => {
    if (paymentData) {
      const doc = await generateReceiptPDF(paymentData);
      const filename = `receipt_${paymentData.invoiceNumber || 'receipt'}.pdf`;
      doc.save(filename);
      onSaveOnly();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Payment Successful</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="success.main" gutterBottom>
            Payment Processed Successfully!
          </Typography>
          {paymentData?.invoiceNumber && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Invoice Number: {paymentData.invoiceNumber}
            </Typography>
          )}
          <Typography variant="body1" sx={{ mt: 3, mb: 2 }}>
            Would you like to print the receipt?
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Stack direction="row" spacing={2} sx={{ width: '100%', p: 2 }}>
          <Button
            onClick={handleSave}
            variant="outlined"
            startIcon={<SaveIcon />}
            fullWidth
            sx={{ py: 1.5 }}
          >
            Save Only
          </Button>
          <Button
            onClick={handlePrint}
            variant="contained"
            color="primary"
            startIcon={<PrintIcon />}
            fullWidth
            sx={{ py: 1.5 }}
          >
            Print & Save
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

