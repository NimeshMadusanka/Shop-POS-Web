// @mui
import { TableRow, TableCell, Typography, IconButton, Stack } from '@mui/material';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';
// components
import { useSnackbar } from '../../../../components/snackbar';
import { deleteShopApi } from '../../../../api/ShopApi';

// ----------------------------------------------------------------------

type Props = {
  row: {
    _id: string;
    shopName: string;
    ownerEmail: string;
    contactPhone?: string;
    address?: string;
  };
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function ShopTableRow({
  row,
  selected,
  onSelectRow,
  onEditRow,
  onDeleteRow,
}: Props) {
  const { shopName, ownerEmail, contactPhone, address, _id } = row;
  const { enqueueSnackbar } = useSnackbar();

  const handleDelete = async () => {
    try {
      await deleteShopApi(_id);
      enqueueSnackbar('Shop deleted successfully');
      onDeleteRow();
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Error deleting shop', { variant: 'error' });
    }
  };

  return (
    <TableRow hover selected={selected}>
      <TableCell>
        <Typography variant="subtitle2" noWrap>
          {shopName}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" noWrap>
          {ownerEmail}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" noWrap>
          {contactPhone || '-'}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" noWrap>
          {address || '-'}
        </Typography>
      </TableCell>

      <TableCell align="center">
        <Stack direction="row" spacing={1} justifyContent="center">
          <IconButton onClick={onEditRow} color="primary" size="small">
            <ModeEditIcon />
          </IconButton>
          <IconButton onClick={handleDelete} color="error" size="small">
            <DeleteIcon />
          </IconButton>
        </Stack>
      </TableCell>
    </TableRow>
  );
}

