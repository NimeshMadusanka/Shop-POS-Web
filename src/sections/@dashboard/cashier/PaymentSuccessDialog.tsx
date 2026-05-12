import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Stack } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import SaveIcon from '@mui/icons-material/Save';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { generateReceiptPDF } from './ReceiptPDF';
import { generateReceiptEscPos } from './ReceiptEscPos';

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
  const handlePdfPrint = async () => {
    if (paymentData) {
      const doc = await generateReceiptPDF(paymentData);
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
      onPrintAndSave();
    }
  };

  const handlePosPrint = () => {
    if (!paymentData) return;

    const escPosData = generateReceiptEscPos(paymentData);

    try {
      const blob = new Blob([escPosData], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt_${paymentData.invoiceNumber || 'receipt'}.escpos`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export ESC/POS data:', error);
    }

    onPrintAndSave();
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
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Stack sx={{ width: '100%' }} spacing={1.5}>
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
            onClick={handlePosPrint}
            variant="contained"
            color="primary"
            startIcon={<PrintIcon />}
            fullWidth
            sx={{ py: 1.5 }}
          >
            POS Print (ESC/POS)
          </Button>
          <Button
            onClick={handlePdfPrint}
            variant="contained"
            color="primary"
            startIcon={<PrintIcon />}
            fullWidth
            sx={{ py: 1.5 }}
          >
            PDF Print & Save
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

