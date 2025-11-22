// @mui
import {
  Stack,
  TableRow,
  TableCell,
  Typography,
  Button,
} from '@mui/material';
// @types
import { IBillingGeneral, Invoice } from '../../../../@types/billing';
// components
import Label from '../../../../components/label';

// ----------------------------------------------------------------------

type Props = {
  row: IBillingGeneral;
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction | null;
  openInvoicePdf: (openVal:boolean, invoiceData:Invoice) => void;
};

export default function BillingTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  openInvoicePdf,
}: Props) {
  const { date, amount, attachment, invoice, status } = row;

  const statusColor = () => {
    if (status === 'verified') {
      return 'success';
    }
    if (status === 'pending') {
      return 'warning';
    }
    return 'error';
  }
  const statusColorAssign = statusColor();

  return (
    <TableRow hover selected={selected}>
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={2}>
          {/* <Avatar alt={name} src={avatarUrl} /> */}
          <Typography variant="subtitle2" noWrap>
            {new Date(date).toLocaleString()}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell align="left">{amount}.00 AUD</TableCell>

      <TableCell align="left" sx={{ textTransform: 'capitalize' }}>
        <Button onClick={() => window.open(attachment, '_blank')}> View </Button>
      </TableCell>
      <TableCell align="left">
        <Label
          variant="soft"
          color={statusColorAssign}
          sx={{ textTransform: 'capitalize' }}
        >
          {status}
        </Label>
      </TableCell>

      <TableCell align="left">
        {invoice?.status === 'verified' ? <Button onClick={() => openInvoicePdf(true, invoice)}> Invoice </Button> : "Payment not verified yet"}
      </TableCell>

    </TableRow>
  );
}
