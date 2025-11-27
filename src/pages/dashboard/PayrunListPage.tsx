import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';
// @mui
import {
  Card,
  Table,
  Divider,
  TableBody,
  Container,
  Typography,
  Grid,
  TextField,
  TableContainer,
} from '@mui/material';
import { getPayRunData } from 'src/api/EmployeeApi';

// routes
import { useAuthContext } from 'src/auth/useAuthContext';
import { PATH_DASHBOARD } from '../../routes/paths';
// @types
import { NewPayRunCreate } from '../../@types/user';
// components
import Scrollbar from '../../components/scrollbar';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';
import {
  useTable,
  getComparator,
  emptyRows,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
  TableNoData,
} from '../../components/table';
import Loader from '../../components/loading-screen';
import { useSnackbar } from '../../components/snackbar';
// sections
import { PayRuntableToolbar, PayRunTableRow } from '../../sections/@dashboard/employee/list';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'fullName', label: 'Full Name', align: 'left' },
  { id: 'monthlySalary', label: 'Basic Salary', align: 'left' },

  { id: 'allowances', label: 'Total Allowance', align: 'left' },
  { id: 'deductions', label: 'Total Deduction', align: 'left' },
  { id: 'finalSalarymonth', label: 'Final Salary', align: 'left' },
  { id: '', label: '', align: 'left' },
];

// ----------------------------------------------------------------------

export default function PayRunListPage() {
  const {
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    selected,
    setSelected,
    onSelectRow,
    onSort,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable({ defaultOrderBy: 'joinDate', defaultOrder: 'desc' });

  const { themeStretch } = useSettingsContext();
  const [tableData, setTableData] = useState<NewPayRunCreate[]>([]);
  const [filterName, setFilterName] = useState('');
  const [filterRegNo, setFilterRegNo] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const { enqueueSnackbar } = useSnackbar();
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dataLoad, setDataLoad] = useState(false);

  const { user } = useAuthContext();

  const loadData = useCallback(async () => {
    if (!user?.companyID) return;
    setDataLoad(true);
    try {
      const data = await getPayRunData(user.companyID, selectedMonth);
      setTableData(data);
    } catch (error) {
      enqueueSnackbar('Failed to fetch pay run data', { variant: 'error' });
    } finally {
      setDataLoad(false);
    }
  }, [user?.companyID, selectedMonth, enqueueSnackbar]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(order, orderBy),
    filterName,
    filterRegNo,
    filterRole,
    filterStatus,
  });

  const dataInPage = dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const denseHeight = 72;
  const isFiltered =
    filterName !== '' || filterRegNo !== '' || filterRole !== 'all' || filterStatus !== 'all';
  const isNotFound =
    (!dataFiltered.length && !!filterName) ||
    (!dataFiltered.length && !!filterRegNo) ||
    (!dataFiltered.length && !!filterRole) ||
    (!dataFiltered.length && !!filterStatus);

  const handleFilterName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterName(e.target.value);
  };

  const handleFilterRegNo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterRegNo(e.target.value);
  };

  const handleFilterRole = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterRole(e.target.value);
  };

  const handleDeleteRow = (id: string) => {
    const deleteRow = tableData.filter((row) => row?._id !== id);
    setSelected([]);
    setTableData(deleteRow);
    if (page > 0 && dataInPage.length < 2) setPage(page - 1);
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterRegNo('');
    setFilterRole('all');
    setFilterStatus('all');
  };

  return (
    <>
      <Helmet>
        <title>Pay Runs</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Pay Runs"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Employee', href: PATH_DASHBOARD.employee.new },
            { name: 'Pay Run List' },
          ]}
        />

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ p: 3, textAlign: 'center', backgroundColor: '#FFE0B2' }}>
              <Typography variant="h6">Total Employees</Typography>
              <Typography variant="h4">{tableData.length}</Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ p: 3, textAlign: 'center', backgroundColor: '#FFE0B2' }}>
              <Typography variant="h6">Total EPF</Typography>
              <Typography variant="h4">
                {new Intl.NumberFormat('en-LK', {
                  style: 'currency',
                  currency: 'LKR',
                }).format(
                  tableData.reduce(
                    (sum, row) => sum + Number(row.epf8month || 0) + Number(row.epf12month || 0),
                    0
                  )
                )}
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ p: 3, textAlign: 'center', backgroundColor: '#FFE0B2' }}>
              <Typography variant="h6">Total Allowances</Typography>
              <Typography variant="h4">
                {new Intl.NumberFormat('en-LK', {
                  style: 'currency',
                  currency: 'LKR',
                }).format(tableData.reduce((sum, row) => sum + Number(row.allowances || 0), 0))}
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ p: 3, textAlign: 'center', backgroundColor: '#FFE0B2' }}>
              <Typography variant="h6">Total Deductions</Typography>
              <Typography variant="h4">
                {new Intl.NumberFormat('en-LK', {
                  style: 'currency',
                  currency: 'LKR',
                }).format(tableData.reduce((sum, row) => sum + Number(row.deductions || 0), 0))}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Month Picker */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <TextField
              label="Select Month"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              fullWidth
            />
          </Grid>
        </Grid>

        {dataLoad ? (
          <Loader />
        ) : (
          <Card>
            <Divider />
            <PayRuntableToolbar
              isFiltered={isFiltered}
              filterName={filterName}
              filterRegNo={filterRegNo}
              filterRole={filterRole}
              onFilterName={handleFilterName}
              onFilterRegNo={handleFilterRegNo}
              onFilterRole={handleFilterRole}
              onResetFilter={handleResetFilter}
            />
            <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
              <Scrollbar>
                <Table size="medium" sx={{ minWidth: 800 }}>
                  <TableHeadCustom
                    order={order}
                    orderBy={orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={tableData.length}
                    numSelected={selected.length}
                    onSort={onSort}
                  />
                  <TableBody>
                    {dataFiltered
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row) => (
                        <PayRunTableRow
                          key={row._id}
                          row={row}
                          selected={selected.includes(row._id)}
                          onSelectRow={() => onSelectRow(row._id)}
                          onDeleteRow={() => handleDeleteRow(row._id)}
                        />
                      ))}
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
  filterRegNo,
  filterStatus,
  filterRole,
}: {
  inputData: NewPayRunCreate[];
  comparator: (a: any, b: any) => number;
  filterName: string;
  filterRegNo: string;
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
    inputData = inputData.filter((employee) =>
      employee.firstName?.toLowerCase().includes(filterName.toLowerCase())
    );
  }

  // if (filterRegNo) {
  //   inputData = inputData.filter((employee) =>
  //     employee.regNo?.toLowerCase().includes(filterRegNo.toLowerCase())
  //   );
  // }

  return inputData;
}
