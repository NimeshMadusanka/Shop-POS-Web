// @mui
import { Stack, InputAdornment, TextField, Button, MenuItem } from '@mui/material';
// components
import Iconify from '../../../../components/iconify';

// ----------------------------------------------------------------------

type Props = {
  filterName: string;
  filterRole: string;
  filterOutlet: string;
  isFiltered: boolean;
  optionsRole: string[];
  onResetFilter: VoidFunction;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterRole: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterOutlet: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function UserTableToolbar({
  isFiltered,
  filterName,
  filterRole,
  filterOutlet,
  optionsRole,
  onFilterName,
  onFilterRole,
  onFilterOutlet,
  onResetFilter,
}: Props) {
  return (
    <Stack
      spacing={2}
      alignItems="center"
      direction={{
        xs: 'column',
        sm: 'row',
      }}
      sx={{ px: 2.5, py: 3 }}
    >

      <TextField
        fullWidth
        value={filterName}
        onChange={onFilterName}
        placeholder="Search..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        select
        label="Outlet"
        value={filterOutlet}
        onChange={onFilterOutlet}
        sx={{ minWidth: 180, maxWidth: 220 }}
      >
        <MenuItem value="all">All</MenuItem>
        <MenuItem value="AHANGAMA">Ahangama</MenuItem>
        <MenuItem value="ARUGAM_BAY">Arugam Bay</MenuItem>
      </TextField>

      {isFiltered && (
        <Button
          color="error"
          sx={{ flexShrink: 0 }}
          onClick={onResetFilter}
          startIcon={<Iconify icon="eva:trash-2-outline" />}
        >
          Clear
        </Button>
      )}
    </Stack>
  );
}
