import { useState } from 'react';

// @mui
import {
  Stack,
  TableRow,
  TableCell,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
} from '@mui/material';
// @types
import { NewAppointmentCreate } from '../../../../@types/user';

import { useSnackbar } from '../../../../components/snackbar';
import CloseIcon from '@mui/icons-material/Close';

// Import your helper
import { getEmployeeData } from '../../../../api/EmployeeApi'; // Update path if needed
import {
  updateAppointmentApi,
  updateEmpAppointmentApi,
  sendAppointmentEmailApi,
} from '../../../../api/AppointmentApi';

// ----------------------------------------------------------------------

type Props = {
  row: NewAppointmentCreate;
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  companyID: string; // Make sure to pass this prop from parent
};

export default function AppointmentTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  companyID,
}: Props) {
  const { _id, customerID, date, itemID, time } = row;

  const [openDialog, setOpenDialog] = useState(false);
  const [assignee, setAssignee] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [employees, setEmployees] = useState<{ _id: string; firstName: string; email: string }[]>(
    []
  );

  const handleOpenDialog = () => {
    setOpenDialog(true);
    fetchEmployees();
  };
  const handleOpenStatusDialog = () => {
    setStatusDialogOpen(true);
  };

  const updateStatus = async (newStatus: 'Approved' | 'Cancelled') => {
    try {
      await updateAppointmentApi({ status: newStatus }, _id);

      if (newStatus === 'Approved') {
        enqueueSnackbar('Appointment approved successfully!', { variant: 'success' });
      } else if (newStatus === 'Cancelled') {
        enqueueSnackbar('Appointment rejected successfully!', { variant: 'success' });
      }
    } catch (error) {
      console.error('Failed to update appointment status:', error);
    } finally {
      handleCloseStatusDialog();
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await getEmployeeData(companyID);
      setEmployees(data); // Ensure `data` is an array of { id, name }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const handleCloseDialog = () => setOpenDialog(false);
  const handleCloseStatusDialog = () => setStatusDialogOpen(false);

  const handleAssign = async () => {
    try {
      const selectedEmp = employees.find((emp) => emp._id === assignee);
      if (!selectedEmp) {
        console.error('Selected employee not found');
        return;
      }

      await updateEmpAppointmentApi(
        {
          assignEmpID: assignee,
          assignStatus: 'assigned',
        },
        _id
      );
      await sendAppointmentEmailApi(
        selectedEmp.email,
        'New Appointment Assigned',
        `Hello ${selectedEmp.firstName},\n\nYou have been assigned to a new appointment scheduled on ${date} at ${time}.`
      );
      enqueueSnackbar('Employee email sent successfully!');
     
    } catch (error) {
      console.error('Failed to assign appointment:', error);
    } finally {
      handleCloseDialog();
    }
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="subtitle2" noWrap>
              {customerID?.firstName || 'N/A'}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell align="left">{itemID?.itemName || 'N/A'}</TableCell>
        <TableCell align="left">{date}</TableCell>
        <TableCell align="left">{time}</TableCell>

        <TableCell align="left">
          <Button
            onClick={handleOpenStatusDialog}
            sx={{
              ml: 1,
              backgroundColor: '#0066CC',
              fontWeight: 500,
              minWidth: 90,
              color: '#ffffff',
              letterSpacing: 0,
              opacity: 1,
              ':hover': {
                backgroundColor: '#6E9FC1',
                color: '#ffffff',
              },
              '&.Mui-disabled': {
                backgroundColor: '#ffffff',
                color: 'green',
                fontWeight: 'bold',
                border: '1px solid green',
                opacity: 0.5,
              },
            }}
            variant="outlined"
            disabled={row.status === 'Approved' || row.status === 'Cancelled'}
          >
            Approve
          </Button>
          {row.status === 'Approved' && (
            <Button
              onClick={handleOpenDialog}
              sx={{
                ml: 1,
                backgroundColor: '#000000',
                fontWeight: 500,
                minWidth: 90,
                color: '#ffffff',
                letterSpacing: 0,
                opacity: 1,
                ':hover': {
                  backgroundColor: '#6E9FC1',
                  color: '#ffffff',
                },
                '&.Mui-disabled': {
                  backgroundColor: '#ffffff',
                  color: '#555555',
                  fontWeight: 'bold',
                  border: '1px solid #D3D3D3',
                  opacity: 0.5,
                },
              }}
              disabled={row.assignStatus === 'assigned'}
            >
              Assign
            </Button>
          )}

          {row.status === 'Cancelled' && (
            <Button
              sx={{
                ml: 1,
                minWidth: 90,

                '&.Mui-disabled': {
                  color: 'red',
                  borderColor: 'red',
                  opacity: 0.7,
                },
              }}
              variant="outlined"
              disabled
            >
              Rejected
            </Button>
          )}
        </TableCell>
      </TableRow>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Assign Appointment</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="assignee-label">Assign to</InputLabel>
            <Select
              labelId="assignee-label"
              value={assignee}
              label="Assign to"
              onChange={(e) => {
                console.log('Selected:', e.target.value);
                setAssignee(e.target.value.toString());
              }}
            >
              {employees.length === 0 ? (
                <MenuItem disabled>No employees available</MenuItem>
              ) : (
                employees.map((emp) => (
                  <MenuItem key={emp._id} value={emp._id}>
                    {emp.firstName}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          <Button
            onClick={handleAssign}
            variant="contained"
            disabled={!assignee}
            sx={{
              backgroundColor: '#0066CC',
              fontWeight: 500,
              letterSpacing: 0,
              opacity: 1,
              ':hover': {
                backgroundColor: '#6E9FC1',
                color: '#ffffff',
              },
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={statusDialogOpen} onClose={handleCloseStatusDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Update Appointment Status</DialogTitle>
        <DialogContent>
          <Typography>Do you want to approve or reject this appointment?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => updateStatus('Cancelled')}
            sx={{
              ml: 1,
              backgroundColor: '#0066CC',
              fontWeight: 500,
              color: '#ffffff',
              letterSpacing: 0,
              opacity: 1,
              ':hover': {
                backgroundColor: '#6E9FC1',
                color: '#ffffff',
              },
            }}
          >
            Reject
          </Button>
          <Button
            onClick={() => updateStatus('Approved')}
            sx={{
              ml: 1,
              backgroundColor: '#0066CC',
              fontWeight: 500,
              color: '#ffffff',
              letterSpacing: 0,
              opacity: 1,
              ':hover': {
                backgroundColor: '#6E9FC1',
                color: '#ffffff',
              },
            }}
            variant="contained"
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
