// import { Helmet } from 'react-helmet-async';
// import { useState, useEffect, useCallback } from 'react';
// // @mui
// import {
//   Card,
//   CardContent,
//   Typography,
//   Container,
//   Grid,
//   Divider,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   TextField
// } from '@mui/material';
// import { getCategoryData } from 'src/api/CategoryApi';
// // routes
// import { PATH_DASHBOARD } from '../../routes/paths';
// // @types
// import { NewCategoryCreate } from '../../@types/user';
// // components
// import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// import Loader from '../../components/loading-screen';
// import { useSettingsContext } from '../../components/settings';
// import { useLocation } from "react-router-dom";

// export default function CustomerListPage() {
//   const { themeStretch } = useSettingsContext();
//   const [tableData, setTableData] = useState<NewCategoryCreate[]>([]);
//   const [dataLoad, setDataLoad] = useState(false);

//   // Dialog states
//   const [openCash, setOpenCash] = useState(false);
//   const [openWire, setOpenWire] = useState(false);

//   const [amount, setAmount] = useState('');
//   const [wireAmount, setWireAmount] = useState('');
//   const [pdfFile, setPdfFile] = useState<File | null>(null);
//   const location = useLocation();
// const grandTotal = location.state?.grandTotal;
// const paymentId = location.state?.paymentId;
// const [totalPayment, setTotalPayment] = useState<number>(grandTotal || 0);
// const [cashPaid, setCashPaid] = useState<number>(0);
// const [wirePaid, setWirePaid] = useState<number>(0);


//   const loadData = useCallback(async () => {
//     setDataLoad(true);
//     const data = await getCategoryData();
//     setTableData(data);
//     setDataLoad(false);
//   }, []);

//   useEffect(() => {
//     loadData();
//   }, [loadData]);

  

//   const handleConfirmCash = async () => {
//   const newCashPaid = cashPaid + Number(amount);
//   setCashPaid(newCashPaid);

 

//   setOpenCash(false);
//   setAmount('');
// };

// const handleConfirmWire = async () => {
//   const newWirePaid = wirePaid + Number(wireAmount);
//   setWirePaid(newWirePaid);

 

//   setOpenWire(false);
//   setWireAmount('');
//   setPdfFile(null);
// };


//   return (
//     <>
//       <Helmet>
//         <title> Categories: View | POS system </title>
//       </Helmet>

//       <Container maxWidth={themeStretch ? false : 'lg'}>
//   <CustomBreadcrumbs
//     heading="Category view"
//     links={[{ name: 'Dashboard', href: PATH_DASHBOARD.root }, { name: 'Payment Methods' }]}
//   />

//   {dataLoad ? (
//     <Loader />
//   ) : (
//     <>
//       <Divider sx={{ mb: 3 }} />

      

     
//       <Grid container spacing={3}>
       
//         <Grid item xs={12} md={6}>
//           <Card
//             sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6, transform: 'scale(1.03)', transition: '0.3s' } }}
//             onClick={() => setOpenCash(true)}
//           >
//             <CardContent>
//               <Typography variant="h5" gutterBottom>Cash</Typography>
//               <Typography variant="body2">Manage all cash-related transactions here.</Typography>
//             </CardContent>
//           </Card>
//         </Grid>

    
//         <Grid item xs={12} md={6}>
//           <Card
//             sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6, transform: 'scale(1.03)', transition: '0.3s' } }}
//             onClick={() => setOpenWire(true)}
//           >
//             <CardContent>
//               <Typography variant="h5" gutterBottom>Wire Transfer</Typography>
//               <Typography variant="body2">Manage all wire transfer-related transactions here.</Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>


//        <Grid container spacing={3} sx={{ mb: 3 }}>
//         <Grid item xs={12}>
//           <Card sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
//             <Typography variant="h6">Payment Summary</Typography>
//             <Typography>Total Payment: {totalPayment}</Typography>
//             <Typography>Cash Paid: {cashPaid}</Typography>
//             <Typography>Wire Transfer Paid: {wirePaid}</Typography>
//           </Card>
//         </Grid>
//       </Grid>

//     </>
//   )}
// </Container>

   
//       <Dialog open={openCash} onClose={() => setOpenCash(false)}>
//         <DialogTitle>Cash Payment</DialogTitle>
//         <DialogContent>
//           <TextField
//             fullWidth
//             label="Enter Amount"
//             type="number"
//             value={amount}
//             onChange={(e) => setAmount(e.target.value)}
//             margin="normal"
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenCash(false)}>Cancel</Button>
//           <Button variant="contained" onClick={handleConfirmCash}>
//             Confirm
//           </Button>
//         </DialogActions>
//       </Dialog>

   
//       <Dialog open={openWire} onClose={() => setOpenWire(false)}>
//         <DialogTitle>Wire Transfer</DialogTitle>
//         <DialogContent>
//           <TextField
//             fullWidth
//             label="Enter Amount"
//             type="number"
//             value={wireAmount}
//             onChange={(e) => setWireAmount(e.target.value)}
//             margin="normal"
//           />
//           <Button
//             variant="outlined"
//             component="label"
//             sx={{ mt: 2 }}
//           >
//             Upload PDF
//             <input
//               type="file"
//               accept="application/pdf"
//               hidden
//               onChange={(e) => setPdfFile(e.target.files ? e.target.files[0] : null)}
//             />
//           </Button>
//           {pdfFile && (
//             <Typography variant="body2" sx={{ mt: 1 }}>
//               Selected File: {pdfFile.name}
//             </Typography>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenWire(false)}>Cancel</Button>
//           <Button variant="contained" onClick={handleConfirmWire}>
//             Confirm
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   );
// }


import { Helmet } from 'react-helmet-async';
import { useState,} from 'react';
// @mui
import {
  Card,
  CardContent,
  Typography,
  Container,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box
} from '@mui/material';

//updatePaymentApi
import { updatePaymentApi } from 'src/api/PaymentApi';
import { useNavigate } from 'react-router-dom';

// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// @types

// components
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import Loader from '../../components/loading-screen';
import { useSettingsContext } from '../../components/settings';
import { useLocation } from "react-router-dom";
import { useSnackbar } from '../../components/snackbar';

export default function CustomerListPage() {
  const { themeStretch } = useSettingsContext();
  // const [tableData, setTableData] = useState<NewCategoryCreate[]>([]);
 const [dataLoad] = useState(false);


  // Dialog states
  const [openCash, setOpenCash] = useState(false);
  const [openWire, setOpenWire] = useState(false);

  const [amount, setAmount] = useState('');
  const [wireAmount, setWireAmount] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const location = useLocation();
  const grandTotal = location.state?.grandTotal || 0;
  const paymentId = location.state?.paymentId;
const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
 const totalPayment = grandTotal;

  const [cashPaid, setCashPaid] = useState<number>(0);
  const [wirePaid, setWirePaid] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // const loadData = useCallback(async () => {
  //   setDataLoad(true);
  //   const data = await getCategoryData();
  //   setTableData(data);
  //   setDataLoad(false);
  // }, []);

  // useEffect(() => {
  //   loadData();
  // }, [loadData]);

  const handleConfirmCash = async () => {
    const newCashPaid = cashPaid + Number(amount);
    setCashPaid(newCashPaid);
    setOpenCash(false);
    setAmount('');
  };

  const handleConfirmWire = async () => {
    const newWirePaid = wirePaid + Number(wireAmount);
    setWirePaid(newWirePaid);
    setOpenWire(false);
    setWireAmount('');
    setPdfFile(null);
  };

  const handleFinalConfirm = async () => {
  if (!paymentId) return;

  try {
    setIsUpdating(true);

    await updatePaymentApi(
      { cashPaid, wirePaid }, // payload
      paymentId,              // id
      true                    // optional boolean
    );

    setIsUpdating(false);
    enqueueSnackbar('Payment Updated successfully!');
    navigate(PATH_DASHBOARD.payment.list);
  } catch (error) {
    console.error('Error updating payment:', error);
    setIsUpdating(false);
   enqueueSnackbar('Failed to updated payment');
  }
};


  return (
    <>
      <Helmet>
        <title> Payment: View | POS system </title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Payment view"
          links={[{ name: 'Dashboard', href: PATH_DASHBOARD.root }, { name: 'Payment Methods' }]}
        />

        {dataLoad ? (
          <Loader />
        ) : (
          <>
            <Divider sx={{ mb: 3 }} />

            {/* Totals Row */}
            {/* <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <Card sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                  <Typography variant="h6">Payment Summary</Typography>
                  <Typography>Total Payment: {totalPayment}</Typography>
                  <Typography>Cash Paid: {cashPaid}</Typography>
                  <Typography>Wire Transfer Paid: {wirePaid}</Typography>
                </Card>
              </Grid>
            </Grid> */}

            {/* Payment Cards */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card
                  sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6, transform: 'scale(1.03)', transition: '0.3s' } , border: '2px solid navy',}}
                  onClick={() => setOpenCash(true)}
                >
                  <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ color:'navy' }}>Cash</Typography>
                 
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card
                  sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6, transform: 'scale(1.03)', transition: '0.3s' } , border: '2px solid navy',}}
                  onClick={() => setOpenWire(true)}
                >
                  <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ color:'navy' }}>Wire Transfer</Typography>
                    {/* <Typography variant="body2">Manage all wire transfer-related transactions here.</Typography> */}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
  {/* <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <Card sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                  <Typography variant="h6">Payment Summary</Typography>
                  <Typography>Total Payment: {totalPayment}</Typography>
                  <Typography>Cash Paid: {cashPaid}</Typography>
                  <Typography>Wire Transfer Paid: {wirePaid}</Typography>
                </Card>
              </Grid>
            </Grid> */}

            <Grid container spacing={1} sx={{ mb: 1,mt: 2 }}>
  <Grid item xs={12}>
    <Card sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Payment Summary
      </Typography>

      {/* Total Payment */}
      <Grid container>
        <Grid item xs={6}>
          <Typography fontWeight="bold">Total Payment</Typography>
        </Grid>
        <Grid item xs={6} sx={{ textAlign: 'right', fontWeight: 'bold' }}>
           LKR {totalPayment.toLocaleString()}
        </Grid>
      </Grid>

      {/* Cash Paid (only if > 0) */}
      {cashPaid > 0 && (
        <Grid container sx={{ mt: 2 }}>
          <Grid item xs={6}>
            <Typography>CASH Paid</Typography>
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'right' }}>
            LKR {cashPaid.toLocaleString()}
          </Grid>
        </Grid>
      )}

      {/* Wire Paid (only if > 0) */}
      {wirePaid > 0 && (
        <Grid container sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <Typography>WireTransfer Paid</Typography>
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'right' }}>
            LKR {wirePaid.toLocaleString()}
          </Grid>
        </Grid>
      )}
    </Card>
  </Grid>
</Grid>

            {/* Confirm Payment Button */}
            <Box display="flex" justifyContent="flex-end" mt={4}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleFinalConfirm}
                
              
              >
                {isUpdating ? 'Updating...' : 'Confirm Payment'}
              </Button>
            </Box>
          </>
        )}
      </Container>

      {/* Cash Dialog */}
      <Dialog open={openCash} onClose={() => setOpenCash(false)}>
        <DialogTitle sx={{ minWidth: 500 }}>Cash Payment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Enter Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCash(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmCash}>Confirm</Button>
        </DialogActions>
      </Dialog>

      {/* Wire Transfer Dialog */}
      <Dialog open={openWire} onClose={() => setOpenWire(false)}>
        <DialogTitle>Wire Transfer</DialogTitle>
        <DialogContent  sx={{ minWidth: 500 }}>
          <TextField
            fullWidth
            label="Enter Amount"
            type="number"
            value={wireAmount}
            onChange={(e) => setWireAmount(e.target.value)}
            margin="normal"
          />
          <Button
            variant="outlined"
            component="label"
            sx={{ mt: 2 }}
          >
            Upload PDF
            <input
              type="file"
              accept="application/pdf"
              hidden
              onChange={(e) => setPdfFile(e.target.files ? e.target.files[0] : null)}
            />
          </Button>
          {pdfFile && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected File: {pdfFile.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenWire(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmWire} >Confirm</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
