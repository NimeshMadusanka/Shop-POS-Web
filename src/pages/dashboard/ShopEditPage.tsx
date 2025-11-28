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
import ShopNewEditForm from '../../sections/@dashboard/shop/ShopNewEditForm';

// ----------------------------------------------------------------------

export default function ShopEditPage() {
  const { themeStretch } = useSettingsContext();
  const location = useLocation();

  const { _id, shopName, ownerEmail, contactPhone, address } = location.state;

  const userData = { _id, shopName, ownerEmail, contactPhone, address } as any;

  return (
    <>
      <Helmet>
        <title> Shop: Edit shop | POS System</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Edit Shop"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Shop',
              href: PATH_DASHBOARD.shop.list,
            },
            { name: userData?.shopName },
          ]}
        />

        <ShopNewEditForm isEdit userData={userData} />
      </Container>
    </>
  );
}

