// @mui
import { Stack, InputAdornment, TextField, Button, Autocomplete, MenuItem } from '@mui/material';
// components
import Iconify from '../../../../components/iconify';

// ----------------------------------------------------------------------

type Brand = {
  _id: string;
  brandName: string;
};

type Props = {
  filterName: string;
  filterRole: string;
  filterBrand: Brand | null;
  filterOutlet: string;
  isFiltered: boolean;
  optionsRole: string[];
  brandOptions: Brand[];
  onResetFilter: VoidFunction;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterRole: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterBrand: (event: any, newValue: Brand | null) => void;
  onFilterOutlet: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function ItemtableToolbar({
  isFiltered,
  filterName,
  filterRole,
  filterBrand,
  filterOutlet,
  optionsRole,
  brandOptions,
  onFilterName,
  onFilterRole,
  onFilterBrand,
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
        placeholder="Search product..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
      />

      <Autocomplete
        fullWidth
        options={brandOptions}
        getOptionLabel={(option) => option?.brandName || ''}
        value={filterBrand}
        onChange={onFilterBrand}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Filter by brand..."
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                  {params.InputProps.startAdornment}
                </>
              ),
            }}
          />
        )}
        sx={{ minWidth: 200 }}
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
