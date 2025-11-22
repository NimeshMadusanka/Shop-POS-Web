import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';
import { paramCase } from 'change-case';
import {
  Card,
  Table,
  Divider,
  TableBody,
  Container,
  TableContainer,
  Grid,
  Typography,
  CardContent,
  Tabs,
  Tab,
} from '@mui/material';
import { getCusloyaltyData } from 'src/api/CusloyaltyApi';
import { PATH_DASHBOARD } from '../../routes/paths';
import { NewCusloyaltyCreate } from '../../@types/user';

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

import {
  CusloyaltytableToolbar,
  CusloyaltyTableRow,
} from '../../sections/@dashboard/cusloyalty/list';
import TableViewIcon from '@mui/icons-material/TableView';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

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
    { id: 'discountName', label: 'Discount Name', align: 'left' },
  { id: 'itemName', label: 'Product Name', align: 'left' },
  { id: 'offPercentage', label: 'Off Percentage(%)', align: 'left' },
  { id: 'description', label: 'Description', align: 'left' },
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
    selected,
    setSelected,
    onSelectRow,
    onSort,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable({ defaultOrderBy: 'joinDate', defaultOrder: 'desc' });

  const { themeStretch } = useSettingsContext();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [tableData, setTableData] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dataLoad, setDataLoad] = useState(false);
  const [currentTab, setCurrentTab] = useState('table');

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };

  const loadData = useCallback(async () => {
    setDataLoad(true);
    const companyID = user?.companyID;
    const data = await getCusloyaltyData(companyID);
    setTableData(data);
    setDataLoad(false);
  }, [user?.companyID]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
    navigate(PATH_DASHBOARD.cusloyalty.edit(paramCase(id)), row);
  };

  const handleDeleteRow = (id: string) => {
    const deleteRow = tableData.filter((row: NewCusloyaltyCreate) => row?._id !== id);
    setSelected([]);
    setTableData(deleteRow);
    if (page > 0 && dataInPage.length < 2) setPage(page - 1);
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterRole('all');
    setFilterStatus('all');
  };

  return (
    <>
      <Helmet>
        <title>Discounts: List | Stock Management System</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Discounts list"
          links={[{ name: 'Dashboard', href: PATH_DASHBOARD.root }, { name: 'Discounts' }]}
        />

        <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab value="table" icon={<TableViewIcon />} />
          <Tab value="card" icon={<ViewModuleIcon />} />
        </Tabs>

        {dataLoad ? (
          <Loader />
        ) : currentTab === 'table' ? (
          <Card>
            <Divider />
            <CusloyaltytableToolbar
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
                    {dataInPage.map((row) => (
                      <CusloyaltyTableRow
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
              dense={dense}
              onChangeDense={onChangeDense}
            />
          </Card>
        ) : (
          <Grid container spacing={3}>
            {dataFiltered.map((row: NewCusloyaltyCreate) => (
              <Grid item xs={12} sm={6} md={4} key={row._id}>
                <Card
                  sx={{
                    p: 2,
                    height: '100%',
                    border: '1px solid #90caf9',
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" color="text.secondary">
                      {row.itemName}
                    </Typography>
                    <Typography variant="h4" color="#000000" paragraph>
                      {row.offPercentage}% OFF
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {row.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
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
  inputData: NewCusloyaltyCreate[];
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
      (payment) => payment?.itemName?.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  return inputData;
}
