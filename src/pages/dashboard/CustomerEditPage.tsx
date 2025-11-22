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
import CustomerNewEditForm from '../../sections/@dashboard/customer/CustomerNewEditForm';

// ----------------------------------------------------------------------

export default function CustomerEditPage() {
  const { themeStretch } = useSettingsContext();
  const location = useLocation();

  const { _id, firstName, lastName, nicNumber, phoneNumber, email } = location.state;

  const userData = { _id, firstName, lastName, nicNumber, phoneNumber, email } as any;

  return (
    <>
      <Helmet>
        <title> Customer: Edit customer | HR System</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Edit Customer"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Service',
              href: PATH_DASHBOARD.customer.list,
            },
            { name: userData?.firstName },
          ]}
        />

        <CustomerNewEditForm isEdit userData={userData} />
      </Container>
    </>
  );
}
