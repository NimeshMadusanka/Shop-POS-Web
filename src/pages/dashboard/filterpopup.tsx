import React, { useState, useCallback, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { Grid, Typography, Autocomplete } from '@mui/material';
import { Stack, TextField, Button } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
// import { getCustomerData } from 'src/api/CustomerApi';
// import { getStockOutFilterData1 } from 'src/api/StockApi';
// import { getProductOneData } from '../../../../src/api/ProductmetaApi';
// import { getCustomerOneData } from '../../../../src/api/CustomerApi';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

// const Label = styled(Typography)(({ theme }) => ({
//   fontWeight: 600,
//   color: theme.palette.text.secondary,
//   marginRight: theme.spacing(1),
// }));

// const Value = styled(Typography)(({ theme }) => ({
//   fontWeight: 400,
//   color: theme.palette.text.primary,
// }));
interface Props {
  setTableData: (data: any) => void;
}
// interface ProductData {
//   name: string;
//   description: string;
//   status: string;
//   id: string;
// }

interface Customer {
  firstName: string;
  lastName: string;
  customerAddress: string;
  email: string;
  phoneNumber: string;
  _id: string;
}

export default function CustomizedDialogsStockDetails({ setTableData }: Props) {
  const [open, setOpen] = React.useState(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<Customer[]>([]);

  const handleClickOpen = async () => {
    setOpen(true);
    // const product = await getProductOneData(row.metaId);
    // const customer = await getCustomerOneData(row.customerId);
    // setCustomerData(customer);
    // setProductData(product);
    // if (product) {
    //   setOpen(true);
    // }
  };
  const loadData = useCallback(async () => {
    // const data = await getCustomerData();
    // setCustomerData(data);
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSetTableData = async () => {
    const paylod = {
      customerId: customerId,
      startDate: startDate,
      endDate: endDate,
    };
    // const data = await getStockOutFilterData1(paylod);
    // setTableData(data);
    setOpen(false);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div>
      <IconButton
        aria-label="open"
        onClick={handleClickOpen}
        sx={{
          backgroundColor: '#FF9800',
          color: '#ffffff',
          fontWeight: 500,
          letterSpacing: 0,
          marginLeft: '1rem',
          marginRight: '1rem',
          opacity: 1,
          ':hover': {
            backgroundColor: '#E9ECEE',
            color: '#7A4100',
          },
        }}
      >
        <FilterAltIcon />
      </IconButton>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Sort By
          <IconButton
            aria-label="close"
            onClick={handleClose}
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
          <Grid
            container
            spacing={2}
            sx={{
              maxHeight: '23rem',
              overflowY: 'auto',
              padding: 2,
              backgroundColor: (theme) => theme.palette.background.default,
              borderRadius: 1,
            }}
          >
            <div
              style={{
                padding: '16px',
                backgroundColor: '#fff',
                width: '100%',
                borderRadius: '8px',
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Stack spacing={2} direction="column">
                <Autocomplete
                  fullWidth
                  autoHighlight
                  options={customerData}
                  getOptionLabel={(option) => `${option?.firstName} ${option?.lastName}`} // Combine firstName and lastName
                  isOptionEqualToValue={(option, value) => option._id === value._id} // Ensures proper matching
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Customer"
                      inputProps={{
                        ...params.inputProps,
                        autoComplete: 'new-password', // Disable browser autofill
                      }}
                    />
                  )}
                  onChange={(event, newValue) => {
                    setCustomerId(newValue?._id || null);
                  }}
                />
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />
              </Stack>
              <Stack
                spacing={2}
                direction="column"
                sx={{ alignItems: 'flex-end', paddingTop: '1rem' }}
              >
                <Button
                  variant="contained"
                  onClick={handleSetTableData}
                  sx={{
                    backgroundColor: '#FF9800',
                    fontWeight: 500,
                    letterSpacing: 0,
                    width: '5rem',
                    opacity: 1,
                    ':hover': {
                      backgroundColor: '#FFB74D',
                    },
                  }}
                >
                  Filter
                </Button>
              </Stack>
            </div>
          </Grid>
        </DialogContent>
      </BootstrapDialog>
    </div>
  );
}
