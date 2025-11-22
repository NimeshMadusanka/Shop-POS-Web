// @mui
import {
  Stack,
  TableRow,
  TableCell,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { useState } from 'react';

import ModeEditIcon from '@mui/icons-material/ModeEdit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import { jsPDF as JsPDF } from 'jspdf';
// @types
import { NewEmployeeCreate } from '../../../../@types/user';

type Props = {
  row: NewEmployeeCreate;
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function ItemTableRow({
  row,
  selected,
  onSelectRow,
  onEditRow,
  onDeleteRow,
}: Props) {
  const {
    firstName,
    lastName,
    nicNumber,

    role,

    monthlySalary,
    allowances,
    deductions,
    epf8month,
    epf12month,
    etf3month,
    apitTaxmonth,

    commissionAmount,

    finalSalarymonth,
  } = row;

  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const finalSalaryCommission = Number(finalSalarymonth || 0) + Number(commissionAmount || 0);

  const GeneratePayslipPDF = () => {
    const doc = new JsPDF();

    const marginLeft = 20;
    const marginTop = 20;
    const tableWidth = 180;
    const colWidth = [45, 45, 45, 45];
    const tableStartY = marginTop + 50;

    const pageWidth = doc.internal.pageSize.width;
    const tableLeft = (pageWidth - tableWidth) / 2;

    // Add Title
    doc.setFontSize(16);
    doc.text('Payslip Details', marginLeft, marginTop);

    // Add Name and NIC on separate lines
    doc.setFontSize(12);
    doc.text(`Name: ${firstName}`, marginLeft, marginTop + 10);
    doc.text(`NIC No: ${nicNumber}`, marginLeft, marginTop + 20);

    // First Row: Earnings and Deductions (2 Columns)
    doc.setFontSize(12);
    doc.setFont('bold');
    doc.rect(tableLeft, tableStartY, tableWidth / 2, 10);
    doc.rect(tableLeft + tableWidth / 2, tableStartY, tableWidth / 2, 10);
    doc.text('Earnings', tableLeft + 5, tableStartY + 7);
    doc.text('Deductions', tableLeft + tableWidth / 2 + 5, tableStartY + 7);

    // Second Row: Column Headers
    const rowHeight = 10;
    let rowY = tableStartY + rowHeight;

    doc.setFont('bold');
    colWidth.forEach((width, i) => {
      doc.rect(tableLeft + colWidth.slice(0, i).reduce((a, b) => a + b, 0), rowY, width, rowHeight);
    });

    doc.text('Earning Type', tableLeft + 5, rowY + 7);
    doc.text('Amount (Rs)', tableLeft + colWidth[0] + 5, rowY + 7);
    doc.text('Deduction Type', tableLeft + colWidth[0] + colWidth[1] + 10, rowY + 7);
    doc.text('Amount (Rs)', tableLeft + colWidth[0] + colWidth[1] + colWidth[2] + 10, rowY + 7);

    rowY += rowHeight;

    // Table Content Rows (Earnings and Deductions)
    const tableData = [
      {
        earning: 'Basic Salary',
        earningAmount: monthlySalary,
        deduction: 'EPF (8%)',
        deductionAmount: epf8month,
      },
      {
        earning: 'EPF (12%)',
        earningAmount: epf12month,
        deduction: 'EPF Total',
        deductionAmount: deductions,
      },
      {
        earning: 'ETF',
        earningAmount: etf3month,
        deduction: 'APIT Tax',
        deductionAmount: apitTaxmonth,
      },
      {
        earning: 'Allowance',
        earningAmount: allowances,
        deduction: 'Deduction',
        deductionAmount: deductions,
      },
    ];

    doc.setFont('normal');
    tableData.forEach((tableRow) => {
      colWidth.forEach((width, i) => {
        doc.rect(
          tableLeft + colWidth.slice(0, i).reduce((a, b) => a + b, 0),
          rowY,
          width,
          rowHeight
        );
      });

      doc.text(tableRow.earning, tableLeft + 5, rowY + 7);
      doc.text(
        tableRow.earningAmount ? `${tableRow.earningAmount}.00` : 'N/A',
        tableLeft + colWidth[0] + 5,
        rowY + 7
      );
      doc.text(tableRow.deduction, tableLeft + colWidth[0] + colWidth[1] + 10, rowY + 7);

      doc.text(
        tableRow.deductionAmount !== null && tableRow.deductionAmount !== undefined
          ? `${tableRow.deductionAmount}.00`
          : 'N/A',
        tableLeft + colWidth[0] + colWidth[1] + colWidth[2] + 10,
        rowY + 7
      );

      rowY += rowHeight;
    });

    doc.rect(tableLeft, rowY, tableWidth, rowHeight);
    doc.text('Final Salary', tableLeft + 5, rowY + 7);
    doc.text(`${finalSalarymonth}.00`, tableLeft + tableWidth - 30, rowY + 7);

    // Save PDF
    doc.save(`${firstName}_Payslip.pdf`);
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="subtitle2" noWrap>
              {`${firstName} ${lastName}`}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell align="left">{role}</TableCell>

        <TableCell align="left">{monthlySalary}</TableCell>

        <TableCell align="left">{finalSalaryCommission}</TableCell>

        <TableCell align="left">
          <Stack direction="row" spacing={1}>
            <IconButton
              aria-label="edit"
              onClick={onEditRow}
              sx={{
                backgroundColor: '#800000',
                color: '#ffffff',
                ':hover': {
                  backgroundColor: '#ffffff',
                  color: '#800000',
                },
              }}
            >
              <ModeEditIcon />
            </IconButton>
            <IconButton
              aria-label="view"
              onClick={handleOpenDialog}
              sx={{
                backgroundColor: '#000000',
                color: '#ffffff',
                ':hover': {
                  backgroundColor: '#ffffff',
                  color: '#000000',
                },
              }}
            >
              <VisibilityIcon />
            </IconButton>
            <IconButton
              onClick={GeneratePayslipPDF}
              sx={{
                backgroundColor: '#0066CC',
                color: '#ffffff',
                marginLeft: '1rem',
                ':hover': { backgroundColor: '#E9ECEE', color: '#0066CC' },
              }}
            >
              <FileDownloadIcon />
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Salary Details
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
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography>
              <strong>Full Name:</strong> {firstName} {lastName}
            </Typography>
            <Typography>
              <strong>NIC Number:</strong> {nicNumber}
            </Typography>
            <Typography>
              <strong>Role:</strong> {role}
            </Typography>
            <Typography>
              <strong>Basic Salary:</strong> {monthlySalary}
            </Typography>
            <Typography>
              <strong>Allowances:</strong> {allowances}
            </Typography>
            <Typography>
              <strong>Deductions:</strong> {deductions}
            </Typography>
            <Typography>
              <strong>Commission Amount:</strong> {commissionAmount}
            </Typography>
            <Typography>
              <strong>EPF 8%:</strong> {epf8month}
            </Typography>
            <Typography>
              <strong>EPF 12%:</strong> {epf12month}
            </Typography>
            <Typography>
              <strong>ETF 3%:</strong> {etf3month}
            </Typography>
            <Typography>
              <strong>Apit Tax:</strong> {apitTaxmonth}
            </Typography>
            <Typography>
              <strong>Final Salary:</strong> {finalSalaryCommission}
            </Typography>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
