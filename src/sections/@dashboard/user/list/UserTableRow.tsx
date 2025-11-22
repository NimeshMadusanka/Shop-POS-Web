// @mui
import {
  Stack,
  TableRow,
  TableCell,
  Typography,
} from '@mui/material';
// @types
import { NewUserCreate } from '../../../../@types/user';
// components
import Label from '../../../../components/label';

// ----------------------------------------------------------------------

type Props = {
  row: NewUserCreate;
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function UserTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
}: Props) {
  const { userName, email, phoneNumber, district, status } = row;

  return (
      <TableRow hover selected={selected}>
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>

            <Typography variant="subtitle2" noWrap>
              {userName}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell align="left">{email}</TableCell>
        <TableCell align="left">{phoneNumber}</TableCell>
        <TableCell align="left">{district}</TableCell>
        <TableCell align="left">
          <Label
            variant="soft"
            color={(status === 'banned' && 'error') || 'success'}
            sx={{ textTransform: 'capitalize' }}
          >
            {status}
          </Label>
        </TableCell>
      </TableRow>
  );
}
