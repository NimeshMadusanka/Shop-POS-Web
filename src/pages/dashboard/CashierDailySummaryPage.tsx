import { Helmet } from 'react-helmet-async';
import { Container, Typography } from '@mui/material';
import { useAuthContext } from '../../auth/useAuthContext';
import { useSettingsContext } from '../../components/settings';
import CashierDailySummary from '../../sections/@dashboard/cashier/CashierDailySummary';

export default function CashierDailySummaryPage() {
  const { user } = useAuthContext();
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Helmet>
        <title> Cashier Daily Summary | POS System </title>
      </Helmet>
      <Container maxWidth={themeStretch ? false : 'lg'} sx={{ pt: 2 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Daily Sales Summary
        </Typography>
        {user?.companyID ? (
          <CashierDailySummary companyID={user.companyID} refreshKey={0} />
        ) : (
          <Typography color="error">Company ID is missing.</Typography>
        )}
      </Container>
    </>
  );
}

