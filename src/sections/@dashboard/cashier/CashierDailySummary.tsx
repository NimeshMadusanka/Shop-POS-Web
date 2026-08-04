import { useCallback, useEffect, useMemo, useState } from 'react';
import { Fragment } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Collapse,
  Grid,
  IconButton,
  Typography,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { getPaymentData } from '../../../api/PaymentApi';

type Props = {
  companyID: string;
  refreshKey?: number;
};

type PaymentLike = {
  _id?: string;
  invoiceNumber?: string;
  date?: string;
  createdAt?: string;
  grandTotal?: number | string;
  cashPaid?: number | string;
  wirePaid?: number | string;
  creditPaid?: number | string;
  debitPaid?: number | string;
  cardPaid?: number | string;
  refunded?: boolean;
  refundedItems?: Array<{ quantity?: number }>;
  isReversal?: boolean;
  specialNote?: string;
};

export default function CashierDailySummary({ companyID, refreshKey = 0 }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [expandedInvoices, setExpandedInvoices] = useState<Record<string, boolean>>({});
  const [todayPayments, setTodayPayments] = useState<PaymentLike[]>([]);

  const loadDaily = useCallback(async () => {
    if (!companyID) return;
    const data = await getPaymentData(companyID);
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
    const filtered = (Array.isArray(data) ? data : []).filter((payment: PaymentLike) => {
      const paymentDate =
        (typeof payment.date === 'string' && payment.date.slice(0, 10)) ||
        payment.createdAt?.split('T')[0];
      return paymentDate === today;
    });
    setTodayPayments(filtered);
  }, [companyID]);

  useEffect(() => {
    loadDaily();
  }, [loadDaily, refreshKey]);

  const summary = useMemo(() => {
    const soldPayments = todayPayments.filter((p) => !p.refunded && !p.isReversal);
    const fullRefundedPayments = todayPayments.filter((p) => p.refunded);
    const partialRefundReversals = todayPayments.filter((p) => p.isReversal);
    const refundedPayments = [...fullRefundedPayments, ...partialRefundReversals];

    const total = soldPayments.reduce((sum, p) => sum + (Number(p.grandTotal) || 0), 0);
    const refundTotal = refundedPayments.reduce(
      (sum, p) => sum + Math.abs(Number(p.grandTotal) || 0),
      0
    );
    const netTotal = total - refundTotal;

    const cashTotal = soldPayments.reduce((sum, p) => sum + (Number(p.cashPaid) || 0), 0);
    const wireTotal = soldPayments.reduce((sum, p) => sum + (Number(p.wirePaid) || 0), 0);
    const cardTotal = soldPayments.reduce((sum, p) => {
      const credit = Number(p.creditPaid) || 0;
      const debit = Number(p.debitPaid) || 0;
      if (credit > 0 || debit > 0) {
        return sum + credit + debit;
      }
      return sum + (Number(p.cardPaid) || 0);
    }, 0);

    return {
      total,
      refundTotal,
      netTotal,
      cashTotal,
      wireTotal,
      cardTotal,
      transactionCount: soldPayments.length,
      refundCount: refundedPayments.length,
      refundedInvoices: refundedPayments.map((payment) => ({
        id: payment._id || '',
        invoiceNumber: payment.invoiceNumber || 'N/A',
        amount: Math.abs(Number(payment.grandTotal) || 0),
        type: payment.isReversal ? 'Partial Refund' : 'Full Refund',
        note: payment.specialNote || (payment.isReversal ? 'Reversal entry' : 'Invoice refunded'),
        items: (payment as any).items || [],
      })),
    };
  }, [todayPayments]);

  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        title="Daily Sales Summary"
        subheader="Cashier snapshot for today"
        action={
          <IconButton onClick={() => setExpanded((prev) => !prev)}>
            {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        }
      />
      <Collapse in={expanded}>
        <CardContent sx={{ pt: 0 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Daily Total
              </Typography>
              <Typography variant="h6">{summary.total.toFixed(2)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Net Total
              </Typography>
              <Typography variant="h6">{summary.netTotal.toFixed(2)}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Typography variant="body2">Transactions: {summary.transactionCount}</Typography>
                <Typography variant="body2">Cash: {summary.cashTotal.toFixed(2)}</Typography>
                <Typography variant="body2">Card: {summary.cardTotal.toFixed(2)}</Typography>
                <Typography variant="body2">Wire: {summary.wireTotal.toFixed(2)}</Typography>
                <Typography variant="body2">Refunds: {summary.refundTotal.toFixed(2)}</Typography>
                <Typography variant="body2">Refund Count: {summary.refundCount}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
                Refunded/Partially Refunded Bills (Today)
              </Typography>
              {summary.refundedInvoices.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No refunded invoices today.
                </Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell />
                      <TableCell>Invoice</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Note</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {summary.refundedInvoices.map((entry) => {
                      const rowKey = `${entry.id}-${entry.invoiceNumber}`;
                      const isOpen = !!expandedInvoices[rowKey];
                      return (
                        <Fragment key={rowKey}>
                          <TableRow>
                            <TableCell width={40}>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  setExpandedInvoices((prev) => ({ ...prev, [rowKey]: !prev[rowKey] }))
                                }
                              >
                                {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                              </IconButton>
                            </TableCell>
                            <TableCell>{entry.invoiceNumber}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={entry.type}
                                color={entry.type === 'Full Refund' ? 'error' : 'warning'}
                              />
                            </TableCell>
                            <TableCell>{entry.amount.toFixed(2)}</TableCell>
                            <TableCell>{entry.note}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={5} sx={{ p: 0, borderBottom: 0 }}>
                              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                <Box sx={{ m: 1 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                    Refunded Items
                                  </Typography>
                                  <Table size="small" sx={{ mt: 1 }}>
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>Item</TableCell>
                                        <TableCell>Brand</TableCell>
                                        <TableCell>Qty</TableCell>
                                        <TableCell>Unit Price</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {entry.items.length === 0 ? (
                                        <TableRow>
                                          <TableCell colSpan={4}>No item details</TableCell>
                                        </TableRow>
                                      ) : (
                                        entry.items.map((item: any, idx: number) => (
                                          <TableRow key={`${rowKey}-item-${idx}`}>
                                            <TableCell>{item.itemName || 'N/A'}</TableCell>
                                            <TableCell>{item.brandName || 'N/A'}</TableCell>
                                            <TableCell>{Number(item.quantity) || 0}</TableCell>
                                            <TableCell>{Number(item.itemPrice || 0).toFixed(2)}</TableCell>
                                          </TableRow>
                                        ))
                                      )}
                                    </TableBody>
                                  </Table>
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Collapse>
    </Card>
  );
}
