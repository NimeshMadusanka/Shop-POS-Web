// @mui
import { useState } from 'react';
import {
  Stack,
  TableRow,
  TableCell,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
} from '@mui/material';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import InventoryIcon from '@mui/icons-material/Inventory';
// @types
import { NewItemCreate } from '../../../../@types/user';
// components
import { useSnackbar } from '../../../../components/snackbar';
import { addStockApi, updateStockApi } from '../../../../api/ItemApi';
import StockOutDialog from '../StockOutDialog';

// ----------------------------------------------------------------------

type Props = {
  row: NewItemCreate;
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onStockUpdate?: VoidFunction;
};

export default function ItemTableRow({
  row,
  selected,
  onSelectRow,
  onEditRow,
  onDeleteRow,
  onStockUpdate,
}: Props) {
  const { itemName, itemCategory, itemPrice, itemDuration, stockQuantity, _id } = row;
  const stock = stockQuantity ?? 0;
  const isLowStock = stock < 20;
  const [openDialog, setOpenDialog] = useState(false);
  const [openStockOutDialog, setOpenStockOutDialog] = useState(false);
  const [openStockCountDialog, setOpenStockCountDialog] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [stockCount, setStockCount] = useState('');
  const [loading, setLoading] = useState(false);
  const [countLoading, setCountLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setQuantity('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setQuantity('');
  };

  const handleAddStock = async () => {
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      enqueueSnackbar('Please enter a valid quantity', { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      await addStockApi(_id, Number(quantity));
      enqueueSnackbar('Stock added successfully!', { variant: 'success' });
      handleCloseDialog();
      if (onStockUpdate) {
        onStockUpdate();
      }
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Error adding stock', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStockCountDialog = () => {
    setOpenStockCountDialog(true);
    setStockCount(stock.toString());
  };

  const handleCloseStockCountDialog = () => {
    setOpenStockCountDialog(false);
    setStockCount('');
  };

  const handleSetStockCount = async () => {
    if (stockCount === '' || isNaN(Number(stockCount)) || Number(stockCount) < 0) {
      enqueueSnackbar('Please enter a valid stock count (must be >= 0)', { variant: 'error' });
      return;
    }

    const newCount = Number(stockCount);
    if (newCount === stock) {
      enqueueSnackbar('Stock count is the same as current stock. No changes needed.', { variant: 'info' });
      handleCloseStockCountDialog();
      return;
    }

    setCountLoading(true);
    try {
      const response = await updateStockApi(_id, newCount);
      const missingAmount = response?.missingStock || 0;
      
      if (missingAmount > 0) {
        enqueueSnackbar(
          `Stock count updated! ${missingAmount} unit(s) marked as missing.`,
          { variant: 'warning' }
        );
      } else {
        enqueueSnackbar('Stock count updated successfully!', { variant: 'success' });
      }
      
      handleCloseStockCountDialog();
      if (onStockUpdate) {
        onStockUpdate();
      }
    } catch (error: any) {
      enqueueSnackbar(error?.response?.data?.message || 'Error updating stock count', { variant: 'error' });
    } finally {
      setCountLoading(false);
    }
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="subtitle2" noWrap>
              {itemName}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell align="left">{itemCategory}</TableCell>
        <TableCell align="left">{itemPrice}</TableCell>
        <TableCell align="left">{itemDuration}</TableCell>
        <TableCell align="left">
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={stock}
              color={isLowStock ? 'error' : stock < 50 ? 'warning' : 'success'}
              size="small"
            />
            <IconButton
              size="small"
              onClick={handleOpenDialog}
              sx={{
                backgroundColor: 'primary.main',
                color: '#ffffff',
                width: 28,
                height: 28,
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
              title="Add Stock"
            >
              <AddIcon fontSize="small" />
            </IconButton>
            {stock > 0 && (
              <IconButton
                size="small"
                onClick={() => setOpenStockOutDialog(true)}
                sx={{
                  backgroundColor: 'error.main',
                  color: '#ffffff',
                  width: 28,
                  height: 28,
                  '&:hover': {
                    backgroundColor: 'error.dark',
                  },
                }}
                title="Stock Out"
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={handleOpenStockCountDialog}
              sx={{
                backgroundColor: '#9c27b0',
                color: '#ffffff',
                width: 28,
                height: 28,
                '&:hover': {
                  backgroundColor: '#7b1fa2',
                },
              }}
              title="Set Stock Count (Physical Inventory)"
            >
              <InventoryIcon fontSize="small" />
            </IconButton>
          </Stack>
        </TableCell>
        <TableCell align="center">
          <IconButton
            aria-label="open"
            onClick={onEditRow}
            size="small"
            sx={{
              backgroundColor: '#800000',
              color: '#ffffff',
              ':hover': {
                backgroundColor: '#ffffff',
                color: '#800000',
              },
            }}
          >
            <ModeEditIcon />
          </IconButton>
        </TableCell>
      </TableRow>

      {/* Add Stock Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Stock - {itemName}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Current Stock: <strong>{stock}</strong>
            </Typography>
            <TextField
              fullWidth
              label="Quantity to Add"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              inputProps={{ min: 1 }}
              helperText="Enter the quantity you want to add to the current stock"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleAddStock} variant="contained" disabled={loading}>
            {loading ? 'Adding...' : 'Add Stock'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stock Out Dialog */}
      <StockOutDialog
        open={openStockOutDialog}
        onClose={() => setOpenStockOutDialog(false)}
        itemId={_id}
        itemName={itemName}
        currentStock={stock}
        onSuccess={() => {
          if (onStockUpdate) {
            onStockUpdate();
          }
        }}
      />

      {/* Set Stock Count Dialog */}
      <Dialog open={openStockCountDialog} onClose={handleCloseStockCountDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Set Stock Count - {itemName}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Enter the actual physical stock count. If the count is less than the system's expected stock, 
              the difference will be automatically recorded as missing stock.
            </Alert>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <strong>System Expected Stock:</strong> {stock} units
            </Typography>
            <TextField
              fullWidth
              label="Actual Stock Count"
              type="number"
              value={stockCount}
              onChange={(e) => setStockCount(e.target.value)}
              inputProps={{ min: 0 }}
              helperText="Enter the actual physical count of items in stock"
              autoFocus
            />
            {stockCount !== '' && !isNaN(Number(stockCount)) && Number(stockCount) < stock && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <strong>Missing Stock Detected:</strong> {stock - Number(stockCount)} unit(s) will be marked as missing.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStockCountDialog} disabled={countLoading}>
            Cancel
          </Button>
          <Button onClick={handleSetStockCount} variant="contained" disabled={countLoading} color="primary">
            {countLoading ? 'Updating...' : 'Update Stock Count'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
