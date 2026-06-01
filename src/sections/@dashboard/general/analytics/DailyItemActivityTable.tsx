import { useMemo, useState } from 'react';
import {
  Card,
  Box,
  Typography,
  Chip,
  Collapse,
  IconButton,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AlignedGroupedTables from 'src/components/table/AlignedGroupedTables';
import { OUTLETS, OutletId } from 'src/config/outlets';
import { groupByOutletAndBrand } from 'src/utils/groupByOutletAndBrand';

// ----------------------------------------------------------------------

export type DailyItemActivity = {
  _id: string;
  itemId: string;
  itemName: string;
  amount: number;
  operationType: string;
  activityLabel: string;
  operationDate: string;
  outletId?: string | null;
  brandName?: string | null;
  brandId?: string | null;
};

const ACTIVITY_COLORS: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
  Sold: 'error',
  Refunded: 'warning',
  'Stock In': 'success',
};

type Props = {
  activities: DailyItemActivity[];
  isCombinedOutlets?: boolean;
  activeOutletId?: OutletId;
  brandId?: string | null;
};

export default function DailyItemActivityTable({
  activities,
  isCombinedOutlets = false,
  activeOutletId = 'AHANGAMA',
  brandId = null,
}: Props) {
  const [open, setOpen] = useState(true);

  const outletsToShow = useMemo<OutletId[]>(
    () => (isCombinedOutlets ? [...OUTLETS] : [activeOutletId]),
    [isCombinedOutlets, activeOutletId]
  );

  const groupedSections = useMemo(
    () =>
      groupByOutletAndBrand<DailyItemActivity>(activities, {
        outletsToShow,
        brandId,
      }),
    [activities, outletsToShow, brandId]
  );

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  const soldCount = activities.filter((a) => a.activityLabel === 'Sold').length;
  const refundedCount = activities.filter((a) => a.activityLabel === 'Refunded').length;
  const stockInCount = activities.filter((a) => a.activityLabel === 'Stock In').length;

  return (
    <Card>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h6">Daily Item Activity</Typography>
            <Typography variant="body2" color="text.secondary">
              Today&apos;s sold, refunded, and stock-in movements
            </Typography>
          </Box>
          <IconButton onClick={() => setOpen((prev) => !prev)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip size="small" label={`Sold: ${soldCount}`} color="error" variant="outlined" />
          <Chip size="small" label={`Refunded: ${refundedCount}`} color="warning" variant="outlined" />
          <Chip size="small" label={`Stock In: ${stockInCount}`} color="success" variant="outlined" />
        </Box>

        <Collapse in={open}>
          <AlignedGroupedTables
            sections={groupedSections}
            columns={[
              {
                id: 'itemName',
                label: 'Item Name',
                width: '38%',
                render: (row) => (
                  <Typography variant="subtitle2" component="span">
                    {row.itemName}
                  </Typography>
                ),
              },
              {
                id: 'amount',
                label: 'Qty',
                width: '12%',
                align: 'right',
                render: (row) => row.amount,
              },
              {
                id: 'activity',
                label: 'Activity',
                width: '22%',
                render: (row) => (
                  <Chip
                    size="small"
                    label={row.activityLabel}
                    color={ACTIVITY_COLORS[row.activityLabel] || 'default'}
                    variant="filled"
                  />
                ),
              },
              {
                id: 'time',
                label: 'Time',
                width: '28%',
                render: (row) => formatTime(row.operationDate),
              },
            ]}
            emptyMessage="No item activity recorded today."
            brandHeaderColor="primary.main"
          />
        </Collapse>
      </Box>
    </Card>
  );
}
