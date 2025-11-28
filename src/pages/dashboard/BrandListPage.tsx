import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';
import { paramCase } from 'change-case';
// @mui
import { Card, Table, Divider, TableBody, Container, TableContainer } from '@mui/material';
import { getBrandData, deleteBrandApi } from 'src/api/BrandApi';
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
import { Button } from '@mui/material';
// sections
import { BrandTableToolbar, BrandTableRow } from '../../sections/@dashboard/brand/list';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'brandName', label: 'Brand Name', align: 'left' },
  { id: 'providerName', label: 'Provider', align: 'left' },
  { id: 'description', label: 'Description', align: 'left' },
  { id: '', label: 'Action', align: 'center' },
];

// ----------------------------------------------------------------------
export default function BrandListPage() {
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
    defaultOrderBy: 'brandName',
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
    navigate(PATH_DASHBOARD.brand.edit(paramCase(id)), { 
      state: {
        _id: row._id,
        brandName: row.brandName,
        description: row.description,
        providerId: row.providerId,
        providerName: row.providerName,
      }
    });
  };

  const handleDeleteRow = async (id: string) => {
    try {
      await deleteBrandApi(id);
      const deleteRow = tableData.filter((row: any) => row?._id !== id);
      setSelected([]);
      setTableData(deleteRow);
      if (page > 0) {
        if (dataInPage.length < 2) {
          setPage(page - 1);
        }
      }
    } catch (error: any) {
      console.error('Error deleting brand:', error);
    }
  };

  const handleResetFilter = () => {
    setFilterName('');
  };

  const loadData = useCallback(async () => {
    if (!user?.companyID) return;
    setDataLoad(true);
    try {
      const data = await getBrandData(user.companyID);
      setTableData(data || []);
    } catch (error) {
      console.error('Error loading brands:', error);
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
        <title> Brands: List | POS System </title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Brands list"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Brands', href: PATH_DASHBOARD.brand.list },
            { name: 'List' },
          ]}
          action={
            <Button
              variant="contained"
              onClick={() => navigate(PATH_DASHBOARD.brand.new)}
              startIcon={<Iconify icon="eva:plus-fill" />}
            >
              New Brand
            </Button>
          }
        />

        {dataLoad ? (
          <Loader />
        ) : (
          <Card>
            <Divider />

            <BrandTableToolbar
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
                        <BrandTableRow
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
      (brand) =>
        brand &&
        brand.brandName &&
        brand.brandName.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  return inputData;
}

