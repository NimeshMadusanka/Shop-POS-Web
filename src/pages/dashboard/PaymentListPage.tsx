import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';
import { paramCase } from 'change-case';
// @mui
import { Card, Table, Divider, TableBody, Container, TableContainer, Typography, Button } from '@mui/material';
import { getPaymentData } from 'src/api/PaymentApi';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// @types
import { NewPaymentCreate } from '../../@types/user';
// components

import Scrollbar from '../../components/scrollbar';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from '../../components/table';
import Loader from '../../components/loading-screen';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from 'src/auth/useAuthContext';
// sections
import { PaymenttableToolbar, PaymentTableRow } from '../../sections/@dashboard/payment/list';

// ----------------------------------------------------------------------

const ROLE_OPTIONS = [
  'all',
  'ux designer',
  'full stack designer',
  'backend developer',
  'project manager',
  'leader',
  'SuperAdmin',
  'RiskEngineer',
  'Consultant',
  'Accountant',
  'ui designer',
  'ui/ux designer',
  'front end developer',
  'full stack developer',
];

const TABLE_HEAD = [
  { id: 'customerName', label: 'Customer Name', align: 'left' },
  { id: 'date', label: 'Date', align: 'left' },
  { id: 'grandTotal', label: 'Grand Total', align: 'left' },

  { id: '', label: 'Action', align: 'left' },
  { id: '' },
];

// ----------------------------------------------------------------------
export default function PaymentListPage() {
  const {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    //
    selected,
    setSelected,
    onSelectRow,
    //
    onSort,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable({
    defaultOrderBy: 'date',
    defaultOrder: 'desc',
  });

  const { themeStretch } = useSettingsContext();

  const navigate = useNavigate();
  const [tableData, setTableData] = useState<NewPaymentCreate[]>([]);
  const [dataLoad, setDataLoad] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filterName, setFilterName] = useState('');

  const [filterRole, setFilterRole] = useState('all');
  const { user } = useAuthContext();

  const [filterStatus, setFilterStatus] = useState('all');

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(order, orderBy),
    filterName,
    filterRole,
    filterStatus,
  });

  const dataInPage = dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const denseHeight = dense ? 52 : 72;

  const isFiltered = filterName !== '' || filterRole !== 'all' || filterStatus !== 'all';

  const isNotFound =
    (!dataFiltered.length && !!filterName) ||
    (!dataFiltered.length && !!filterRole) ||
    (!dataFiltered.length && !!filterStatus) ||
    (!dataFiltered.length && !dataLoad && tableData.length === 0);

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleFilterRole = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterRole(event.target.value);
  };

  const handleEditRow = (id: string, row: any) => {
    navigate(PATH_DASHBOARD.payment.edit(paramCase(id)), row);
  };

  const handleDeleteRow = (id: string) => {
    const deleteRow = tableData.filter((row: NewPaymentCreate) => row?._id !== id);

    setSelected([]);
    setTableData(deleteRow);

    if (page > 0) {
      if (dataInPage.length < 2) {
        setPage(page - 1);
      }
    }
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterRole('all');
    setFilterStatus('all');
  };

  const loadData = useCallback(async () => {
    if (!user?.companyID) {
      console.error('Company ID is missing', user);
      setTableData([]);
      setDataLoad(false);
      setError('Company ID is missing. Please log in again.');
      return;
    }
    
    try {
      setDataLoad(true);
      setError(null);
      const companyID = user.companyID;
      console.log('Loading payment data for companyID:', companyID);
      const data = await getPaymentData(companyID);
      console.log('Payment data received:', data);
      setTableData(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error loading payment data:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load sales data';
      console.error('Error details:', error?.response?.data || error?.message);
      setTableData([]);
      setError(errorMessage);
    } finally {
      setDataLoad(false);
    }
  }, [user?.companyID]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh data when page becomes visible (user navigates back)
  useEffect(() => {
    const handleFocus = () => {
      if (!dataLoad && user?.companyID) {
        loadData();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [dataLoad, user?.companyID, loadData]);

  // Early return if user is not loaded
  if (!user) {
    return (
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Loader />
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title> Sales: List | Stock Management System </title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Sales History"
          links={[{ name: 'Dashboard', href: PATH_DASHBOARD.root }, { name: 'History' }]}
          action={
            <Button
              variant="outlined"
              onClick={loadData}
              disabled={dataLoad}
              sx={{
                borderColor: '#FF9800',
                color: '#FF9800',
                '&:hover': { borderColor: '#F57C00', backgroundColor: '#fff3e0' },
              }}
            >
              Refresh
            </Button>
          }
        />

        {dataLoad ? (
          <Loader />
        ) : error ? (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" color="error" gutterBottom>
              Error Loading Data
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {error}
            </Typography>
            <Button
              variant="outlined"
              onClick={loadData}
              sx={{ mt: 2 }}
            >
              Retry
            </Button>
          </Card>
        ) : (
          <Card>
            <Divider />

            <PaymenttableToolbar
              isFiltered={isFiltered}
              filterName={filterName}
              filterRole={filterRole}
              optionsRole={ROLE_OPTIONS}
              onFilterName={handleFilterName}
              onFilterRole={handleFilterRole}
              onResetFilter={handleResetFilter}
            />

            <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
              <Scrollbar>
                <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                  <TableHeadCustom
                    order={order}
                    orderBy={orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={tableData.length}
                    numSelected={selected.length}
                    onSort={onSort}
                  />

                  <TableBody>
                    {dataFiltered && dataFiltered.length > 0 ? (
                      dataFiltered
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row) => {
                          if (!row || !row._id) {
                            console.warn('Invalid row data:', row);
                            return null;
                          }
                          try {
                            return (
                              <PaymentTableRow
                                key={row._id}
                                row={row}
                                selected={selected.includes(row._id)}
                                onSelectRow={() => onSelectRow(row._id)}
                                onEditRow={() => handleEditRow(row._id, { state: row })}
                                onDeleteRow={() => handleDeleteRow(row._id)}
                              />
                            );
                          } catch (err) {
                            console.error('Error rendering PaymentTableRow:', err, row);
                            return null;
                          }
                        })
                    ) : null}

                    <TableEmptyRows
                      height={denseHeight}
                      emptyRows={emptyRows(page, rowsPerPage, tableData.length)}
                    />

                    <TableNoData isNotFound={isNotFound} />
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>

            <TablePaginationCustom
              count={dataFiltered.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={onChangePage}
              onRowsPerPageChange={onChangeRowsPerPage}
              //
              dense={dense}
              onChangeDense={onChangeDense}
            />
          </Card>
        )}
      </Container>
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filterName,
  filterStatus,
  filterRole,
}: {
  inputData: NewPaymentCreate[];
  comparator: (a: any, b: any) => number;
  filterName: string;
  filterStatus: string;
  filterRole: string;
}) {
  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    inputData = inputData.filter(
      (payment) =>
        payment &&
        payment.customerName &&
        payment.customerName.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  // if (filterStatus !== 'all') {
  //   inputData = inputData.filter((payment) => payment.status === filterStatus);
  // }

  return inputData;
}
// function paramCase(id: string): string {
//   throw new Error('Function not implemented.');
// }
