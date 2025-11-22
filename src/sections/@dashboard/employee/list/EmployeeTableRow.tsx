// @mui
import {
  Stack,
  TableRow,
  TableCell,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { useState } from 'react';

import ModeEditIcon from '@mui/icons-material/ModeEdit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
// @types
import { NewEmployeeCreate } from '../../../../@types/user';

type Props = {
  row: NewEmployeeCreate;
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
  const { firstName, lastName, nicNumber, phoneNumber, role, gender, email } = row;

  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="subtitle2" noWrap>
              {`${firstName} ${lastName}`}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell align="left">{nicNumber}</TableCell>
        {/* <TableCell align="left">{phoneNumber}</TableCell> */}
        <TableCell align="left">{role}</TableCell>
        {/* <TableCell align="left">{gender}</TableCell> */}
        <TableCell align="left">{email}</TableCell>
        <TableCell align="left">
          <Chip label="Active" color="success" size="small" />
        </TableCell>
        <TableCell align="left">
          <Stack direction="row" spacing={1}>
            <IconButton
              aria-label="edit"
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
            <IconButton
              aria-label="view"
              onClick={handleOpenDialog}
              sx={{
                backgroundColor: '#000000',
                color: '#ffffff',
                ':hover': {
                  backgroundColor: '#ffffff',
                  color: '#000000',
                },
              }}
            >
              <VisibilityIcon />
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Employee Details
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography>
              <strong>Full Name:</strong> {firstName} {lastName}
            </Typography>
            <Typography>
              <strong>NIC Number:</strong> {nicNumber}
            </Typography>
            <Typography>
              <strong>Phone Number:</strong> {phoneNumber}
            </Typography>
            <Typography>
              <strong>Role:</strong> {role}
            </Typography>
            <Typography>
              <strong>Gender:</strong> {gender}
            </Typography>
            <Typography>
              <strong>Email:</strong> {email}
            </Typography>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
