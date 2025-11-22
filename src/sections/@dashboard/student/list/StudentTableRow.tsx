// @mui
import {
  Stack,
  TableRow,
  TableCell,
  Typography,
  Button,
} from '@mui/material';
// @types
import { NewStudentCreate } from '../../../../@types/user';
// components

// ----------------------------------------------------------------------

type Props = {
  row: NewStudentCreate;
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function StudentTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow }: Props) {
  const { name, email, phoneNumber} = row;

  return (
    <TableRow hover selected={selected}>
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="subtitle2" noWrap>
            {name}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell align="left">{email}</TableCell>
      <TableCell align="left">{phoneNumber}</TableCell>
      <TableCell align="left">
        <Button onClick={onEditRow}>Edit</Button>
      </TableCell>
    </TableRow>
  );
}
