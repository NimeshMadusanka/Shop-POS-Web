// @mui
import { useState } from 'react';
import {
  Stack,
  TableRow,
  TableCell,
  Typography,
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
import CloseIcon from '@mui/icons-material/Close';
import ReplyIcon from '@mui/icons-material/Reply';
import DeleteIcon from '@mui/icons-material/Delete';
// @types
import { NewItemCreate } from '../../../@types/user';
// components
import { useSnackbar } from '../../../components/snackbar';
import { useAuthContext } from 'src/auth/useAuthContext';
import { returnStockItemApi, discontinueItemApi } from '../../../api/ItemApi';

// ----------------------------------------------------------------------

type Props = {
  row: NewItemCreate;
  selected: boolean;
  onSelectRow: VoidFunction;
  onStockUpdate?: VoidFunction;
};

export default function StockManagementTableRow({
  row,
  selected,
  onSelectRow,
  onStockUpdate,
}: Props) {
  const { itemName, itemCategory, stockQuantity, _id } = row;
  const stock = stockQuantity ?? 0;
  const [openReturnDialog, setOpenReturnDialog] = useState(false);
  const [openDiscontinueDialog, setOpenDiscontinueDialog] = useState(false);
  const [returnQuantity, setReturnQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();

  const handleOpenReturnDialog = () => {
    setOpenReturnDialog(true);
    setReturnQuantity('');
  };

  const handleCloseReturnDialog = () => {
    setOpenReturnDialog(false);
    setReturnQuantity('');
  };

  const handleReturnStock = async () => {
    if (!returnQuantity || isNaN(Number(returnQuantity)) || Number(returnQuantity) <= 0) {
      enqueueSnackbar('Please enter a valid quantity', { variant: 'error' });
      return;
    }

    if (Number(returnQuantity) > stock) {
      enqueueSnackbar(`Cannot return ${returnQuantity} units. Only ${stock} units available.`, { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      await returnStockItemApi(_id, Number(returnQuantity), user?.companyID || '');
      enqueueSnackbar('Stock returned successfully!', { variant: 'success' });
      handleCloseReturnDialog();
      if (onStockUpdate) {
        onStockUpdate();
      }
    } catch (error: any) {
      enqueueSnackbar(error?.response?.data?.message || 'Error returning stock', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDiscontinueItem = async () => {
    setLoading(true);
    try {
      await discontinueItemApi(_id);
      enqueueSnackbar('Item discontinued successfully!', { variant: 'success' });
      setOpenDiscontinueDialog(false);
      if (onStockUpdate) {
        onStockUpdate();
      }
    } catch (error: any) {
      enqueueSnackbar(error?.response?.data?.message || 'Error discontinuing item', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell onClick={onSelectRow} sx={{ cursor: 'pointer' }}>
          <Typography variant="subtitle2" noWrap>
            {itemName}
          </Typography>
        </TableCell>

        <TableCell align="left">{itemCategory}</TableCell>
        
        <TableCell align="left">
          <Typography variant="body2" color={stock < 10 ? 'error' : 'text.primary'}>
            {stock}
          </Typography>
        </TableCell>

        <TableCell align="center">
          <Stack direction="row" spacing={1} justifyContent="center">
            <IconButton
              color="primary"
              onClick={handleOpenReturnDialog}
              disabled={stock === 0}
              title="Return Stock"
              size="small"
            >
              <ReplyIcon />
            </IconButton>
            <IconButton
              color="error"
              onClick={() => setOpenDiscontinueDialog(true)}
              title="Discontinue Item"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>

      {/* Return Stock Dialog */}
      <Dialog open={openReturnDialog} onClose={handleCloseReturnDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Return Stock</Typography>
            <IconButton onClick={handleCloseReturnDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              Returning stock will reduce the available quantity and log the operation.
            </Alert>
            <Typography variant="body2" color="text.secondary">
              <strong>Item:</strong> {itemName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Current Stock:</strong> {stock} units
            </Typography>
            <TextField
              fullWidth
              label="Return Quantity"
              type="number"
              value={returnQuantity}
              onChange={(e) => setReturnQuantity(e.target.value)}
              inputProps={{ min: 1, max: stock }}
              helperText={`Enter quantity to return (max: ${stock} units)`}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReturnDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleReturnStock}
            disabled={loading || !returnQuantity || Number(returnQuantity) <= 0 || Number(returnQuantity) > stock}
          >
            {loading ? 'Processing...' : 'Return Stock'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Discontinue Item Dialog */}
      <Dialog open={openDiscontinueDialog} onClose={() => setOpenDiscontinueDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Discontinue Item</Typography>
            <IconButton onClick={() => setOpenDiscontinueDialog(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="warning">
              This will mark the item as discontinued. The item will be removed from active product listings.
            </Alert>
            <Typography variant="body2">
              <strong>Item:</strong> {itemName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Current Stock:</strong> {stock} units
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Are you sure you want to discontinue this item?
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDiscontinueDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDiscontinueItem}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Discontinue Item'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

