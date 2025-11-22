// @mui
import { Stack, TableRow, TableCell, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
// @types
import { NewRoleCreate } from '../../../../@types/user';
// components

// ----------------------------------------------------------------------

type Props = {
  row: NewRoleCreate;
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
  const { roleName, monthlySalary, allowances, deductions } = row;

  return (
    <TableRow hover selected={selected}>
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="subtitle2" noWrap>
            {roleName}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell align="left">{monthlySalary}</TableCell>
      <TableCell align="left">{allowances}</TableCell>
      <TableCell align="left">{deductions}</TableCell>

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
