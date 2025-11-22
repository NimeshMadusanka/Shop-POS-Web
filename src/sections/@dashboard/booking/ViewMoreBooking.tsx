import * as React from 'react';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { getBookingData } from 'src/api/Booking';
// @mui
import {
  Button,
  Grid,
  Typography
} from '@mui/material';
import { useSnackbar } from '../../../components/snackbar';
import axios from '../../../utils/axios';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export default function CustomizedDialogsBooking({row}:{row:any}) {
  const [open, setOpen] = React.useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const approveBooking = async (id:any) => {
    try {
        const payload = {
          id,
          status: "approve",
        };
        await axios.put(`/booking/status/`, payload);
        await getBookingData();
        enqueueSnackbar('Status change successfully!');
    } catch (error) {
      enqueueSnackbar("Something went wrong!", {
        variant: 'warning',
      });
    }
  };

  const rejectBooking = async (id:any) => {
    try {
        const payload = {
          id,
          status: "reject",
        };
        await axios.put(`/booking/status/`, payload);
        await getBookingData();
        enqueueSnackbar('Status change successfully!');
    } catch (error) {
      enqueueSnackbar("Something went wrong!", {
        variant: 'warning',
      });
    }
  };

  return (
    <div>
      <Button variant="outlined" onClick={handleClickOpen}>
        View More
      </Button>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        // @ts-ignore
        fullWidth="lg"
        maxHeight="xl"
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Booking details
        </DialogTitle>
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
        <DialogContent dividers>
        <Grid
          style={{
            height: "23rem",
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "flexStart",
          }}
        >
          <Typography gutterBottom> Name   : {row?.name}</Typography>
          <Typography gutterBottom> Booking type   : {row?.bookingType}</Typography>
          <Typography gutterBottom> Checking date   : {new Date(row?.checkingDate).toLocaleString()}</Typography>
          <Typography gutterBottom> Checkout date   : {new Date(row?.checkoutDate).toLocaleString()}</Typography>
          <Typography gutterBottom> User name   : {row?.userName}</Typography>
          <Typography gutterBottom> Contact number  : {row?.contactNumber}</Typography>
          <Typography gutterBottom> Status  : {row?.status}</Typography>
          <Typography gutterBottom> Price  : {row?.price}</Typography>
          <Typography gutterBottom> Discount  : {row?.discount}%</Typography>
          <Typography gutterBottom> Adults  : {row?.adults}</Typography>
          <Typography gutterBottom> Children : {row?.childrens}</Typography>
          <Typography gutterBottom> Number of rooms  : {row?.numberOfRooms}</Typography>
          <Typography gutterBottom> User email  : {row?.userEmail}</Typography>       
        </Grid>

        {row?.status === 'inactive' ? 
          <Grid
            container
            item
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              marginTop: "2rem",
              marginBottom: "2rem",
            }}
          >
            <Button
              variant="contained"
              style={{
                backgroundColor: "green",
                color: "white",
                marginRight: "1rem",
                marginLeft: "1rem",
              }}
              onClick={() => approveBooking(row?._id)}
            >
              Approve
            </Button>

            <Button
              variant="outlined"
              onClick={() => rejectBooking(row?._id)}
              style={{ backgroundColor: "red", color: "white" }}
            >
              REJECT
            </Button>
          </Grid> : ""
          }
        </DialogContent>
      </BootstrapDialog>
    </div>
  );
}