// @mui
import { TableRow, TableCell, Typography, IconButton, Stack } from '@mui/material';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';
// components
import { useSnackbar } from '../../../../components/snackbar';
import { deleteBrandApi } from '../../../../api/BrandApi';

// ----------------------------------------------------------------------

type Props = {
  row: {
    _id: string;
    brandName: string;
    description?: string;
    providerId?: string;
    providerName?: string;
  };
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function BrandTableRow({
  row,
  selected,
  onSelectRow,
  onEditRow,
  onDeleteRow,
}: Props) {
  const { brandName, description, providerName, _id } = row;
  const { enqueueSnackbar } = useSnackbar();

  const handleDelete = async () => {
    try {
      await deleteBrandApi(_id);
      enqueueSnackbar('Brand deleted successfully');
      onDeleteRow();
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Error deleting brand', { variant: 'error' });
    }
  };

  return (
    <TableRow hover selected={selected}>
      <TableCell>
        <Typography variant="subtitle2" noWrap>
          {brandName}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" noWrap>
          {providerName || '-'}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" noWrap>
          {description || '-'}
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

