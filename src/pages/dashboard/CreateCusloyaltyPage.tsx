import { Helmet } from 'react-helmet-async';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// sections
import CusloyaltyNewEditForm from '../../sections/@dashboard/cusloyalty/CusloyaltyNewEditForm';

// ----------------------------------------------------------------------

export default function CreateStockOut() {
  const { themeStretch } = useSettingsContext();
  return (
    <>
      <Helmet>
        <title> Discounts: Create Discount | Stock Management System </title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Create Discount"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'View Discounts',
              href: PATH_DASHBOARD.cusloyalty.list,
            },
            { name: 'New Discount' },
          ]}
        />

        <CusloyaltyNewEditForm />
      </Container>
    </>
  );
}
