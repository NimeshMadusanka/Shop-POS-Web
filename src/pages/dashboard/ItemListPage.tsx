import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';
import { paramCase } from 'change-case';
// @mui
import { Card, Table, Divider, TableBody, Container, TableContainer, Tabs, Tab } from '@mui/material';
import { getItemData } from 'src/api/ItemApi';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// @types
import { NewItemCreate } from '../../@types/user';
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
import { ItemtableToolbar, ItemTableRow } from '../../sections/@dashboard/item/list';
import StockManagementTableRow from '../../sections/@dashboard/item/StockManagementTableRow';

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
  { id: 'itemName', label: 'Product Name', align: 'left' },
  { id: 'itemCategory', label: 'Product Category', align: 'left' },
  { id: 'itemPrice', label: 'Product Price(Rs)', align: 'left' },
  { id: 'itemDuration', label: 'Unit', align: 'left' },
  { id: 'stockQuantity', label: 'Stock Quantity', align: 'left' },
  { id: '', label: 'Action', align: 'center' },
];

// ----------------------------------------------------------------------
export default function PaymentListPage() {
  const {
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

  const denseHeight = 72;

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
    navigate(PATH_DASHBOARD.item.edit(paramCase(id)), row);
  };

  const handleDeleteRow = (id: string) => {
    const deleteRow = tableData.filter((row: NewItemCreate) => row?._id !== id);

    setSelected([]);
    setTableData(deleteRow);

    if (page > 0) {
      if (dataInPage.length < 2) {
        setPage(page - 1);
      }
    }
  };

  const handleStockUpdate = () => {
    loadData();
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterRole('all');
    setFilterStatus('all');
  };

  const [dataLoad, setDataLoad] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  
  const loadData = useCallback(async () => {
    setDataLoad(true);
    const companyID = user?.companyID;
    const data = await getItemData(companyID);
    setTableData(data);
    setDataLoad(false);
  }, [user?.companyID]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <>
      <Helmet>
        <title> Products: List | Stock Management System </title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Products"
          links={[{ name: 'Dashboard', href: PATH_DASHBOARD.root }, { name: 'Products' }]}
        />

        <Card>
          <Tabs value={currentTab} onChange={handleTabChange} sx={{ px: 3, pt: 2 }}>
            <Tab label="Products" />
            <Tab label="Stock Management" />
          </Tabs>

          <Divider />

          {currentTab === 0 ? (
            <>
              {dataLoad ? (
                <Loader />
              ) : (
                <>
                  <ItemtableToolbar
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
                              <ItemTableRow
                                key={row._id}
                                row={row}
                                selected={selected.includes(row._id)}
                                onSelectRow={() => onSelectRow(row._id)}
                                onEditRow={() => handleEditRow(row._id, { state: row })}
                                onDeleteRow={() => handleDeleteRow(row._id)}
                                onStockUpdate={handleStockUpdate}
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
                  />
                </>
              )}
            </>
          ) : (
            <>
              {dataLoad ? (
                <Loader />
              ) : (
                <>
                  <ItemtableToolbar
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
                      <Table size="medium" sx={{ minWidth: 800 }}>
                        <TableHeadCustom
                          order={order}
                          orderBy={orderBy}
                          headLabel={[
                            { id: 'itemName', label: 'Product Name', align: 'left' },
                            { id: 'itemCategory', label: 'Category', align: 'left' },
                            { id: 'stockQuantity', label: 'Stock Quantity', align: 'left' },
                            { id: '', label: 'Action', align: 'center' },
                          ]}
                          rowCount={tableData.length}
                          numSelected={selected.length}
                          onSort={onSort}
                        />

                        <TableBody>
                          {dataFiltered
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row) => (
                              <StockManagementTableRow
                                key={row._id}
                                row={row}
                                selected={selected.includes(row._id)}
                                onSelectRow={() => onSelectRow(row._id)}
                                onStockUpdate={handleStockUpdate}
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
                  />
                </>
              )}
            </>
          )}
        </Card>
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
  inputData: NewItemCreate[];
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
        payment.itemName &&
        payment.itemName.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
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
