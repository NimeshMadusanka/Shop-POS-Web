// @mui
import { TableRow, TableCell } from '@mui/material';
// @types
import { StockActivity } from '../../../../@types/user';

// ----------------------------------------------------------------------

type Props = {
  row: StockActivity;
};

export default function AnalyticsTableRow({ row }: Props) {
  const { itemId, itemName, amount, operationType, operationDate } = row;

  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Format item ID (show last 8 characters)
  const formatItemId = (id: string) => {
    if (typeof id === 'object' && id !== null) {
      return String(id).slice(-8);
    }
    return String(id).slice(-8);
  };

  return (
    <TableRow hover>
      <TableCell>{formatItemId(itemId)}</TableCell>

      <TableCell>{itemName}</TableCell>

      <TableCell>{amount}</TableCell>

      <TableCell>
        <span
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: operationType === 'Stock-in' ? '#4caf50' : '#f44336',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          {operationType}
        </span>
      </TableCell>

      <TableCell>{formatDateTime(operationDate)}</TableCell>
    </TableRow>
  );
}

