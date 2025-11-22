// @mui
import {
  Stack,
  TableRow,
  TableCell,
  Typography,
  Button,
} from '@mui/material';
// @types
import { NewCompanyCreate } from '../../../../@types/user';
// components

// ----------------------------------------------------------------------

type Props = {
  row: NewCompanyCreate;
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  oncompanyRow: VoidFunction;
};

export default function CompanyTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow, oncompanyRow }: Props) {
  const { companyName, companyEmail,companyType, phoneNumber,country} = row;

  return (
    <TableRow hover selected={selected}>
       
      <TableCell>
  
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="subtitle2" noWrap>
            {companyName}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell align="left">{companyEmail}</TableCell>
      <TableCell align="left">{companyType}</TableCell>
      <TableCell align="left">{country}</TableCell>
      <TableCell align="left">{phoneNumber}</TableCell>
      <TableCell align="left">
        <Button onClick={onEditRow}>Edit</Button>
        <Button onClick={onDeleteRow}>Delete</Button>
        <Button onClick={oncompanyRow}>Company</Button>
      </TableCell>
    
    </TableRow>
  );
}
