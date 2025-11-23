import {
  Dialog,
  IconButton,
  Typography,
  DialogTitle,
  DialogContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Box,
  Grid,
  Divider,
} from '@mui/material';

import PaymentIcon from '@mui/icons-material/Payment';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useState } from 'react';
import ReturnStockDialog from './ReturnStockDialog';


import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NewPaymentCreate } from '../../../../@types/user';

type Props = {
  row: NewPaymentCreate;
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onRefresh?: VoidFunction;
};

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

export default function PaymentTableRow({
  row,
  selected,
  onSelectRow,
  onEditRow,
  onDeleteRow,
  onRefresh,
}: Props) {
  // Hooks must be called before any conditional returns
  const [open, setOpen] = useState(false);
  const [openPaidDialog, setOpenPaidDialog] = useState(false);
  const [openReturnDialog, setOpenReturnDialog] = useState(false);
  const [cashInput, setCashInput] = useState('');
  const [cash, setCash] = useState<number | ''>('');
  const [balance, setBalance] = useState<number | ''>('');

  // Safety checks for row data (after hooks)
  if (!row) {
    return null;
  }

  const { grandTotal, date, customerName, items, discount, cashPaid, wirePaid, _id } = row;
  
  // Safety checks for required fields
  if (!items || !Array.isArray(items)) {
    console.error('PaymentTableRow: items is missing or not an array', row);
    return null;
  }

  // Safe date formatting
  let formattedDate = 'N/A';
  try {
    if (date) {
      formattedDate = new Date(date).toLocaleDateString('en-GB');
      if (formattedDate === 'Invalid Date') {
        formattedDate = String(date);
      }
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    formattedDate = String(date || 'N/A');
  }

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleKeyPress = (key: string) => {
    if (key === '⌫') {
      setCashInput((prev) => prev.slice(0, -1));
    } else {
      setCashInput((prev) => prev + key);
    }
  };

  const totalItems = items.length;

  const handleClear = () => {
    setCashInput('');
    setCash('');
    setBalance('');
  };

  const handleEnter = () => {
    const value = parseFloat(cashInput);
    if (!isNaN(value) && grandTotal) {
      setCash(value);
      setBalance(value - Number(grandTotal || 0));
    }
  };
  const handleDownload = () => {
    const doc = new jsPDF();
    const marginLeft = 20;
    let currentY = 20;

    // Topper: Logo + Company Info
    // Note: For PDF, you may need to convert SVG to PNG or use a base64 encoded image
    // For now, using text-based logo
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 152, 0); // Primary orange color
    doc.text('POS', 10, 20);
    doc.setFontSize(12);
    doc.setTextColor(255, 193, 7); // Secondary gold color
    doc.text('SHOP', 10, 28);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Test Salon', 60, 15);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('BR Reg No: WCO/02152', 60, 20);

    doc.setFont('helvetica', 'bold');
    doc.text('Invoice from', 10, 35);
    doc.setFont('helvetica', 'normal');
    doc.text('Test Salon', 10, 40);
    doc.text('NO:14/R,Araliya Uyana, COLOMBO - 05', 10, 45);
    doc.text('Phone: 0112335828 / 0112441503', 10, 50);

    // Optional: Invoice to
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice to', 135, 35);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${customerName}`, 135, 40);

    // Divider
    doc.line(10, 60, 200, 60);

    // Start after header
    currentY = 70;

    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Invoice - ${customerName}`, marginLeft, currentY);
    currentY += 10;

    // Product Table
    autoTable(doc, {
      startY: currentY,
      head: [['Product Name', 'Qty', 'Price', 'Total']],
      body: items.map((item) => [
        item?.itemName || 'N/A',
        item?.quantity || 0,
        item?.itemPrice ? Number(item.itemPrice).toFixed(2) : '0.00',
        item?.quantity && item?.itemPrice ? (Number(item.quantity) * Number(item.itemPrice)).toFixed(2) : '0.00',
      ]),
      theme: 'grid',
      headStyles: { fillColor: [0, 102, 204] },
      margin: { left: marginLeft },
      styles: { fontSize: 10 },
      didDrawPage: (data) => {
        currentY = (data.cursor?.y ?? currentY) + 10;
      },
    });

    // Payment Summary
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Summary:', marginLeft, currentY);
    currentY += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Items: ${totalItems}`, marginLeft, currentY);
    doc.text(`Total Discount: ${discount ? Number(discount).toFixed(2) : '0.00'}`, marginLeft + 80, currentY);
    currentY += 6;
    doc.text(
      `Subtotal: ${items
        .reduce((sum, item) => sum + item.quantity * item.itemPrice, 0)
        .toFixed(2)}`,
      marginLeft,
      currentY
    );
    currentY += 6;
    doc.text(`Total Due: ${grandTotal ? Number(grandTotal).toFixed(2) : '0.00'}`, marginLeft, currentY);

    currentY += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Method:', marginLeft, currentY);
    currentY += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const leftX = marginLeft;
    const centerX = marginLeft + 45;
    const rightX = marginLeft + 90;

    doc.text(`Date: ${formattedDate ?? '--'}`, leftX, currentY);
    doc.text('CASH', centerX, currentY);
    doc.text(`Total Paid: ${grandTotal ? Number(grandTotal).toFixed(2) : '--'}`, rightX, currentY);

    currentY += 8;
    doc.setFontSize(13);
    doc.text('Balance:', rightX, currentY);
    const balanceLabelWidth = doc.getTextWidth('Balance:');
    doc.text(
      typeof balance === 'number' ? balance.toFixed(2) : '--',
      rightX + balanceLabelWidth + 1,
      currentY
    );

    // Save PDF
    doc.save(`invoice_${customerName}.pdf`);
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell>
          <Typography variant="subtitle2" noWrap>
            {customerName || 'N/A'}
          </Typography>
        </TableCell>
        <TableCell align="left">{formattedDate}</TableCell>
        <TableCell align="left">{grandTotal ? Number(grandTotal).toFixed(2) : '0.00'}</TableCell>
        <TableCell align="left">
          <IconButton
            onClick={handleOpen}
            sx={{
              backgroundColor: '#800000',
              color: '#ffffff',
              ':hover': {
                backgroundColor: '#ffffff',
                color: '#800000',
              },
            }}
            title="View Invoice"
          >
            <PaymentIcon />
          </IconButton>
          <IconButton
            onClick={() => setOpenPaidDialog(true)}
            sx={{
              backgroundColor: '#004d99',
              color: '#ffffff',
              ml: 1,
              ':hover': {
                backgroundColor: '#ffffff',
                color: '#004d99',
              },
            }}
            title="Payment Details"
          >
            <ReceiptIcon />
          </IconButton>
          <IconButton
            onClick={() => setOpenReturnDialog(true)}
            sx={{
              backgroundColor: '#FF9800',
              color: '#ffffff',
              ml: 1,
              ':hover': {
                backgroundColor: '#ffffff',
                color: '#FF9800',
              },
            }}
            title="Return Stock"
          >
            <EditIcon />
          </IconButton>
        </TableCell>
      </TableRow>

      {/* FULL SCREEN POPUP */}
      <Dialog open={open} onClose={handleClose} fullScreen>
        <Grid container sx={{ height: '100vh' }}>
          {/* LEFT SIDE - INVOICE */}
          <Grid
            item
            xs={12}
            md={7}
            sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}
          >
            {/* <Typography variant="h5" gutterBottom>
              Invoice Details
            </Typography>
            <Divider sx={{ mb: 2 }} /> */}
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#FF9800', height: 56 }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold', backgroundColor: '#FF9800', fontSize: '15px' }}>
                    Product
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold', backgroundColor: '#FF9800', fontSize: '15px' }}>
                    Qty
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold', backgroundColor: '#FF9800' , fontSize: '15px'}}>
                    Unit Price
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold', backgroundColor: '#FF9800' , fontSize: '15px'}}>
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff',
                      '&:hover': {
                        backgroundColor: '#e0f0ff',
                      },
                      height: 60,
                    }}
                  >
                    <TableCell sx={{ fontSize: '15px' }}>{item.itemName}</TableCell>
                    <TableCell sx={{ fontSize: '15px' }}>{item.quantity}</TableCell>
                    <TableCell sx={{ fontSize: '15px' }}>{item.itemPrice.toFixed(2)}</TableCell>
                    <TableCell sx={{ fontSize: '15px' }}>{(item.quantity * item.itemPrice).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom sx={{ color: '#FF9800' }}>
              Payment:
            </Typography>

            <Grid container spacing={1} sx={{ fontSize: '0.8rem', pr: 2 }}>
              {/* LEFT side content */}
              <Grid item xs={6}>
                <Box sx={{ ml: 5 }}>
                  <Typography variant="body2" sx={{ fontSize: '15px' }}>
                    Total Items: {totalItems}
                  </Typography>
                  <Typography variant="body2" sx={{  fontSize: '15px' }}>
                    Total Discount: {discount ? Number(discount).toFixed(2) : '0.00'}
                  </Typography>
                </Box>
              </Grid>

              {/* RIGHT side content */}
              <Grid item xs={6}>
                <Box sx={{ mr: 5, textAlign: 'right' }}>
                  <Typography variant="body2" sx={{  fontSize: '15px' }}>
                    Subtotal:{' '}
                    {items
                      .reduce((sum, item) => sum + item.quantity * item.itemPrice, 0)
                      .toFixed(2)}
                  </Typography>
                  <Typography variant="body2" sx={{  fontSize: '15px' }}>
                    Discount: {discount ? Number(discount).toFixed(2) : '0.00'}
                  </Typography>
                  <Typography variant="body2" sx={{   fontSize: '15px', fontWeight: 600 }}>
                    Total Due: {grandTotal ? Number(grandTotal).toFixed(2) : '0.00'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom sx={{ color: '#FF9800' }}>
              Payment Method:
            </Typography>

            {/* Row for Date and Cash amount */}
            <Grid container alignItems="center" sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Box display="flex" gap={2}>
                  <Typography variant="body1" sx={{ marginLeft: '40px', fontSize: '15px', }}>
                    Date: {formattedDate}
                  </Typography>
                  <Typography variant="body1">CASH</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box display="flex" justifyContent="flex-end" pr={8}>
                  <Typography variant="body1">{cash ? `${cash.toFixed(2)}` : '--'}</Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Total Paid */}
            <Box display="flex" justifyContent="flex-end" sx={{ mb: 1, pr: 7 }}>
              <Typography
                variant="h6"
                fontWeight={100}
                fontSize="0.95rem"
                sx={{
                  fontSize: '15px',
                  fontWeight: 600,
                  position: 'relative',
                  right: '80px',
                }}
              >
                Total Paid
              </Typography>
              <Typography
                variant="h4"
                fontWeight={100}
                
                color="primary"
                sx={{
                   fontSize: '15px',
                }}
              >
                {grandTotal ? `${Number(grandTotal).toFixed(2)}` : '0.00'}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="flex-end" sx={{ mb: 1, pr: 6.5 }}>
              <Typography
                variant="h4"
                sx={{
                  fontSize: '0.2rem',
                  fontWeight: 600,
                  position: 'relative',
                  right: '80px',
                  color: '#FF9800',
                }}
              >
                Balance
              </Typography>
              <Typography
                variant="h4"
                fontWeight={700}
                color="primary"
                sx={{
                  color: '#FF9800',
                }}
              >
                {typeof balance === 'number' ? `${balance.toFixed(2)}` : '--'}
              </Typography>
            </Box>
          </Grid>

          {/* RIGHT SIDE - CALCULATOR */}
          <Grid item xs={12} md={5} sx={{ p: 2, backgroundColor: '#f5f5f5', position: 'relative' }}>
            {/* <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 10, right: 10 }}>
              <CloseIcon />
            </IconButton> */}

            {/* <Typography variant="h5" gutterBottom>
              Enter Payment
            </Typography>
            <Divider sx={{ mb: 2 }} /> */}
            <Box
              sx={{
                backgroundColor: '#000000',
                color: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'stretch', // this makes children (like button) fill the full height
                height: 56, // standard MUI toolbar height (optional, can be adjusted)
                borderRadius: 1,
                mb: 2,
              }}
            >
              <Box display="flex" alignItems="center" pl={2}>
                <Typography variant="h6" sx={{ fontSize: '1rem', color: '#ffffff' }}>
                  Enter Payment
                </Typography>
              </Box>

              <Button
                onClick={handleClear}
                variant="contained"
                sx={{
                  backgroundColor: '#800000',
                  borderRadius: 0,
                  height: '100%',
                  px: 3,
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#B71C1C',
                  },
                }}
              >
                Clear
              </Button>
            </Box>

            {/* Display typed cash input */}
            <Typography variant="h6" sx={{ mb: 2 }}>
              CASH Amount: {cashInput || '0'}
            </Typography>

            {/* Calculator Number Pad */}
            <Grid container spacing={1}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', '⌫'].map((key) => (
                <Grid item xs={4} key={key}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => handleKeyPress(key)}
                    sx={{ fontSize: '1.5rem', py: 2 }}
                  >
                    {key}
                  </Button>
                </Grid>
              ))}
            </Grid>

            {/* Action buttons row: Download | Enter | Clear */}
            <Grid container spacing={2} sx={{ mt: 3 }}>
              <Grid item xs={4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  onClick={handleDownload}
                  sx={{
                    height: '80px',
                    backgroundColor: '#FF9800',
                      fontSize: '18px', 
                    '&:hover': {
                      backgroundColor: '#FFB74D',
                    },
                  }}
                >
                  Download
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleEnter}
                  sx={{
                    height: '80px',
                    backgroundColor: '#FF9800',
                    fontSize: '18px', 
                    '&:hover': {
                      backgroundColor: '#FFB74D',
                    },
                  }}
                >
                  Enter
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  onClick={handleClose}
                  sx={{ height: '80px',fontSize: '18px',  }}
                >
                  Close
                </Button>
              </Grid>
            </Grid>

            {/* Balance shown only after Enter */}
            <Typography variant="h6" sx={{ mt: 3 }}>
              Balance: {typeof balance === 'number' ? `${balance.toFixed(2)}` : '--'}
            </Typography>
          </Grid>
        </Grid>
      </Dialog>
      <Dialog
  open={openPaidDialog}
  onClose={() => setOpenPaidDialog(false)}
  fullWidth
  maxWidth="xs"
>
 
 <Dialog
  open={openPaidDialog}
  onClose={() => setOpenPaidDialog(false)}
  fullWidth
  maxWidth="xs"
  hideBackdrop
>
  <DialogTitle
    sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
  >
    Payment View
    <IconButton aria-label="close" onClick={() => setOpenPaidDialog(false)}>
      <CloseIcon />
    </IconButton>
  </DialogTitle>

  <DialogContent dividers>
    <Box display="flex" justifyContent="space-between" mb={1}>
      <Typography variant="h6"sx={{ fontWeight: 'normal',fontSize: '0.4rem'  }}>CASH Paid:</Typography>
      <Typography variant="h6"sx={{ fontWeight: 'normal' }}>LKR {Number(cashPaid).toLocaleString()}</Typography>
    </Box>
    <Box display="flex" justifyContent="space-between">
      <Typography variant="h6"sx={{ fontWeight: 'normal' }}>WireTranfer Paid:</Typography>
      <Typography variant="h6"sx={{ fontWeight: 'normal' }}>LKR {Number(wirePaid).toLocaleString()}</Typography>
    </Box>
  </DialogContent>
</Dialog>


</Dialog>

      {/* Return Stock Dialog */}
      {_id && items && Array.isArray(items) && (
        <ReturnStockDialog
          open={openReturnDialog}
          onClose={() => setOpenReturnDialog(false)}
          paymentId={_id}
          items={items.map((item) => ({
            itemId: item.itemId?.toString() || '',
            itemName: item.itemName || 'N/A',
            quantity: item.quantity || 0,
          }))}
          onSuccess={() => {
            if (onRefresh) {
              onRefresh();
            }
          }}
        />
      )}
    </>
  );
}
