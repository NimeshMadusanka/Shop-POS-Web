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
  MenuItem,
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
import CashierPinDialog from './CashierPinDialog';
import PaymentEntryDialog from './PaymentEntryDialog';
import PaymentSuccessDialog from './PaymentSuccessDialog';
import { getShopData } from '../../../api/ShopApi';
import RefundFlowDialog from './RefundFlowDialog';
import {
  computeLineEconomics,
  DISCOUNT_TYPE_OPTIONS,
  DiscountType,
  normalizeDiscountType,
} from '../../../utils/discountCalc';

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
  commissionPercent?: number;
}

interface CartItem {
  itemId: string;
  itemName: string;
  itemPrice: number;
  quantity: number;
  offPercentage?: number;
  brandOffPercentage?: number;
  storeOffPercentage?: number;
  discountType?: DiscountType;
  brandId?: string;
  brandName?: string;
  commissionPercent?: number;
}

interface Discount {
  _id: string;
  itemID: string;
  itemName: string;
  offPercentage: number;
  discountType?: DiscountType;
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
  const [billBrandDiscountPercentage, setBillBrandDiscountPercentage] = useState<number | ''>(0);
  const [billStoreDiscountPercentage, setBillStoreDiscountPercentage] = useState<number | ''>(0);
  const [billDiscountType, setBillDiscountType] = useState<DiscountType>('brand');
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openRefundFlowDialog, setOpenRefundFlowDialog] = useState(false);
  const [openPinDialog, setOpenPinDialog] = useState(false);
  const [pendingRefundAction, setPendingRefundAction] = useState<boolean>(false);
  const [openPaymentSuccessDialog, setOpenPaymentSuccessDialog] = useState(false);
  const [lastPaymentData, setLastPaymentData] = useState<any>(null);
  const [shopInfo, setShopInfo] = useState<any>(null);
  const [sendingReport, setSendingReport] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [, setSummaryKey] = useState(0);
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
    let billDiscountAmount = 0;
    let grandTotal = 0;
    const billPct = Number(billDiscountPercentage) || 0;
    const billType = normalizeDiscountType(billDiscountType);
    const billBrandPct = Number(billBrandDiscountPercentage) || 0;
    const billStorePct = Number(billStoreDiscountPercentage) || 0;

    cartItems.forEach((item) => {
      const lineGross = item.itemPrice * item.quantity;
      subtotal += lineGross;
      const commissionPercent = Number(item.commissionPercent) || 0;
      const itemType = normalizeDiscountType(item.discountType);

      const itemLine = computeLineEconomics({
        lineGross,
        itemOffPercent: item.offPercentage || 0,
        itemDiscountType: itemType,
        itemBrandOffPercent: Number(item.brandOffPercentage) || 0,
        itemStoreOffPercent: Number(item.storeOffPercentage) || 0,
        commissionPercent,
      });
      const fullLine = computeLineEconomics({
        lineGross,
        itemOffPercent: item.offPercentage || 0,
        itemDiscountType: itemType,
        itemBrandOffPercent: Number(item.brandOffPercentage) || 0,
        itemStoreOffPercent: Number(item.storeOffPercentage) || 0,
        billDiscountPercent: billPct,
        billDiscountType: billType,
        billBrandOffPercent: billBrandPct,
        billStoreOffPercent: billStorePct,
        commissionPercent,
      });

      itemDiscount += itemLine.discountAmount;
      billDiscountAmount += fullLine.discountAmount - itemLine.discountAmount;
      grandTotal += fullLine.lineNet;
    });

    return {
      subtotal,
      itemDiscount,
      subtotalAfterItemDiscount: subtotal - itemDiscount,
      billDiscountAmount,
      grandTotal,
      totalDiscount: itemDiscount + billDiscountAmount,
    };
  }, [
    cartItems,
    billDiscountPercentage,
    billDiscountType,
    billBrandDiscountPercentage,
    billStoreDiscountPercentage,
  ]);

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
      const discountType = normalizeDiscountType(discount?.discountType);
      const off = discount?.offPercentage || 0;
      const brandOff = discountType === 'store' ? 0 : off;
      const storeOff = discountType === 'brand' ? 0 : discountType === 'store' ? off : 0;
      const newItem: CartItem = {
        itemId: selectedProduct._id,
        itemName: selectedProduct.itemName,
        itemPrice: Number(selectedProduct.itemPrice),
        quantity: qty,
        offPercentage: off,
        brandOffPercentage: brandOff,
        storeOffPercentage: storeOff,
        discountType,
        brandId: selectedProduct.brandId,
        brandName: brand?.brandName || '',
        commissionPercent: Number(brand?.commissionPercent) || 0,
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

  const clampDiscountPercent = (value: number) => Math.min(100, Math.max(0, value));

  const syncItemOffPercentage = (item: CartItem) => {
    const type = normalizeDiscountType(item.discountType);
    const brandOff = Number(item.brandOffPercentage) || 0;
    const storeOff = Number(item.storeOffPercentage) || 0;
    if (type === 'combined') return brandOff + storeOff;
    if (type === 'store') return storeOff;
    return brandOff;
  };

  const handleUpdateItemDiscountType = (index: number, nextType: DiscountType) => {
    const updated = [...cartItems];
    const current = updated[index];
    const brandOff = Number(current.brandOffPercentage) || 0;
    const storeOff = Number(current.storeOffPercentage) || 0;
    const legacyOff = Number(current.offPercentage) || 0;

    let nextBrand = brandOff;
    let nextStore = storeOff;

    if (nextType === 'brand') {
      nextBrand = brandOff || legacyOff;
      nextStore = 0;
    } else if (nextType === 'store') {
      nextStore = storeOff || legacyOff;
      nextBrand = 0;
    } else if (nextType === 'combined') {
      nextBrand = brandOff || (storeOff ? 0 : legacyOff);
      nextStore = storeOff;
    }

    const nextItem: CartItem = {
      ...current,
      discountType: nextType,
      brandOffPercentage: nextBrand,
      storeOffPercentage: nextStore,
    };
    nextItem.offPercentage = syncItemOffPercentage(nextItem);
    updated[index] = nextItem;
    setCartItems(updated);
  };

  const handleUpdateItemBrandDiscount = (index: number, rawValue: string) => {
    const updated = [...cartItems];
    const current = updated[index];
    const brandOff = rawValue === '' ? 0 : clampDiscountPercent(Number(rawValue) || 0);
    if (rawValue !== '' && Number.isNaN(Number(rawValue))) return;
    const nextItem: CartItem = {
      ...current,
      brandOffPercentage: brandOff,
      storeOffPercentage:
        normalizeDiscountType(current.discountType) === 'brand'
          ? 0
          : Number(current.storeOffPercentage) || 0,
    };
    nextItem.offPercentage = syncItemOffPercentage(nextItem);
    updated[index] = nextItem;
    setCartItems(updated);
  };

  const handleUpdateItemStoreDiscount = (index: number, rawValue: string) => {
    const updated = [...cartItems];
    const current = updated[index];
    const storeOff = rawValue === '' ? 0 : clampDiscountPercent(Number(rawValue) || 0);
    if (rawValue !== '' && Number.isNaN(Number(rawValue))) return;
    const nextItem: CartItem = {
      ...current,
      storeOffPercentage: storeOff,
      brandOffPercentage:
        normalizeDiscountType(current.discountType) === 'store'
          ? 0
          : Number(current.brandOffPercentage) || 0,
    };
    nextItem.offPercentage = syncItemOffPercentage(nextItem);
    updated[index] = nextItem;
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
    if (processingPayment) return;
    try {
      setProcessingPayment(true);
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
        brandOffPercentage: Number(item.brandOffPercentage) || 0,
        storeOffPercentage: Number(item.storeOffPercentage) || 0,
        discountType: normalizeDiscountType(item.discountType),
      }));

      const { grandTotal, itemDiscount, billDiscountAmount } = calculations;
      const billBrandPct = Number(billBrandDiscountPercentage) || 0;
      const billStorePct = Number(billStoreDiscountPercentage) || 0;
      const commissionAmount = cartItems.reduce((sum, item) => {
        const commissionPercent = Number(item.commissionPercent) || 0;
        const lineGross = item.itemPrice * item.quantity;
        const line = computeLineEconomics({
          lineGross,
          itemOffPercent: item.offPercentage || 0,
          itemDiscountType: normalizeDiscountType(item.discountType),
          itemBrandOffPercent: Number(item.brandOffPercentage) || 0,
          itemStoreOffPercent: Number(item.storeOffPercentage) || 0,
          billDiscountPercent: Number(billDiscountPercentage) || 0,
          billDiscountType: normalizeDiscountType(billDiscountType),
          billBrandOffPercent: billBrandPct,
          billStoreOffPercent: billStorePct,
          commissionPercent,
        });
        return sum + line.shopShare;
      }, 0);

      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
        today.getDate()
      ).padStart(2, '0')}`;

      const payload: any = {
        items: formattedItems,
        addLoyalty: false,
        newoffPercentage: 0,
        billDiscountPercentage: Number(billDiscountPercentage) || 0,
        billDiscountType: normalizeDiscountType(billDiscountType),
        billBrandDiscountPercentage: billBrandPct,
        billStoreDiscountPercentage: billStorePct,
        date: todayStr,
        companyID,
        cashPaid: finalCashPaid,
        creditPaid: finalCreditPaid,
        debitPaid: finalDebitPaid,
        commission: commissionAmount > 0,
        commissionAmount: Number(commissionAmount.toFixed(2)),
      };

      const savedPayment = await createPaymentApi(payload, true);
      
      enqueueSnackbar('Payment processed successfully!', { variant: 'success' });
      
      // Prepare payment data for receipt
      const paymentData = {
        ...payload,
        ...savedPayment,
        invoiceNumber: savedPayment?.invoiceNumber,
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
        billDiscountType: normalizeDiscountType(billDiscountType),
        billBrandDiscountPercentage: billBrandPct,
        billStoreDiscountPercentage: billStorePct,
        items: formattedItems, // Already includes offPercentage
      };

      // Store payment data and show success dialog
      setLastPaymentData(paymentData);
      setSummaryKey((prev) => prev + 1);
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
    } finally {
      setProcessingPayment(false);
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
    setBillBrandDiscountPercentage(0);
    setBillStoreDiscountPercentage(0);
    setBillDiscountType('brand');
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
      setOpenRefundFlowDialog(true);
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
      // Business calendar day (local), not UTC — avoids wrong day after ~18:30 in Sri Lanka
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
        today.getDate()
      ).padStart(2, '0')}`;
      
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
                  Discount Type
                </TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold', backgroundColor: 'primary.main', fontSize: '15px' }}>
                  Brand Disc. (%)
                </TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold', backgroundColor: 'primary.main', fontSize: '15px' }}>
                  Store Disc. (%)
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
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No products added
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                cartItems.map((item, index) => {
                  const lineGross = item.itemPrice * item.quantity;
                  const itemType = normalizeDiscountType(item.discountType);
                  const itemTotal = computeLineEconomics({
                    lineGross,
                    itemOffPercent: item.offPercentage || 0,
                    itemDiscountType: itemType,
                    itemBrandOffPercent: Number(item.brandOffPercentage) || 0,
                    itemStoreOffPercent: Number(item.storeOffPercentage) || 0,
                    commissionPercent: Number(item.commissionPercent) || 0,
                  }).lineNet;
                  const showBrand = itemType === 'brand' || itemType === 'combined';
                  const showStore = itemType === 'store' || itemType === 'combined';
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
                      <TableCell sx={{ fontSize: '15px', minWidth: 160 }}>
                        <TextField
                          select
                          size="small"
                          value={itemType}
                          onChange={(e) =>
                            handleUpdateItemDiscountType(index, e.target.value as DiscountType)
                          }
                          sx={{ minWidth: 150 }}
                        >
                          {DISCOUNT_TYPE_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell sx={{ fontSize: '15px' }}>
                        {showBrand ? (
                          <TextField
                            type="number"
                            value={item.brandOffPercentage === undefined ? '' : item.brandOffPercentage}
                            onChange={(e) => handleUpdateItemBrandDiscount(index, e.target.value)}
                            onBlur={(e) => {
                              if (e.target.value === '') {
                                handleUpdateItemBrandDiscount(index, '0');
                              }
                            }}
                            inputProps={{
                              min: 0,
                              max: 100,
                              step: 0.01,
                              style: { textAlign: 'center', width: '56px' },
                            }}
                            size="small"
                            placeholder="0"
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontSize: '15px' }}>
                        {showStore ? (
                          <TextField
                            type="number"
                            value={item.storeOffPercentage === undefined ? '' : item.storeOffPercentage}
                            onChange={(e) => handleUpdateItemStoreDiscount(index, e.target.value)}
                            onBlur={(e) => {
                              if (e.target.value === '') {
                                handleUpdateItemStoreDiscount(index, '0');
                              }
                            }}
                            inputProps={{
                              min: 0,
                              max: 100,
                              step: 0.01,
                              style: { textAlign: 'center', width: '56px' },
                            }}
                            size="small"
                            placeholder="0"
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            —
                          </Typography>
                        )}
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
                  Item Discount: {calculations.itemDiscount.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '15px' }}>
                  Bill Discount: {calculations.billDiscountAmount.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ mr: 5, textAlign: 'right' }}>
                <Typography variant="body2" sx={{ fontSize: '15px' }}>
                  Subtotal: {calculations.subtotal.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '15px' }}>
                  Total Discount: {calculations.totalDiscount.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '15px', fontWeight: 600 }}>
                  Total Due: {calculations.grandTotal.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Bill Discount Input */}
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  label="Bill Discount Type"
                  value={billDiscountType}
                  onChange={(e) => {
                    const nextType = e.target.value as DiscountType;
                    setBillDiscountType(nextType);
                    if (nextType === 'brand') {
                      setBillStoreDiscountPercentage(0);
                      setBillDiscountPercentage(Number(billBrandDiscountPercentage) || 0);
                    } else if (nextType === 'store') {
                      setBillBrandDiscountPercentage(0);
                      setBillDiscountPercentage(Number(billStoreDiscountPercentage) || 0);
                    } else {
                      setBillDiscountPercentage(
                        (Number(billBrandDiscountPercentage) || 0) +
                          (Number(billStoreDiscountPercentage) || 0)
                      );
                    }
                  }}
                  helperText="Combined lets you enter Brand Discount and Store Discount together"
                >
                  {DISCOUNT_TYPE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              {(billDiscountType === 'brand' || billDiscountType === 'combined') && (
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Brand Discount (%)"
                    type="number"
                    value={billBrandDiscountPercentage}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        setBillBrandDiscountPercentage('');
                        setBillDiscountPercentage(
                          billDiscountType === 'combined'
                            ? Number(billStoreDiscountPercentage) || 0
                            : 0
                        );
                        return;
                      }
                      const num = Number(value);
                      if (Number.isNaN(num)) return;
                      const clamped = clampDiscountPercent(num);
                      setBillBrandDiscountPercentage(clamped);
                      setBillDiscountPercentage(
                        billDiscountType === 'combined'
                          ? clamped + (Number(billStoreDiscountPercentage) || 0)
                          : clamped
                      );
                    }}
                    inputProps={{ min: 0, max: 100, step: 0.01 }}
                    helperText="Price cut, then split by commission"
                  />
                </Grid>
              )}
              {(billDiscountType === 'store' || billDiscountType === 'combined') && (
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Store Discount (%)"
                    type="number"
                    value={billStoreDiscountPercentage}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        setBillStoreDiscountPercentage('');
                        setBillDiscountPercentage(
                          billDiscountType === 'combined'
                            ? Number(billBrandDiscountPercentage) || 0
                            : 0
                        );
                        return;
                      }
                      const num = Number(value);
                      if (Number.isNaN(num)) return;
                      const clamped = clampDiscountPercent(num);
                      setBillStoreDiscountPercentage(clamped);
                      setBillDiscountPercentage(
                        billDiscountType === 'combined'
                          ? (Number(billBrandDiscountPercentage) || 0) + clamped
                          : clamped
                      );
                    }}
                    inputProps={{ min: 0, max: 100, step: 0.01 }}
                    helperText="Taken from store commission only"
                  />
                </Grid>
              )}
            </Grid>
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

      <CashierPinDialog
        open={openPinDialog}
        onClose={() => {
          setOpenPinDialog(false);
          setPendingRefundAction(false);
        }}
        onSuccess={() => {
          setOpenPinDialog(false);
          if (pendingRefundAction) {
            setOpenRefundFlowDialog(true);
          }
          setPendingRefundAction(false);
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

      <RefundFlowDialog
        open={openRefundFlowDialog}
        onClose={() => setOpenRefundFlowDialog(false)}
        companyID={companyID || ''}
        onRefundSuccess={() => {
          loadData();
          setSummaryKey((prev) => prev + 1);
        }}
      />
    </Box>
  );
}

