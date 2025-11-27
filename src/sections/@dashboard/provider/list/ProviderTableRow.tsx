// @mui
import { TableRow, TableCell, Typography, IconButton, Stack } from '@mui/material';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';
// components
import { useSnackbar } from '../../../../components/snackbar';
import { deleteProviderApi } from '../../../../api/ProviderApi';

// ----------------------------------------------------------------------

type Props = {
  row: {
    _id: string;
    providerName: string;
    contactEmail: string;
    contactPhone?: string;
    address?: string;
  };
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function ProviderTableRow({
  row,
  selected,
  onSelectRow,
  onEditRow,
  onDeleteRow,
}: Props) {
  const { providerName, contactEmail, contactPhone, address, _id } = row;
  const { enqueueSnackbar } = useSnackbar();

  const handleDelete = async () => {
    try {
      await deleteProviderApi(_id);
      enqueueSnackbar('Provider deleted successfully');
      onDeleteRow();
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Error deleting provider', { variant: 'error' });
    }
  };

  return (
    <TableRow hover selected={selected}>
      <TableCell>
        <Typography variant="subtitle2" noWrap>
          {providerName}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" noWrap>
          {contactEmail}
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

