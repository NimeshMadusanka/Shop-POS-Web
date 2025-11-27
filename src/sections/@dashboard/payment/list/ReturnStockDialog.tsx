import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  IconButton,
  Typography,
  Box,
  Chip,
  Stack,
} from '@mui/material';
import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { returnStockApi } from 'src/api/PaymentApi';
import { useAuthContext } from 'src/auth/useAuthContext';
import { useSnackbar } from 'src/components/snackbar';

type ReturnItem = {
  itemId: string;
  itemName: string;
  originalQuantity: number;
  returnQuantity: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  paymentId: string;
  items: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
  }>;
  onSuccess: () => void;
};

export default function ReturnStockDialog({ open, onClose, paymentId, items, onSuccess }: Props) {
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const handleAddToReturn = (item: { itemId: string; itemName: string; quantity: number }) => {
    const existingIndex = returnItems.findIndex((ri) => ri.itemId === item.itemId);
    
    if (existingIndex >= 0) {
      // Item already in return list, update quantity
      const updated = [...returnItems];
      updated[existingIndex] = {
        ...updated[existingIndex],
        returnQuantity: Math.min(updated[existingIndex].returnQuantity + 1, item.quantity),
      };
      setReturnItems(updated);
    } else {
      // Add new item to return list
      setReturnItems([
        ...returnItems,
        {
          itemId: item.itemId,
          itemName: item.itemName,
          originalQuantity: item.quantity,
          returnQuantity: 1,
        },
      ]);
    }
  };

  const handleRemoveFromReturn = (itemId: string) => {
    setReturnItems(returnItems.filter((ri) => ri.itemId !== itemId));
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    const item = items.find((i) => i.itemId === itemId);
    if (!item) return;

    const maxQuantity = item.quantity;
    const clampedQuantity = Math.max(0, Math.min(newQuantity, maxQuantity));

    setReturnItems(
      returnItems.map((ri) =>
        ri.itemId === itemId ? { ...ri, returnQuantity: clampedQuantity } : ri
      )
    );
  };

  const handleConfirm = async () => {
    if (returnItems.length === 0) {
      enqueueSnackbar('Please select items to return', { variant: 'warning' });
      return;
    }

    try {
      const returnPayload = returnItems.map((ri) => ({
        itemId: ri.itemId,
        quantity: ri.returnQuantity,
      }));

      await returnStockApi(paymentId, returnPayload, user?.companyID || '');
      enqueueSnackbar('Stock return processed successfully', { variant: 'success' });
      setReturnItems([]);
      onSuccess();
      onClose();
    } catch (error: any) {
      enqueueSnackbar(error?.response?.data?.message || 'Error processing stock return', {
        variant: 'error',
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Return Stock</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
          Select items to return. You can adjust the return quantity for each item.
        </Typography>

        {/* Items from Sale */}
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
          Items from Sale:
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Item ID</TableCell>
              <TableCell>Item Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => {
              const returnItem = returnItems.find((ri) => ri.itemId === item.itemId);
              const isInReturnList = returnItem !== undefined;
              const remainingQuantity = item.quantity - (returnItem?.returnQuantity || 0);

              return (
                <TableRow key={item.itemId}>
                  <TableCell>{item.itemId}</TableCell>
                  <TableCell>{item.itemName}</TableCell>
                  <TableCell>
                    {isInReturnList ? (
                      <Box>
                        <TextField
                          type="number"
                          size="small"
                          value={returnItem.returnQuantity}
                          onChange={(e) =>
                            handleQuantityChange(item.itemId, parseInt(e.target.value, 10) || 0)
                          }
                          inputProps={{
                            min: 0,
                            max: item.quantity,
                            style: { width: '80px' },
                          }}
                        />
                        <Typography variant="caption" display="block" color="text.secondary">
                          Remaining: {remainingQuantity} / {item.quantity}
                        </Typography>
                      </Box>
                    ) : (
                      item.quantity
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {isInReturnList ? (
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleRemoveFromReturn(item.itemId)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    ) : (
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleAddToReturn(item)}
                        disabled={item.quantity === 0}
                      >
                        <AddIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Return List Summary */}
        {returnItems.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
              Items to Return:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {returnItems.map((ri) => (
                <Chip
                  key={ri.itemId}
                  label={`${ri.itemName} (${ri.returnQuantity})`}
                  onDelete={() => handleRemoveFromReturn(ri.itemId)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={returnItems.length === 0}
          sx={{
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
        >
          Confirm Return
        </Button>
      </DialogActions>
    </Dialog>
  );
}

