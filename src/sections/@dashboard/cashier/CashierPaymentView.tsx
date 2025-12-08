import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Divider,
  TextField,
  Autocomplete,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PaymentIcon from '@mui/icons-material/Payment';
import EmailIcon from '@mui/icons-material/Email';
import { LoadingButton } from '@mui/lab';
import { useSnackbar } from '../../../components/snackbar';
import { useAuthContext } from '../../../auth/useAuthContext';
import { getItemData } from '../../../api/ItemApi';
import { getCusloyaltyData } from '../../../api/CusloyaltyApi';
import { createPaymentApi } from '../../../api/PaymentApi';
import { getBrandData } from '../../../api/BrandApi';
import { sendDailyReportApi } from '../../../api/EmailReportApi';
import RefundDialog from './RefundDialog';
import CashierPinDialog from './CashierPinDialog';
import PaymentEntryDialog from './PaymentEntryDialog';
import PaymentSuccessDialog from './PaymentSuccessDialog';
import { getShopData } from '../../../api/ShopApi';

interface Item {
  _id: string;
  itemName: string;
  itemPrice: string | number;
  stockQuantity?: number;
  brandId?: string;
  brandName?: string;
}

interface Brand {
  _id: string;
  brandName: string;
  description?: string;
}

interface CartItem {
  itemId: string;
  itemName: string;
  itemPrice: number;
  quantity: number;
  offPercentage?: number;
  brandId?: string;
  brandName?: string;
}

interface Discount {
  _id: string;
  itemID: string;
  itemName: string;
  offPercentage: number;
  status: 'active' | 'inactive';
}

export default function CashierPaymentView() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const companyID = user?.companyID;

  const [itemData, setItemData] = useState<Item[]>([]);
  const [brandData, setBrandData] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [filteredItemData, setFilteredItemData] = useState<Item[]>([]);
  const [discountData, setDiscountData] = useState<Discount[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Item | null>(null);
  const [quantity, setQuantity] = useState<string>('');
  const [billDiscountPercentage, setBillDiscountPercentage] = useState<number | ''>(0);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openRefundDialog, setOpenRefundDialog] = useState(false);
  const [openPinDialog, setOpenPinDialog] = useState(false);
  const [pendingRefundAction, setPendingRefundAction] = useState(false);
  const [openPaymentSuccessDialog, setOpenPaymentSuccessDialog] = useState(false);
  const [lastPaymentData, setLastPaymentData] = useState<any>(null);
  const [shopInfo, setShopInfo] = useState<any>(null);
  const [sendingReport, setSendingReport] = useState(false);
  // Admin unlock state removed - not currently used for conditional features

  // Load data
  const loadData = useCallback(async () => {
    if (!companyID) return;
    try {
      const items = await getItemData(companyID);
      const brands = await getBrandData(companyID);
      const discounts = await getCusloyaltyData(companyID);
      const shops = await getShopData(companyID);
      setItemData(items);
      setBrandData(brands);
      setDiscountData(discounts.filter((d: Discount) => d.status === 'active'));
      // Get first shop for receipt info
      if (shops && shops.length > 0) {
        setShopInfo(shops[0]);
      }
    } catch (error) {
      enqueueSnackbar('Error loading data', { variant: 'error' });
    }
  }, [companyID, enqueueSnackbar]);

  // Filter items by selected brand
  useEffect(() => {
    if (selectedBrand) {
      const filtered = itemData.filter((item) => item.brandId === selectedBrand._id);
      setFilteredItemData(filtered);
    } else {
      setFilteredItemData(itemData);
    }
  }, [selectedBrand, itemData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate totals
  const calculations = useMemo(() => {
    let subtotal = 0;
    let itemDiscount = 0;

    cartItems.forEach((item) => {
      const itemSubtotal = item.itemPrice * item.quantity;
      const discount = item.offPercentage || 0;
      const discountAmount = (itemSubtotal * discount) / 100;
      subtotal += itemSubtotal;
      itemDiscount += discountAmount;
    });

    const subtotalAfterItemDiscount = subtotal - itemDiscount;
    const billDiscountAmount =
      (subtotalAfterItemDiscount * (Number(billDiscountPercentage) || 0)) / 100;
    const grandTotal = subtotalAfterItemDiscount - billDiscountAmount;
    const totalDiscount = itemDiscount + billDiscountAmount;

    return {
      subtotal,
      itemDiscount,
      subtotalAfterItemDiscount,
      billDiscountAmount,
      grandTotal,
      totalDiscount,
    };
  }, [cartItems, billDiscountPercentage]);

  // Add product to cart
  const handleAddProduct = () => {
    if (!selectedProduct) {
      enqueueSnackbar('Please select a product', { variant: 'warning' });
      return;
    }

    const qty = Number(quantity) || 1;
    if (qty <= 0) {
      enqueueSnackbar('Quantity must be greater than 0', { variant: 'warning' });
      return;
    }

    const stock = selectedProduct.stockQuantity || 0;
    if (qty > stock) {
      enqueueSnackbar(`Only ${stock} available in stock`, { variant: 'error' });
      return;
    }

    // Check if item already in cart
    const existingIndex = cartItems.findIndex((item) => item.itemId === selectedProduct._id);
    if (existingIndex >= 0) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += qty;
      setCartItems(updated);
    } else {
      // Find discount for this item
      const discount = discountData.find((d) => d.itemID === selectedProduct._id);
      // Find brand name for this item
      const brand = brandData.find((b) => b._id === selectedProduct.brandId);
      const newItem: CartItem = {
        itemId: selectedProduct._id,
        itemName: selectedProduct.itemName,
        itemPrice: Number(selectedProduct.itemPrice),
        quantity: qty,
        offPercentage: discount?.offPercentage || 0,
        brandId: selectedProduct.brandId,
        brandName: brand?.brandName || '',
      };
      setCartItems([...cartItems, newItem]);
    }

    setSelectedProduct(null);
    setQuantity('');
  };

  // Remove product from cart
  const handleRemoveProduct = (index: number) => {
    const updated = cartItems.filter((_, i) => i !== index);
    setCartItems(updated);
  };

  // Update quantity
  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    // Allow 0 or empty to remove the item
    if (!newQuantity || newQuantity <= 0) {
      handleRemoveProduct(index);
      return;
    }
    const item = cartItems[index];
    const product = itemData.find((p) => p._id === item.itemId);
    const stock = product?.stockQuantity || 0;
    if (newQuantity > stock) {
      enqueueSnackbar(`Only ${stock} available in stock`, { variant: 'error' });
      return;
    }
    const updated = [...cartItems];
    updated[index].quantity = newQuantity;
    setCartItems(updated);
  };

  // Handle payment - open payment entry dialog
  const handlePay = () => {
    if (cartItems.length === 0) {
      enqueueSnackbar('Please add at least one product', { variant: 'warning' });
      return;
    }
    if (calculations.grandTotal <= 0) {
      enqueueSnackbar('Total must be greater than 0', { variant: 'warning' });
      return;
    }
    // Open payment entry dialog
    setOpenPaymentDialog(true);
  };

  // Final payment processing
  const processPaymentFinal = async (
    finalCashPaid: number,
    finalCreditPaid: number,
    finalDebitPaid: number
  ) => {
    try {
      if (!companyID) {
        enqueueSnackbar('Company ID is missing', { variant: 'error' });
        return;
      }

      if (cartItems.length === 0) {
        enqueueSnackbar('Cart is empty', { variant: 'error' });
        return;
      }

      const formattedItems = cartItems.map((item) => ({
        itemId: item.itemId,
        itemName: item.itemName,
        itemPrice: item.itemPrice,
        quantity: item.quantity,
        brandId: item.brandId,
        brandName: item.brandName,
        offPercentage: item.offPercentage || 0,
      }));

      // Generate invoice number format: YIVAYYMMDDHHMMSS
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const invoiceNumber = `YIVA${year}${month}${day}${hours}${minutes}${seconds}`;

      // Recalculate totals to ensure we have the latest values
      let subtotal = 0;
      let itemDiscount = 0;

      cartItems.forEach((item) => {
        const itemSubtotal = item.itemPrice * item.quantity;
        const discount = item.offPercentage || 0;
        const discountAmount = (itemSubtotal * discount) / 100;
        subtotal += itemSubtotal;
        itemDiscount += discountAmount;
      });

      const subtotalAfterItemDiscount = subtotal - itemDiscount;
      const billDiscountAmount =
        (subtotalAfterItemDiscount * (Number(billDiscountPercentage) || 0)) / 100;
      const grandTotal = subtotalAfterItemDiscount - billDiscountAmount;

      const payload: any = {
        items: formattedItems,
        addLoyalty: false,
        newoffPercentage: 0,
        billDiscountPercentage: Number(billDiscountPercentage) || 0,
        date: new Date().toISOString().split('T')[0],
        companyID,
        cashPaid: finalCashPaid,
        creditPaid: finalCreditPaid,
        debitPaid: finalDebitPaid,
        invoiceNumber,
      };

      const savedPayment = await createPaymentApi(payload, true);
      
      enqueueSnackbar('Payment processed successfully!', { variant: 'success' });
      
      // Prepare payment data for receipt
      const paymentData = {
        ...payload,
        ...savedPayment,
        invoiceNumber,
        cashierName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || 'Cashier',
        shopInfo: shopInfo ? {
          shopName: shopInfo.shopName,
          address: shopInfo.address,
          contactPhone: shopInfo.contactPhone,
        } : undefined,
        grandTotal: grandTotal,
        discount: itemDiscount,
        billDiscountAmount: billDiscountAmount,
        billDiscountPercentage: Number(billDiscountPercentage) || 0,
        items: formattedItems, // Already includes offPercentage
      };

      // Store payment data and show success dialog
      setLastPaymentData(paymentData);
      setOpenPaymentDialog(false);
      // Reload item data to update stock quantities immediately after payment
      loadData();
      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        setOpenPaymentSuccessDialog(true);
      }, 100);

      // Don't reset form yet - wait for print/save decision
    } catch (error: any) {
      console.error('Payment processing error:', error);
      enqueueSnackbar(error.message || 'Error processing payment', { variant: 'error' });
    }
  };

  // Handle payment confirmation from dialog
  const handlePaymentConfirm = async (
    cashAmount: number,
    creditAmount: number,
    debitAmount: number
  ) => {
    await processPaymentFinal(cashAmount, creditAmount, debitAmount);
  };

  // Handle print and save
  const handlePrintAndSave = () => {
    // Form will be reset after this
    resetForm();
    setOpenPaymentSuccessDialog(false);
    // Reload item data to update stock quantities
    loadData();
  };

  // Handle save only
  const handleSaveOnly = () => {
    // Form will be reset after this
    resetForm();
    setOpenPaymentSuccessDialog(false);
    // Reload item data to update stock quantities
    loadData();
  };

  // Reset form after payment
  const resetForm = () => {
    setCartItems([]);
    setBillDiscountPercentage(0);
    setSelectedProduct(null);
    setQuantity('');
    setSelectedBrand(null);
    setLastPaymentData(null);
  };

  // Handle refund dialog
  const handleRefund = () => {
    // Require PIN verification for refund operations
    if (user?.role === 'cashier') {
      setPendingRefundAction(true);
      setOpenPinDialog(true);
    } else {
      setOpenRefundDialog(true);
    }
  };

  // Handle send daily report
  const handleSendDailyReport = async () => {
    if (!companyID) {
      enqueueSnackbar('Company ID is missing', { variant: 'error' });
      return;
    }

    setSendingReport(true);
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Get shop ID if available
      const shopId = shopInfo?._id || null;

      await sendDailyReportApi({
        companyID,
        date: todayStr,
        shopId: shopId || undefined,
      });

      enqueueSnackbar('Daily report sent successfully!', { variant: 'success' });
    } catch (error: any) {
      console.error('Error sending daily report:', error);
      enqueueSnackbar(error.response?.data?.message || 'Error sending daily report', { variant: 'error' });
    } finally {
      setSendingReport(false);
    }
  };


  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Grid container sx={{ flex: 1, overflow: 'hidden' }}>
        {/* LEFT SIDE - INVOICE */}
        <Grid item xs={12} md={7} sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2, overflow: 'auto' }}>
          {/* Product Selection */}
          <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Add Product
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <Autocomplete
                  fullWidth
                  options={brandData}
                  getOptionLabel={(option) => option?.brandName || ''}
                  value={selectedBrand}
                  onChange={(e, newValue) => {
                    setSelectedBrand(newValue);
                    setSelectedProduct(null); // Clear selected product when brand changes
                  }}
                  renderInput={(params) => <TextField {...params} label="Select Brand" />}
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <Autocomplete
                  fullWidth
                  options={filteredItemData}
                  getOptionLabel={(option) => {
                    const stock = option?.stockQuantity ?? 0;
                    return `${option?.itemName || ''} (Stock: ${stock})`;
                  }}
                  value={selectedProduct}
                  onChange={(e, newValue) => setSelectedProduct(newValue)}
                  disabled={!selectedBrand}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label={selectedBrand ? "Select Product" : "Select Brand First"} 
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  inputProps={{ min: 0 }}
                  placeholder="Enter quantity"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleAddProduct}
                  startIcon={<AddIcon />}
                  color="primary"
                >
                  Add
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Product Table */}
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main', height: 56 }}>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold', backgroundColor: 'primary.main', fontSize: '15px' }}>
                  Product
                </TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold', backgroundColor: 'primary.main', fontSize: '15px' }}>
                  Qty
                </TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold', backgroundColor: 'primary.main', fontSize: '15px' }}>
                  Unit Price
                </TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold', backgroundColor: 'primary.main', fontSize: '15px' }}>
                  Discount
                </TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold', backgroundColor: 'primary.main', fontSize: '15px' }}>
                  Total
                </TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold', backgroundColor: 'primary.main', fontSize: '15px' }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cartItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No products added
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                cartItems.map((item, index) => {
                  const itemSubtotal = item.itemPrice * item.quantity;
                  const discountAmount = (itemSubtotal * (item.offPercentage || 0)) / 100;
                  const itemTotal = itemSubtotal - discountAmount;
                  return (
                    <TableRow
                      key={index}
                      sx={{
                        backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff',
                        '&:hover': { backgroundColor: '#e0f0ff' },
                        height: 60,
                      }}
                    >
                      <TableCell sx={{ fontSize: '15px' }}>{item.itemName}</TableCell>
                      <TableCell sx={{ fontSize: '15px' }}>
                        <TextField
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || val === '0') {
                              handleRemoveProduct(index);
                            } else {
                              handleUpdateQuantity(index, Number(val) || 1);
                            }
                          }}
                          onBlur={(e) => {
                            if (!e.target.value || Number(e.target.value) <= 0) {
                              handleRemoveProduct(index);
                            }
                          }}
                          inputProps={{ min: 0, style: { textAlign: 'center', width: '60px' } }}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '15px' }}>{item.itemPrice.toFixed(2)}</TableCell>
                      <TableCell sx={{ fontSize: '15px' }}>
                        {(item.offPercentage || 0) > 0 ? `${item.offPercentage}%` : '0%'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '15px' }}>{itemTotal.toFixed(2)}</TableCell>
                      <TableCell>
                        <IconButton color="error" onClick={() => handleRemoveProduct(index)} size="small">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <Divider sx={{ my: 3 }} />

          {/* Payment Summary */}
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
            Payment:
          </Typography>

          <Grid container spacing={1} sx={{ fontSize: '0.8rem', pr: 2 }}>
            <Grid item xs={6}>
              <Box sx={{ ml: 5 }}>
                <Typography variant="body2" sx={{ fontSize: '15px' }}>
                  Total Items: {cartItems.length}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '15px' }}>
                  Total Discount: {calculations.totalDiscount.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ mr: 5, textAlign: 'right' }}>
                <Typography variant="body2" sx={{ fontSize: '15px' }}>
                  Subtotal: {calculations.subtotal.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '15px' }}>
                  Discount: {calculations.totalDiscount.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '15px', fontWeight: 600 }}>
                  Total Due: {calculations.grandTotal.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Bill Discount Input */}
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <TextField
              fullWidth
              label="Bill Discount (%)"
              type="number"
              value={billDiscountPercentage}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  setBillDiscountPercentage('');
                  return;
                }
                const num = Number(value);
                setBillDiscountPercentage(Number.isNaN(num) ? 0 : num);
              }}
              inputProps={{ min: 0, max: 100, step: 0.01 }}
              helperText="Apply discount to entire bill after item discounts"
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Refund Button */}
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={handleRefund}
              sx={{ mr: 2 }}
            >
              Refund
            </Button>
          </Box>
        </Grid>

        {/* RIGHT SIDE - ACTION BUTTONS */}
        <Grid item xs={12} md={5} sx={{ p: 2, backgroundColor: '#f5f5f5', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Action buttons */}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                onClick={handlePay}
                startIcon={<PaymentIcon />}
                color="primary"
                sx={{
                  height: '80px',
                  fontSize: '18px',
                }}
              >
                Pay
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                onClick={handleRefund}
                sx={{ height: '80px', fontSize: '18px' }}
              >
                Refund
              </Button>
            </Grid>
            <Grid item xs={12}>
              <LoadingButton
                fullWidth
                variant="outlined"
                color="primary"
                onClick={handleSendDailyReport}
                loading={sendingReport}
                startIcon={<EmailIcon />}
                sx={{ height: '80px', fontSize: '18px' }}
              >
                Send Daily Report
              </LoadingButton>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <PaymentEntryDialog
        open={openPaymentDialog}
        onClose={() => setOpenPaymentDialog(false)}
        grandTotal={calculations.grandTotal}
        onConfirm={handlePaymentConfirm}
      />

      <RefundDialog
        open={openRefundDialog}
        onClose={() => setOpenRefundDialog(false)}
        companyID={companyID || ''}
        onRefundSuccess={() => {
          // Refresh item data to show updated stock after refund
          loadData();
        }}
      />

      <CashierPinDialog
        open={openPinDialog}
        onClose={() => {
          setOpenPinDialog(false);
          setPendingRefundAction(false);
        }}
        onSuccess={() => {
          setOpenPinDialog(false);
          if (pendingRefundAction) {
            setOpenRefundDialog(true);
            setPendingRefundAction(false);
          }
        }}
        title="Cashier PIN Verification"
        description="Enter your PIN to proceed with refund operation"
        requireCurrentUser={true}
      />

      <PaymentSuccessDialog
        open={openPaymentSuccessDialog}
        onClose={() => {
          setOpenPaymentSuccessDialog(false);
          resetForm();
        }}
        paymentData={lastPaymentData}
        onPrintAndSave={handlePrintAndSave}
        onSaveOnly={handleSaveOnly}
      />
    </Box>
  );
}

