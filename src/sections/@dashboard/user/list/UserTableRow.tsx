import { useState } from 'react';
// @mui
import {
  Stack,
  TableRow,
  TableCell,
  Typography,
  IconButton,
  MenuItem,
  Menu,
} from '@mui/material';
// @types
import { NewUserCreate } from '../../../../@types/user';
// components
import Label from '../../../../components/label';
import Iconify from '../../../../components/iconify';

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
  const {
    userName,
    firstName,
    lastName,
    email,
    phoneNumber,
    emergencyPhoneNumber,
    emergencyContactNumber,
    status,
    role,
  } = row as any;

  const [openMenu, setOpenMenu] = useState<HTMLElement | null>(null);

  const displayName =
    userName ||
    [firstName, lastName].filter(Boolean).join(' ').trim() ||
    email ||
    '';

  const displayEmergency =
    emergencyPhoneNumber ||
    emergencyContactNumber ||
    '';

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenu(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenu(null);
  };

  const handleDelete = () => {
    onDeleteRow();
    handleCloseMenu();
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="subtitle2" noWrap>
              {displayName}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell align="left">{email}</TableCell>
        <TableCell align="left">{phoneNumber}</TableCell>
        <TableCell align="left">{displayEmergency}</TableCell>
        <TableCell align="left">
          <Label
            variant="soft"
            color={(role === 'admin' && 'info') || 'default'}
            sx={{ textTransform: 'capitalize' }}
          >
            {role || 'N/A'}
          </Label>
        </TableCell>
        <TableCell align="left">
          <Label
            variant="soft"
            color={(status === 'inactive' && 'error') || (status === 'active' && 'success') || 'default'}
            sx={{ textTransform: 'capitalize' }}
          >
            {status || 'active'}
          </Label>
        </TableCell>
        <TableCell align="right">
          <IconButton onClick={handleOpenMenu}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Menu
        open={Boolean(openMenu)}
        anchorEl={openMenu}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            onEditRow();
            handleCloseMenu();
          }}
        >
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Edit
        </MenuItem>

        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}
