import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// sections
import PaymentNewEditForm from '../../sections/@dashboard/payment/PaymentNewEditForm';

// ----------------------------------------------------------------------

export default function ItemEditPage() {
  const { themeStretch } = useSettingsContext();
  const location = useLocation();

  const { _id, itemName, itemCategory, itemPrice, itemDuration } = location.state;

  const userData = { _id, itemName, itemCategory, itemPrice, itemDuration } as any;

  return (
    <>
      <Helmet>
        <title> Sale: Edit sale | Stock Management System</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Edit Sale"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Sales',
              href: PATH_DASHBOARD.payment.list,
            },
            { name: userData?.customerName || 'Sale' },
          ]}
        />

        <PaymentNewEditForm isEdit userData={userData} />
      </Container>
    </>
  );
}
