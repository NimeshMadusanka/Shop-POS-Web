import { Helmet } from 'react-helmet-async';
import { Container, useMediaQuery } from '@mui/material';
import { PATH_DASHBOARD } from '../../routes/paths';
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';

// Desktop form
import PaymentNewEditForm from '../../sections/@dashboard/payment/PaymentNewEditForm';
// Tablet form
import PaymentNewEditFormTablet from '../../sections/@dashboard/payment/PaymentNewEditFormTablet';

// ----------------------------------------------------------------------

export default function CreateStockOut() {
  const { themeStretch } = useSettingsContext();
 

  // ✅ Tablet view for screens up to 1024 width (works on 1024×1366 tablets)
  const isTablet = useMediaQuery('(max-width:1024px)');

  return (
    <>
      <Helmet>
        <title> Payments: Payment | POS System </title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Payments"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'View Payments', href: PATH_DASHBOARD.payment.list },
            { name: 'Payment' },
          ]}
        />

        {/* ✅ Show Tablet form OR Desktop form */}
        {isTablet ? <PaymentNewEditFormTablet /> : <PaymentNewEditForm />}
      </Container>
    </>
  );
}
