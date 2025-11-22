// @mui
import { Stack, TableRow, TableCell, Typography, Chip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
// @types
import { NewCustomerCreate } from '../../../../@types/user';
// components

// ----------------------------------------------------------------------

type Props = {
  row: NewCustomerCreate;
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function ItemTableRow({
  row,
  selected,
  onSelectRow,
  onEditRow,
  onDeleteRow,
}: Props) {
  const { firstName, lastName, phoneNumber, email } = row;

  return (
    <TableRow hover selected={selected}>
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="subtitle2" noWrap>
            {`${firstName} ${lastName}`}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell align="left">{phoneNumber}</TableCell>
      <TableCell align="left">{email}</TableCell>
      <TableCell align="left">
        <Chip label="Active" color="success" size="small" />
      </TableCell>
      <TableCell align="left">
        {/* <Button onClick={onEditRow}>Edit</Button> */}
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
  );
}
