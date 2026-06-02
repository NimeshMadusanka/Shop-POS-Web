import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Fragment, ReactNode } from 'react';

export type ColumnDef<T> = {
  id: string;
  label: string;
  width: string;
  align?: 'left' | 'right' | 'center';
  render: (row: T) => ReactNode;
};

type BrandGroup<T> = {
  brandName: string;
  items: T[];
};

type OutletSection<T> = {
  outletLabel: string;
  brands: BrandGroup<T>[];
};

type Props<T> = {
  sections: OutletSection<T>[];
  columns: ColumnDef<T>[];
  emptyMessage?: string;
  brandHeaderColor?: string;
  outletTitleVariant?: 'h6' | 'subtitle1';
};

/**
 * Renders outlet sections with brand header rows inside one table per section
 * so column positions stay aligned across brands.
 */
export default function AlignedGroupedTables<T>({
  sections,
  columns,
  emptyMessage = 'No records found.',
  brandHeaderColor = 'error.main',
  outletTitleVariant = 'h6',
}: Props<T>) {
  if (!sections.length) {
    return (
      <Typography variant="body2" color="text.secondary" fontStyle="italic">
        {emptyMessage}
      </Typography>
    );
  }

  return (
    <>
      {sections.map((section) => (
        <Box key={section.outletLabel} sx={{ mb: 3 }}>
          <Typography variant={outletTitleVariant} sx={{ mb: 1.5, fontWeight: 700 }}>
            {section.outletLabel}
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <Table
              size="small"
              sx={{
                tableLayout: 'fixed',
                width: '100%',
                minWidth: 560,
              }}
            >
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell
                      key={col.id}
                      align={col.align || 'left'}
                      sx={{ width: col.width, fontWeight: 600 }}
                    >
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {section.brands.map((brand) => (
                  <Fragment key={`${section.outletLabel}-${brand.brandName}`}>
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        sx={{
                          fontWeight: 700,
                          color: brandHeaderColor,
                          bgcolor: 'action.hover',
                          py: 1,
                        }}
                      >
                        {brand.brandName}
                      </TableCell>
                    </TableRow>
                    {brand.items.map((row, idx) => (
                      <TableRow
                        key={`${section.outletLabel}-${brand.brandName}-${idx}`}
                        hover
                      >
                        {columns.map((col) => (
                          <TableCell key={col.id} align={col.align || 'left'}>
                            {col.render(row)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Box>
      ))}
    </>
  );
}
