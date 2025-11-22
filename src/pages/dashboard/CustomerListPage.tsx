import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';
import { paramCase } from 'change-case';
// @mui
import { Card, Table, Divider, TableBody, Container, TableContainer } from '@mui/material';
import { getCustomernewData } from 'src/api/CustomerApi';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// @types
import { NewCustomerCreate } from '../../@types/user';
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
import { useAuthContext } from 'src/auth/useAuthContext';
import { useNavigate } from 'react-router-dom';
// sections
import { CustomertableToolbar, CustomerTableRow } from '../../sections/@dashboard/customer/list';

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
  { id: 'firstName', label: 'Customer Name', align: 'left' },
  { id: 'phoneNumber', label: 'phoneNumber', align: 'left' },
  { id: 'email', label: 'Email', align: 'left' },
  { id: 'status', label: 'Status', align: 'left' },
  { id: '', label: 'Action', align: 'left' },
  { id: '' },
];

// ----------------------------------------------------------------------
export default function CustomerListPage() {
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
    defaultOrderBy: 'joinDate',
    defaultOrder: 'desc',
  });

  const { themeStretch } = useSettingsContext();

  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);

  const [filterName, setFilterName] = useState('');
  const { user } = useAuthContext();

  const [filterRole, setFilterRole] = useState('all');

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
    (!dataFiltered.length && !!filterStatus);

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleFilterRole = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterRole(event.target.value);
  };

  const handleEditRow = (id: string, row: any) => {
    navigate(PATH_DASHBOARD.customer.edit(paramCase(id)), row);
  };

  const handleDeleteRow = (id: string) => {
    const deleteRow = tableData.filter((row: NewCustomerCreate) => row?._id !== id);

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

  const [dataLoad, setDataLoad] = useState(false);
  const loadData = useCallback(async () => {
    setDataLoad(true);
    const companyID = user?.companyID;
    const data = await getCustomernewData(companyID);
    setTableData(data);
    setDataLoad(false);
  }, [user?.companyID]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <>
      <Helmet>
        <title> Customers: List | POS System</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Customer list"
          links={[{ name: 'Dashboard', href: PATH_DASHBOARD.root }, { name: 'History' }]}
        />

        {dataLoad ? (
          <Loader />
        ) : (
          <Card>
            <Divider />

            <CustomertableToolbar
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
                    {dataFiltered
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row) => (
                        <CustomerTableRow
                          key={row._id}
                          row={row}
                          selected={selected.includes(row._id)}
                          onSelectRow={() => onSelectRow(row._id)}
                          onEditRow={() => handleEditRow(row._id, { state: row })}
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
  inputData: NewCustomerCreate[];
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
        payment.firstName &&
        payment.firstName.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  //   if (filterStatus !== 'all') {
  //     inputData = inputData.filter((payment) => payment.status === filterStatus);
  //   }

  return inputData;
}
// function paramCase(id: string): string {
//   throw new Error('Function not implemented.');
// }
