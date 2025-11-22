// @mui
import { Stack, Button, TableRow, TableCell, Typography } from '@mui/material';
import moment from 'moment';

// @types
import { BookingGeneral } from '../../../@types/booking';
// components
import Label from '../../../components/label';
import ConfirmDialog from '../../../components/confirm-dialog';
// ----------------------------------------------------------------------
import ViewMoreBooking from './ViewMoreBooking';


type Props = {
  row: BookingGeneral;
  selected: boolean;
  onSelectRow: VoidFunction;
  onDeleteRow: (val: string) => void;
  openConfirm: { open: boolean; status: string; id: string };
  handleOpenConfirm: (id: any, status: string) => void;
  handleCloseConfirm: VoidFunction;
};

export default function UserTableRow({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
  openConfirm,
  handleOpenConfirm,
  handleCloseConfirm,
}: Props) {
  const {
    name,
    bookingType,
    checkingDate,
    checkoutDate,
    userName,
    contactNumber,
    status,
  } = row;

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="subtitle2" noWrap>
              {name}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell align="left" sx={{ textTransform: 'capitalize' }}>
          {' '}
          {bookingType}{' '}
        </TableCell>
        <TableCell align="left" sx={{ textTransform: 'capitalize' }}>
          {moment(checkingDate).format("MMM Do YY")}
        </TableCell>
        <TableCell align="left" sx={{ textTransform: 'capitalize' }}>
           {moment(checkoutDate).format("MMM Do YY")}
        </TableCell>
        <TableCell align="left" sx={{ textTransform: 'capitalize' }}>
          {' '}
          {userName}{' '}
        </TableCell>
        <TableCell align="left" sx={{ textTransform: 'capitalize' }}>
          {' '}
          {contactNumber}{' '}
        </TableCell>
        <TableCell align="left">
          <Label
            variant="soft"
            color={(status === 'banned' && 'error') || 'success'}
            sx={{ textTransform: 'capitalize' }}
          >
            {status}
          </Label>
        </TableCell>
        <TableCell align="left">
          {/* @ts-ignore */}
          <ViewMoreBooking row={row}/>
        </TableCell>
      </TableRow>

      <ConfirmDialog
        open={openConfirm.open}
        onClose={handleCloseConfirm}
        title={openConfirm.status === 'active' ? 'Inactive' : 'Activate'}
        content={`Are you sure want to ${
          openConfirm.status === 'active' ? 'Inactive' : 'Activate'
        }?`}
        action={
          <Button
            variant="contained"
            color={openConfirm.status === 'active' ? 'error' : 'success'}
            onClick={() => {
              onDeleteRow(openConfirm.id);
            }}
          >
            {openConfirm.status === 'active' ? 'Inactive' : 'Activate'}
          </Button>
        }
      />
    </>
  );
}
