import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';
import { paramCase } from 'change-case';
import {
  Card,
  Table,
  Divider,
  Tabs,
  Tab,
  TableBody,
  Container,
  TableContainer,
} from '@mui/material';

import { getAppointmentData } from 'src/api/AppointmentApi';
import { PATH_DASHBOARD } from '../../routes/paths';
import { NewAppointmentCreate } from '../../@types/user';
import Scrollbar from '../../components/scrollbar';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import TableViewIcon from '@mui/icons-material/TableView';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

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
import {
  AppointmenttableToolbar,
  AppointmentTableRow,
} from '../../sections/@dashboard/appointment/list';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

const TABLE_HEAD = [
  { id: 'ClientName', label: 'Client Name', align: 'left' },
  { id: 'ServiceName', label: 'Service Name', align: 'left' },
  { id: 'date', label: 'Date', align: 'left' },
  { id: 'Time', label: 'time', align: 'left' },
  { id: '', label: 'Action', align: 'left' },
  { id: '' },
];

const ROLE_OPTIONS = ['all', 'RiskEngineer', 'Consultant', 'SuperAdmin', '...'];

export default function AppointmentListPage() {
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
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const companyID = user?.companyID;

  const [tableData, setTableData] = useState<NewAppointmentCreate[]>([]);
  const [dataLoad, setDataLoad] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentTab, setCurrentTab] = useState('table');

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };

  const loadData = useCallback(async () => {
    setDataLoad(true);
    const data = await getAppointmentData(companyID);
    setTableData(data);
    setDataLoad(false);
  }, [companyID]);

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
  const denseHeight = 72;

  const isFiltered = filterName !== '' || filterRole !== 'all' || filterStatus !== 'all';
  const isNotFound =
    (!dataFiltered.length && !!filterName) ||
    (!dataFiltered.length && !!filterRole) ||
    (!dataFiltered.length && !!filterStatus);

  const handleEditRow = (id: string, row: any) => {
    navigate(PATH_DASHBOARD.employee.edit(paramCase(id)), row);
  };

  const handleDeleteRow = (id: string) => {
    const deleteRow = tableData.filter((row: NewAppointmentCreate) => row?._id !== id);
    setSelected([]);
    setTableData(deleteRow);
    if (page > 0 && dataInPage.length < 2) setPage(page - 1);
  };

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleFilterRole = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterRole(event.target.value);
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterRole('all');
    setFilterStatus('all');
  };

  return (
    <>
      <Helmet>
        <title>Appointments: List | POS System</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Appointment list"
          links={[{ name: 'Dashboard', href: PATH_DASHBOARD.root }, { name: 'History' }]}
        />

        <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab value="table" icon={<TableViewIcon />} />
          <Tab value="calendar" icon={<CalendarMonthIcon />} />
        </Tabs>

        {dataLoad ? (
          <Loader />
        ) : currentTab === 'table' ? (
          <Card>
            <Divider />
            <AppointmenttableToolbar
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
                    {dataInPage.map((row) => (
                      <AppointmentTableRow
                        key={row._id}
                        row={row}
                        selected={selected.includes(row._id)}
                        onSelectRow={() => onSelectRow(row._id)}
                        onEditRow={() => handleEditRow(row._id, { state: row })}
                        onDeleteRow={() => handleDeleteRow(row._id)}
                        companyID={companyID}
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
        ) : (
//           <FullCalendar
//             plugins={[dayGridPlugin]}
//             initialView="dayGridMonth"
//             height="auto"
//             events={tableData
//               .filter((appointment) => appointment.status !== 'Cancelled') // exclude cancelled
//               .map((appointment) => ({
//                 id: appointment._id,
//                 title: `${
//                   typeof appointment.
// firstName
//  === 'object'
//                     ? appointment.
// firstName
//                     : appointment.
// firstName

//                 } - ${
//                   typeof appointment.itemID === 'object'
//                     ? appointment.itemID.itemName
//                     : appointment.itemID
//                 }`,
//                 extendedProps: {
//                   time: appointment.time,
//                 },
//                 date: appointment.date,
//                 backgroundColor: appointment.status === 'Approved' ? '#4caf50' : undefined,
//                 borderColor: appointment.status === 'Approved' ? '#4caf50' : undefined,
//               }))}
//             eventContent={(arg) => (
//               <>
//                 <div>{arg.event.title}</div>
//                 <div style={{ fontSize: '0.83rem' }}>{arg.event.extendedProps.time}</div>
//               </>
//             )}
//             eventClick={(clickInfo) => {
//               setCurrentTab('table');
//             }}
//           />
<FullCalendar
  plugins={[dayGridPlugin]}
  initialView="dayGridMonth"
  height="auto"
  events={tableData
    .filter((appointment) => appointment.status !== 'Cancelled') // exclude cancelled
    .map((appointment) => ({
      id: appointment._id,
      title: `${
        typeof appointment.customerID === 'object'
          ? appointment.customerID.firstName // ✅ take firstName from populated customerID
          : appointment.customerID
      } - ${
        typeof appointment.itemID === 'object'
          ? appointment.itemID.itemName
          : appointment.itemID
      }`,
      extendedProps: {
        time: appointment.time,
      },
      date: appointment.date,
      backgroundColor: appointment.status === 'Approved' ? '#4caf50' : undefined,
      borderColor: appointment.status === 'Approved' ? '#4caf50' : undefined,
    }))}
/>

        )}
      </Container>
    </>
  );
}

// -----------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filterName,
  filterStatus,
  filterRole,
}: {
  inputData: NewAppointmentCreate[];
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

  // if (filterName) {
  //   inputData = inputData.filter((item) =>
  //     item?.ClientName?.toLowerCase().includes(filterName.toLowerCase())
  //   );
  // }

  // if (filterRole !== 'all') {
  //   inputData = inputData.filter((item) => item?.role?.toLowerCase() === filterRole.toLowerCase());
  // }

  if (filterStatus !== 'all') {
    inputData = inputData.filter(
      (item) => item?.status?.toLowerCase() === filterStatus.toLowerCase()
    );
  }

  return inputData;
}
