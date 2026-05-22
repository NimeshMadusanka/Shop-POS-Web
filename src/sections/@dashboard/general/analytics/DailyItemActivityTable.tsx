import { useState } from 'react';
import {
  Card,
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Collapse,
  IconButton,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

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
};

type Props = {
  activities: DailyItemActivity[];
  showOutlet?: boolean;
};

const ACTIVITY_COLORS: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
  Sold: 'error',
  Refunded: 'warning',
  'Stock In': 'success',
};

export default function DailyItemActivityTable({ activities, showOutlet = false }: Props) {
  const [open, setOpen] = useState(true);

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
          {activities.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No item activity recorded today.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Item Name</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell>Activity</TableCell>
                  {showOutlet && <TableCell>Outlet</TableCell>}
                  <TableCell>Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity._id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">{activity.itemName}</Typography>
                    </TableCell>
                    <TableCell align="right">{activity.amount}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={activity.activityLabel}
                        color={ACTIVITY_COLORS[activity.activityLabel] || 'default'}
                        variant="filled"
                      />
                    </TableCell>
                    {showOutlet && <TableCell>{activity.outletId || '—'}</TableCell>}
                    <TableCell>{formatTime(activity.operationDate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Collapse>
      </Box>
    </Card>
  );
}
