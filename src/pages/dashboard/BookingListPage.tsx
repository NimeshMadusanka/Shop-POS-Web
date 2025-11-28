import { Helmet } from 'react-helmet-async';
import { useCallback, useEffect, useState } from 'react';
// @mui
import {
  Tab,
  Tabs,
  Card,
  Table,
  Divider,
  TableBody,
  Container,
  TableContainer,
} from '@mui/material';

import localStorageAvailable from 'src/utils/localStorageAvailable';
import { useSnackbar } from 'notistack';
import { getBookingData, updateBookingData} from 'src/api/Booking';

// @types
import { BookingGeneral } from '../../@types/booking';
// components
import Scrollbar from '../../components/scrollbar';
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
import { BookingTableToolbar, BookingTableRow } from '../../sections/@dashboard/booking';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = ['all', 'approve', 'inactive', 'reject' ]; 


const TABLE_HEAD = [
  { id: 'name', label: 'Name', align: 'left' },
  { id: 'bookingType', label: 'booking type', align: 'left' },
  { id: 'checkingDate', label: 'checking date', align: 'left' },
  { id: 'checkoutDate', label: 'checkout date', align: 'left' },
  { id: 'userName', label: 'user name', align: 'left' },
  { id: 'contactNumber', label: 'contact number', align: 'left' },
  { id: 'status', label: 'Status', align: 'left' },
  { id: 'viewMore', label: 'View more', align: 'left' },
  { id: ''}
];

// ----------------------------------------------------------------------

export default function BookingListPage() {
  const {
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    selected,
    onSelectRow,
    onSort,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable({
    defaultOrderBy: 'joinDate',
    defaultOrder:"desc"
  });

  const { themeStretch } = useSettingsContext();
  const storageAvailable = localStorageAvailable();
  const accessToken = storageAvailable ? sessionStorage.getItem('accessToken') : '';
  const { enqueueSnackbar } = useSnackbar();

  const [tableData, setTableData] = useState([]);

  const [filterName, setFilterName] = useState('');

  const [filterRole, setFilterRole] = useState('all');

  const [openConfirm, setOpenConfirm] = useState({open:false, status:"", id:""});

  const [filterStatus, setFilterStatus] = useState('all');

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(order, orderBy),
    filterName,
    filterRole,
    filterStatus,
  });

  const denseHeight = 72;

  const isFiltered = filterName !== '' || filterRole !== 'all' || filterStatus !== 'all';

  const isNotFound =
    (!dataFiltered.length && !!filterName) ||
    (!dataFiltered.length && !!filterRole) ||
    (!dataFiltered.length && !!filterStatus);

  const handleOpenConfirm = (id:string, status:string,) => {
    setOpenConfirm({open:true, status, id});
  };

  const handleCloseConfirm = () => {
    setOpenConfirm({open:false, status:"", id:""});
  };

  const handleFilterStatus = (event: React.SyntheticEvent<Element, Event>, newValue: string) => {
    setPage(0);
    setFilterStatus(newValue);
  };

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleFilterRole = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterRole(event.target.value);
  };

 
  
  const handleDeleteRow = async (id: any) => {
    try {
      if (accessToken) {
        const response = await updateBookingData(id)
        await loadAccounts();
        setOpenConfirm({open:false, status:"", id:""});
        enqueueSnackbar(response?.message ?? 'success!');
      } else {
        enqueueSnackbar('Invalid token!', {
          variant: 'warning',
        });
      }
    } catch (error) {
      enqueueSnackbar("Something went wrong!", {
        variant: 'warning',
      });
    }
  };


  const handleResetFilter = () => {
    setFilterName('');
    setFilterRole('all');
    setFilterStatus('all');
  };

  const [dataLoad, setDataLoad] = useState(false);

  const loadAccounts= useCallback(async () => {
    try {
      setDataLoad(true);
      const response = await getBookingData();
      setTableData(response);
      setDataLoad(false);
    } catch (error) {
      enqueueSnackbar("Something went wrong!", {
        variant: 'warning',
      })
      setDataLoad(false);
    }
  }, [ enqueueSnackbar]);

  useEffect(() => {
    loadAccounts();
  }, [ loadAccounts])

  return (
    <>
      <Helmet>
        <title> Booking: List | Pathintech UI</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>

        {dataLoad ? (
          <Loader/>
        ):(
          <Card>
            <Tabs
              value={filterStatus}
              onChange={handleFilterStatus}
              sx={{
                px: 2,
                bgcolor: 'background.neutral',
              }}
            >
              {STATUS_OPTIONS?.map((tab) => (
                <Tab key={tab} label={tab} value={tab} />
              ))}
            </Tabs>

            <Divider />

            <BookingTableToolbar
              isFiltered={isFiltered}
              filterName={filterName}
              filterRole={filterRole}
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
                      ?.map((row) => (
                        <BookingTableRow
                          key={row?.id}
                          row={row as BookingGeneral | any}
                          selected={selected?.includes(row?.id)}
                          onSelectRow={() => onSelectRow(row?.id)}
                          onDeleteRow={handleDeleteRow}
                          openConfirm={openConfirm}
                          handleOpenConfirm={handleOpenConfirm}
                          handleCloseConfirm={handleCloseConfirm}
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
  inputData: BookingGeneral[];
  comparator: (a: any, b: any) => number;
  filterName: string;
  filterStatus: string;
  filterRole: string;
}) {
  const stabilizedThis = inputData?.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis?.map((el) => el[0]);

  if (filterName) {
    inputData = inputData.filter(
      (booking) => booking.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  if (filterStatus !== 'all') {
    inputData = inputData.filter((booking) => booking.status === filterStatus);
  }

  return inputData;
}
