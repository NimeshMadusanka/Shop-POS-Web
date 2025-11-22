// @mui
import {
  TableRow,
  TableCell,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from '@mui/material';
import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
// @types
// components

// ----------------------------------------------------------------------

type Props = {
  row: any;
  selected: boolean;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function PayRunTableRow({ row, selected, onSelectRow, onDeleteRow }: Props) {
  const {
    firstName,
    lastName,
    allowances,
    deductions,
    monthlySalary,
    finalSalarymonth,
    epf12month,
    commissionAmount,
    epf8month,

    etf3month,
  } = row;

  const fullName = `${firstName} ${lastName}`;
  const [openViewMoreDialog, setOpenViewMoreDialog] = useState(false);

  const handleViewMoreOpen = () => setOpenViewMoreDialog(true);
  const handleViewMoreClose = () => setOpenViewMoreDialog(false);
  return (
    <TableRow hover selected={selected}>
      <TableCell align="left">{fullName}</TableCell>
      <TableCell align="left">{monthlySalary}</TableCell>

      <TableCell align="left">{allowances}</TableCell>
      <TableCell align="left">{deductions}</TableCell>
      <TableCell align="left">{finalSalarymonth}</TableCell>
      <TableCell align="left" sx={{ display: 'flex' }}>
        <IconButton
          onClick={handleViewMoreOpen}
          sx={{
            backgroundColor: '#000000',
            color: '#ffffff',
            marginLeft: '1rem',
            ':hover': { backgroundColor: '#E9ECEE', color: '#000000' },
          }}
        >
          <VisibilityIcon />
        </IconButton>
      </TableCell>
      {/* View More Dialog */}
      <Dialog open={openViewMoreDialog} onClose={handleViewMoreClose} maxWidth="sm" fullWidth>
        <IconButton
          aria-label="close"
          onClick={() => setOpenViewMoreDialog(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogTitle>
          <Typography variant="h6" align="center" sx={{ fontWeight: 'bold' }}>
            Salary Details
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
              Name: {firstName} {lastName}
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
              Monthly Salary: {monthlySalary?.toFixed(2)}
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
              EPF 8%: {epf8month?.toFixed(2)}
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
              EPF 12%: {epf12month?.toFixed(2)}
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
              Total EPF (20%): {(Number(epf8month || 0) + Number(epf12month || 0)).toFixed(2)}
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
              ETF 3%: {etf3month?.toFixed(2)}
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
              Allowances: {allowances?.toFixed(2)}
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
              Deductions: {deductions?.toFixed(2)}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
              Commisssion Amount: {commissionAmount?.toFixed(2)}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
              Final Salary: {finalSalarymonth?.toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          {/* <Button onClick={handleViewMoreClose} color="primary">
      Close
    </Button> */}
        </DialogActions>
      </Dialog>
    </TableRow>
  );
}
