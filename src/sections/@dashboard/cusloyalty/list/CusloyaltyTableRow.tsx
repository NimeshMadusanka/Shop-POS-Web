import { Stack, TableRow, TableCell, Typography, IconButton } from '@mui/material';
import { useState } from 'react';

import ModeEditIcon from '@mui/icons-material/ModeEdit';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';

import { NewCusloyaltyCreate } from '../../../../@types/user';
import { updateCusloyaltyStatus } from 'src/api/CusloyaltyApi'; // Make sure this exists

type Props = {
  row: NewCusloyaltyCreate;
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function CusloyaltyTableRow({
  row,
  selected,
  onSelectRow,
  onEditRow,
  onDeleteRow,
}: Props) {
  const { _id, itemName, offPercentage, description, discountName, status } = row;
  const [isActive, setIsActive] = useState(status === 'active');

  const handleToggle = async () => {
    const newStatus = isActive ? 'inactive' : 'active';
    try {
      await updateCusloyaltyStatus(_id, newStatus); // Call backend API
      setIsActive(!isActive); // Update local state only on success
    } catch (error) {
      console.error('Failed to update status', error);
      // Optionally show an error toast/snackbar
    }
  };

  return (
    <TableRow hover selected={selected}>
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="subtitle2" noWrap>
            {discountName}
          </Typography>
        </Stack>
      </TableCell>
  <TableCell align="left">{itemName}</TableCell>
      <TableCell align="left">{offPercentage}</TableCell>
     
      <TableCell align="left">{description}</TableCell>

      {/* Toggle Icon */}
      <TableCell align="left">
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={handleToggle}>
            {isActive ? (
              <ToggleOnIcon sx={{ color: 'green', fontSize: 28 }} />
            ) : (
              <ToggleOffIcon sx={{ color: 'gray', fontSize: 28 }} />
            )}
          </IconButton>
          <Typography variant="body2" color={isActive ? 'green' : 'text.secondary'}>
            {isActive ? 'Active' : 'Inactive'}
          </Typography>
        </Stack>
      </TableCell>

      {/* Edit Icon */}
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
        </Stack>
      </TableCell>
    </TableRow>
  );
}
