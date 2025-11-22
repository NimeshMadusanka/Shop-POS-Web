import { Helmet } from 'react-helmet-async';
import { paramCase } from 'change-case';
import { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import { Card, Table, Button, Divider, TableBody, Container, TableContainer } from '@mui/material';
// import { getCompanyData } from 'src/api/CompanyApi';

import { PATH_DASHBOARD, PATH_AUTH } from '../../routes/paths';

import { NewCompanyCreate } from '../../@types/user';

import Iconify from '../../components/iconify';
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
// sections
import { CompanytableToolbar, CompanyTableRow } from '../../sections/@dashboard/company/list';

// ----------------------------------------------------------------------

const ROLE_OPTIONS = [
  'all',
  'ux designer',
  'full stack designer',
  'backend developer',
  'project manager',
  'leader',
  'ui designer',
  'ui/ux designer',
  'front end developer',
  'full stack developer',
];

const TABLE_HEAD = [
  { id: 'companyName', label: 'Company Name', align: 'left' },
  { id: 'companyEmail', label: 'Company Email', align: 'left' },
  { id: 'companyType', label: 'Company Type', align: 'left' },
  { id: 'country', label: 'Country', align: 'left' },
  { id: 'phoneNumber', label: 'Phone Number', align: 'left' },
  { id: '' },
];

// ----------------------------------------------------------------------

export default function CompanyListPage() {
  const {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    selected,
    setSelected,
    onSelectRow,
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

  const [tableData, setTableData] = useState<NewCompanyCreate[]>([]);

  const [filterName, setFilterName] = useState('');

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

  const handleDeleteRow = (id: string) => {
    const deleteRow = tableData.filter((row: NewCompanyCreate) => row?._id !== id);
    setSelected([]);
    setTableData(deleteRow);

    if (page > 0 && dataInPage.length < 2) {
      setPage(page - 1);
    }
  };

  const handleEditRow = (id: string, row: any) => {
    navigate(PATH_AUTH.company.edit(paramCase(id)), row);
  };
  const handlePathCompanies = () => {
    navigate(PATH_DASHBOARD.root);
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterRole('all');
    setFilterStatus('all');
  };

  const [dataLoad, setDataLoad] = useState(false);
  const loadData = useCallback(async () => {
    setDataLoad(true);
    try {
      // const data = await getCompanyData();
      // setTableData(data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setDataLoad(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <>
      <Helmet>
        <title>Company: List | HR System</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Company list"
          links={[
            { name: 'Dashboard', href: PATH_AUTH.root },
            { name: 'Company', href: PATH_AUTH.company.new },
            { name: 'List' },
          ]}
          action={
            <Button
              component={RouterLink}
              to={PATH_AUTH.company.new}
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
              sx={{
                backgroundColor: '#1D355E',
                fontWeight: 500,
                letterSpacing: 0,
                opacity: 1,
                ':hover': {
                  backgroundColor: '#E3DDD9',
                },
              }}
            >
              New Company
            </Button>
          }
        />

        {dataLoad ? (
          <Loader />
        ) : (
          <Card>
            <Divider />

            <CompanytableToolbar
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
                        <CompanyTableRow
                          key={row._id}
                          row={row}
                          selected={selected.includes(row._id)}
                          onSelectRow={() => onSelectRow(row._id)}
                          onDeleteRow={() => handleDeleteRow(row._id)}
                          onEditRow={() => handleEditRow(row.companyName, { state: row })}
                          oncompanyRow={() => handlePathCompanies()}
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
  inputData: NewCompanyCreate[];
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
      (company) => company.companyName.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  return inputData;
}
