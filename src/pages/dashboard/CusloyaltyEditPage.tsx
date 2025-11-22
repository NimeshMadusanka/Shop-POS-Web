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
import CusloyaltyNewEditForm from '../../sections/@dashboard/cusloyalty/CusloyaltyNewEditForm';

// ----------------------------------------------------------------------

export default function CustomerEditPage() {
  const { themeStretch } = useSettingsContext();
  const location = useLocation();

  const { _id, discountName, itemName, offPercentage, description } = location.state;

  const userData = { _id, discountName, itemName, offPercentage, description } as any;

  return (
    <>
      <Helmet>
        <title> Discounts: Edit Discount | Stock Management System</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Edit Discount"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Discounts',
              href: PATH_DASHBOARD.cusloyalty.list,
            },
            { name: userData?.discountName || userData?.itemName },
          ]}
        />

        <CusloyaltyNewEditForm isEdit userData={userData} />
      </Container>
    </>
  );
}
