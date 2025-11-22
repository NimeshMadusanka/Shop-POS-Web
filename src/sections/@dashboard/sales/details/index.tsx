// @mui
import * as React from 'react';
import { useEffect } from 'react';

import {
  Box,
  Card,
  Grid,
  Table,
  Divider,
  TableRow,
  TableHead,
  TableCell,
  Typography,
  TableContainer,
  Button,
} from '@mui/material';
// components
import Scrollbar from '../../../../components/scrollbar';
import { TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import MrTraveller from '../../../../assets/logo.png';
// import { getStockInData, getStockMonthlyData } from '../../../../api/ProductmetaApi';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export default function InvoiceDetails() {
  // const [productData, setProductData] = React.useState<Product[]>([]);
  const [value, setValue] = React.useState<Date | null>(new Date());
  const [monthValue, setMonthValue] = React.useState<Date | null>(new Date());

  const [sales, setSales] = React.useState(true);
  const GetProducts = async (data: any) => {
    if (sales) {
      setValue(data);
      // const payload = {
      //   date: data?.toISOString(),
      // };
      // const product = await getStockInData(payload);
      // setProductData(product);
    } else {
      // const payload = {
      //   year: data.getFullYear(),
      //   month: data.getMonth() + 1,
      // };
      setMonthValue(data);
      // const product = await getStockMonthlyData(payload);
      // setProductData(product);
    }
  };
  useEffect(() => {
    GetProducts(value);
    // eslint-disable-next-line
  }, [sales]);

  const handleDailySales = () => {
    setSales(true);
  };
  const handleMonthlySales = () => {
    setSales(false);
  };

  // const totalRate = productData.reduce((sum, item) => {
  //   return sum + (item?.rate || 0);
  // }, 0);

  return (
    <>
      <Button
        type="submit"
        variant="contained"
        onClick={handleDailySales}
        sx={{
          backgroundColor: '#6E9FC1',
          color: '#ffffff',
          fontWeight: 500,
          letterSpacing: 0,
          marginBottom: 2,
          opacity: 1,
          ':hover': {
            backgroundColor: '#E9ECEE',
            color: '#7A4100',
          },
        }}
      >
        Daily Sales
      </Button>
      <Button
        type="submit"
        variant="contained"
        onClick={handleMonthlySales}
        sx={{
          backgroundColor: '#0066CC',
          color: '#ffffff',
          fontWeight: 500,
          marginBottom: 2,
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
        Monthly sales
      </Button>
      <Grid container xs={12} sm={6} md={4} lg={3} xl={3} sx={{ mt: 2, mb: 2 }}>
        {sales ? (
          <DatePicker
            label="Select Date"
            value={value}
            onChange={(newValue) => GetProducts(newValue)}
            disableFuture
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        ) : (
          <DatePicker
            label="Select Month and Year"
            views={['year', 'month']}
            value={monthValue}
            onChange={(newValue) => GetProducts(newValue)}
            disableFuture
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        )}
      </Grid>
      {/* <InvoiceToolbar productData={productData} totalRate={totalRate} /> */}
      <Card sx={{ pt: 5, px: 5 }}>
        <Grid container>
          <Grid item xs={12} sm={2} sx={{ mb: 5 }}>
            <img src={MrTraveller} alt="" style={{ maxWidth: 80 }} />
          </Grid>
          <Grid item xs={12} sm={10} sx={{ mb: 5 }}>
            <Box sx={{ textAlign: { sm: 'left' } }}>
              <Typography variant="h3">Joash Cold Storage Services</Typography>{' '}
              <Typography variant="body2">BR Reg No: WCO/02152</Typography>
            </Box>
          </Grid>
          <Typography variant="h5" sx={{ color: '#000' }}>
            {sales ? 'Daily Sales Report' : 'Monthly Sales Report'}
          </Typography>
        </Grid>

        <TableContainer sx={{ overflow: 'unset' }}>
          <Scrollbar>
            <Table>
              <TableHead
                sx={{
                  borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
                  '& th': { backgroundColor: 'transparent' },
                }}
              >
                <TableRow>
                  <TableCell align="left">Item</TableCell>
                  <TableCell align="left">StockIn (Kg)</TableCell>
                  <TableCell align="left">StockOut (Kg)</TableCell>
                  <TableCell align="left"></TableCell>
                  <TableCell align="left"></TableCell>
                  <TableCell align="right">Sales</TableCell>
                </TableRow>
              </TableHead>

              {/* <TableBody>
                {productData.map((item: Product) => (
                  <TableRow
                    sx={{
                      borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
                    }}
                  >
                    <TableCell align="left" key={item.name}>
                      <Box sx={{ maxWidth: 560 }}>
                        <Typography variant="subtitle2">{item.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="left">{item?.stockInWeight}</TableCell>
                    <TableCell align="left">{item?.stockOutWeight}</TableCell>
                    <TableCell align="left"></TableCell>
                    <TableCell align="left"></TableCell>

                    <TableCell align="right">{item?.rate}</TableCell>
                  </TableRow>
                ))}

                <StyledRowResult>
                  <TableCell colSpan={4} />

                  <TableCell align="right" sx={{ typography: 'body1' }}>
                    <Box sx={{ mt: 5 }} />
                    Subtotal
                  </TableCell>

                  <TableCell align="right" width={120} sx={{ typography: 'body1' }}>
                    <Box sx={{ mt: 5 }} />
                    {`${totalRate}.00`}
                  </TableCell>
                </StyledRowResult>
                <StyledRowResult>
                  <TableCell colSpan={4} />

                  <TableCell align="right" sx={{ typography: 'h6' }}>
                    Grand Total (LKR)
                  </TableCell>

                  <TableCell align="right" width={140} sx={{ typography: 'h6' }}>
                    {`${totalRate}.00`}
                  </TableCell>
                </StyledRowResult>
              </TableBody> */}
            </Table>
          </Scrollbar>
        </TableContainer>

        <Grid
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            textAlign: 'center',
            marginTop: '5rem',
          }}
        >
          <Typography variant="h5">End of Invoice</Typography>{' '}
        </Grid>
        <Divider sx={{ mt: 2 }} />
        <Grid
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            textAlign: 'center',
            margin: '2rem',
          }}
        >
          <Typography>Designed and Developed by Ollcode</Typography>
        </Grid>
      </Card>
    </>
  );
}
