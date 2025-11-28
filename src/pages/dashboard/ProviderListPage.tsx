import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';
import { paramCase } from 'change-case';
// @mui
import { Card, Table, Divider, TableBody, Container, TableContainer, Button } from '@mui/material';
import { getProviderData, deleteProviderApi } from 'src/api/ProviderApi';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
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
import Iconify from '../../components/iconify';
// sections
import { ProviderTableToolbar, ProviderTableRow } from '../../sections/@dashboard/provider/list';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'providerName', label: 'Provider Name', align: 'left' },
  { id: 'contactEmail', label: 'Email', align: 'left' },
  { id: 'contactPhone', label: 'Phone', align: 'left' },
  { id: 'address', label: 'Address', align: 'left' },
  { id: '', label: 'Action', align: 'center' },
];

// ----------------------------------------------------------------------
export default function ProviderListPage() {
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
  } = useTable({
    defaultOrderBy: 'providerName',
    defaultOrder: 'asc',
  });

  const { themeStretch } = useSettingsContext();
  const navigate = useNavigate();
  const [tableData, setTableData] = useState<any[]>([]);
  const [filterName, setFilterName] = useState('');
  const { user } = useAuthContext();
  const [dataLoad, setDataLoad] = useState(false);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const dataInPage = dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const denseHeight = 72;
  const isFiltered = filterName !== '';
  const isNotFound = !dataFiltered.length && !!filterName;

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleEditRow = (id: string, row: any) => {
    navigate(PATH_DASHBOARD.provider.edit(paramCase(id)), { state: row });
  };

  const handleDeleteRow = async (id: string) => {
    try {
      await deleteProviderApi(id);
      const deleteRow = tableData.filter((row: any) => row?._id !== id);
      setSelected([]);
      setTableData(deleteRow);
      if (page > 0) {
        if (dataInPage.length < 2) {
          setPage(page - 1);
        }
      }
    } catch (error: any) {
      console.error('Error deleting provider:', error);
    }
  };

  const handleResetFilter = () => {
    setFilterName('');
  };

  const loadData = useCallback(async () => {
    if (!user?.companyID) return;
    setDataLoad(true);
    try {
      const data = await getProviderData(user.companyID);
      setTableData(data || []);
    } catch (error) {
      console.error('Error loading providers:', error);
    } finally {
      setDataLoad(false);
    }
  }, [user?.companyID]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <>
      <Helmet>
        <title> Providers: List | POS System </title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Providers list"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Providers', href: PATH_DASHBOARD.provider.list },
            { name: 'List' },
          ]}
          action={
            <Button
              variant="contained"
              onClick={() => navigate(PATH_DASHBOARD.provider.new)}
              startIcon={<Iconify icon="eva:plus-fill" />}
            >
              New Provider
            </Button>
          }
        />

        {dataLoad ? (
          <Loader />
        ) : (
          <Card>
            <Divider />

            <ProviderTableToolbar
              isFiltered={isFiltered}
              filterName={filterName}
              onFilterName={handleFilterName}
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
                        <ProviderTableRow
                          key={row._id}
                          row={row}
                          selected={selected.includes(row._id)}
                          onSelectRow={() => onSelectRow(row._id)}
                          onEditRow={() => handleEditRow(row._id, row)}
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
}: {
  inputData: any[];
  comparator: (a: any, b: any) => number;
  filterName: string;
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
      (provider) =>
        provider &&
        (provider.providerName?.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
          provider.contactEmail?.toLowerCase().indexOf(filterName.toLowerCase()) !== -1)
    );
  }

  return inputData;
}

