import { Helmet } from 'react-helmet-async';
import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Card,
  Container,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  TextField,
  MenuItem,
  Typography,
  TablePagination,
  Chip,
} from '@mui/material';
import { PATH_DASHBOARD } from 'src/routes/paths';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';
import Loader from 'src/components/loading-screen';
import { useAuthContext } from 'src/auth/useAuthContext';
import { useOutlet } from 'src/contexts/OutletContext';
import {
  AuditLogEntry,
  StockActivityEntry,
  getAuditLogs,
  getStockActivityLedger,
} from 'src/api/AuditLogApi';

const AUDIT_CATEGORIES = [
  { value: '', label: 'All categories' },
  { value: 'auth', label: 'Auth' },
  { value: 'payment', label: 'Payment' },
  { value: 'product', label: 'Product' },
  { value: 'stock', label: 'Stock' },
  { value: 'user', label: 'User' },
  { value: 'system', label: 'System' },
  { value: 'general', label: 'General' },
];

const STOCK_TYPES = [
  { value: '', label: 'All types' },
  { value: 'Stock-in', label: 'Stock-in' },
  { value: 'Stock-out', label: 'Stock-out' },
  { value: 'missing', label: 'Missing' },
  { value: 'refunded-stock-in', label: 'Refunded stock-in' },
  { value: 'Returning-stock-out', label: 'Returning stock-out' },
];

export default function AuditLogPage() {
  const { themeStretch } = useSettingsContext();
  const { user } = useAuthContext();
  const { outletId } = useOutlet();
  const companyID = user?.companyID || '';

  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);

  const [auditRows, setAuditRows] = useState<AuditLogEntry[]>([]);
  const [auditPage, setAuditPage] = useState(0);
  const [auditRowsPerPage, setAuditRowsPerPage] = useState(25);
  const [auditTotal, setAuditTotal] = useState(0);
  const [category, setCategory] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [stockRows, setStockRows] = useState<StockActivityEntry[]>([]);
  const [stockType, setStockType] = useState('');
  const [stockDateFrom, setStockDateFrom] = useState('');
  const [stockDateTo, setStockDateTo] = useState('');

  const loadAuditLogs = useCallback(async () => {
    if (!companyID) return;
    setLoading(true);
    try {
      const result = await getAuditLogs({
        companyID,
        category: category || undefined,
        action: actionFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page: auditPage + 1,
        limit: auditRowsPerPage,
      });
      setAuditRows(result.data);
      setAuditTotal(result.pagination.total);
    } catch (error) {
      console.error('Failed to load audit logs', error);
    } finally {
      setLoading(false);
    }
  }, [companyID, category, actionFilter, dateFrom, dateTo, auditPage, auditRowsPerPage]);

  const loadStockActivity = useCallback(async () => {
    if (!companyID) return;
    setLoading(true);
    try {
      const result = await getStockActivityLedger({
        companyID,
        outletId: outletId !== 'combined' ? outletId : undefined,
        operationType: stockType || undefined,
        dateFrom: stockDateFrom || undefined,
        dateTo: stockDateTo || undefined,
        limit: 200,
      });
      setStockRows(result.data);
    } catch (error) {
      console.error('Failed to load stock activity', error);
    } finally {
      setLoading(false);
    }
  }, [companyID, outletId, stockType, stockDateFrom, stockDateTo]);

  useEffect(() => {
    if (tab === 0) loadAuditLogs();
    else loadStockActivity();
  }, [tab, loadAuditLogs, loadStockActivity]);

  const formatDate = (value: string) => new Date(value).toLocaleString();

  return (
    <>
      <Helmet>
        <title>Audit Log | Yiva POS</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Audit Log"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Audit Log' },
          ]}
        />

        <Card sx={{ p: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="Activity Trail" />
            <Tab label="Stock Activity" />
          </Tabs>

          {loading && <Loader />}

          {tab === 0 && (
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  select
                  label="Category"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setAuditPage(0);
                  }}
                  sx={{ minWidth: 180 }}
                >
                  {AUDIT_CATEGORIES.map((opt) => (
                    <MenuItem key={opt.value || 'all'} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Action contains"
                  value={actionFilter}
                  onChange={(e) => {
                    setActionFilter(e.target.value);
                    setAuditPage(0);
                  }}
                  placeholder="e.g. payment.refund"
                />
                <TextField
                  label="From"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setAuditPage(0);
                  }}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="To"
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setAuditPage(0);
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>When</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Summary</TableCell>
                      <TableCell>Changes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {auditRows.map((row) => (
                      <TableRow key={row._id} hover>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(row.at)}</TableCell>
                        <TableCell>
                          {row.userName || row.userEmail || row.userId?.slice(-6) || '—'}
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={row.category || 'general'} />
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                          {row.action}
                        </TableCell>
                        <TableCell>{row.summary || '—'}</TableCell>
                        <TableCell>
                          {(row.changes || []).length > 0
                            ? row.changes!.map((c) => (
                                <Typography key={c.field} variant="caption" display="block">
                                  {c.field}: {String(c.oldValue)} → {String(c.newValue)}
                                </Typography>
                              ))
                            : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!loading && auditRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No audit entries found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={auditTotal}
                page={auditPage}
                onPageChange={(_, p) => setAuditPage(p)}
                rowsPerPage={auditRowsPerPage}
                onRowsPerPageChange={(e) => {
                  setAuditRowsPerPage(parseInt(e.target.value, 10));
                  setAuditPage(0);
                }}
                rowsPerPageOptions={[25, 50, 100]}
              />
            </Stack>
          )}

          {tab === 1 && (
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  select
                  label="Operation type"
                  value={stockType}
                  onChange={(e) => setStockType(e.target.value)}
                  sx={{ minWidth: 200 }}
                >
                  {STOCK_TYPES.map((opt) => (
                    <MenuItem key={opt.value || 'all'} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="From"
                  type="date"
                  value={stockDateFrom}
                  onChange={(e) => setStockDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="To"
                  type="date"
                  value={stockDateTo}
                  onChange={(e) => setStockDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>When</TableCell>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Outlet</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stockRows.map((row) => (
                      <TableRow key={row._id} hover>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {formatDate(row.operationDate)}
                        </TableCell>
                        <TableCell>{row.itemName}</TableCell>
                        <TableCell align="right">{row.amount}</TableCell>
                        <TableCell>{row.operationType}</TableCell>
                        <TableCell>{row.outletId || '—'}</TableCell>
                      </TableRow>
                    ))}
                    {!loading && stockRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No stock activity found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          )}
        </Card>

        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Logs include logins, payments (refunds/voids), product edits, and stock movements.
            Stock counts should be changed only via Add Stock or Set Count on the product list.
          </Typography>
        </Box>
      </Container>
    </>
  );
}
