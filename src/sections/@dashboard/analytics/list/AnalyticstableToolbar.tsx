// @mui
import { Stack, InputAdornment, TextField, Button, MenuItem } from '@mui/material';
// components
import Iconify from '../../../../components/iconify';

// ----------------------------------------------------------------------

type Props = {
  filterName: string;
  filterType: string;
  filterItem: string;
  filterDateFrom: string;
  filterDateTo: string;
  isFiltered: boolean;
  optionsType: string[];
  optionsItem: string[];
  onResetFilter: VoidFunction;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterType: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterItem: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterDateFrom: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterDateTo: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const INPUT_WIDTH = 160;

export default function AnalyticstableToolbar({
  isFiltered,
  filterName,
  filterType,
  filterItem,
  filterDateFrom,
  filterDateTo,
  optionsType,
  optionsItem,
  onFilterName,
  onFilterType,
  onFilterItem,
  onFilterDateFrom,
  onFilterDateTo,
  onResetFilter,
}: Props) {
  return (
    <Stack
      spacing={2}
      alignItems="center"
      direction={{
        xs: 'column',
        md: 'row',
      }}
      sx={{ px: 2.5, py: 3 }}
    >
      <TextField
        fullWidth
        select
        label="Operation Type"
        value={filterType}
        onChange={onFilterType}
        SelectProps={{
          MenuProps: {
            PaperProps: {
              sx: { maxHeight: 220 },
            },
          },
        }}
        sx={{
          maxWidth: { md: INPUT_WIDTH },
          textTransform: 'capitalize',
        }}
      >
        {optionsType.map((option) => (
          <MenuItem
            key={option}
            value={option}
            sx={{
              mx: 1,
              borderRadius: 0.75,
              typography: 'body2',
              textTransform: 'capitalize',
            }}
          >
            {option}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        fullWidth
        select
        label="Item"
        value={filterItem}
        onChange={onFilterItem}
        SelectProps={{
          MenuProps: {
            PaperProps: {
              sx: { maxHeight: 220 },
            },
          },
        }}
        sx={{
          maxWidth: { md: INPUT_WIDTH },
        }}
      >
        {optionsItem.map((option) => (
          <MenuItem
            key={option}
            value={option}
            sx={{
              mx: 1,
              borderRadius: 0.75,
              typography: 'body2',
            }}
          >
            {option}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        fullWidth
        value={filterName}
        onChange={onFilterName}
        placeholder="Search by item name..."
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
        type="date"
        label="Date From"
        value={filterDateFrom}
        onChange={onFilterDateFrom}
        InputLabelProps={{
          shrink: true,
        }}
        sx={{
          maxWidth: { md: INPUT_WIDTH },
        }}
      />

      <TextField
        fullWidth
        type="date"
        label="Date To"
        value={filterDateTo}
        onChange={onFilterDateTo}
        InputLabelProps={{
          shrink: true,
        }}
        sx={{
          maxWidth: { md: INPUT_WIDTH },
        }}
      />

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

