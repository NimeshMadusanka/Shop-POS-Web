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
} from '@mui/material';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import AddIcon from '@mui/icons-material/Add';
// @types
import { NewItemCreate } from '../../../../@types/user';
// components
import { useSnackbar } from '../../../../components/snackbar';
import { addStockApi } from '../../../../api/ItemApi';

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
  const isLowStock = stock < 10;
  const [openDialog, setOpenDialog] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
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
                backgroundColor: '#FF9800',
                color: '#ffffff',
                width: 28,
                height: 28,
                '&:hover': {
                  backgroundColor: '#F57C00',
                },
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Stack>
        </TableCell>
        <TableCell align="left">
          <IconButton
            aria-label="open"
            onClick={onEditRow}
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
    </>
  );
}
