import { Helmet } from 'react-helmet-async';
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

export default function ShopCreatePage() {
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Helmet>
        <title> Shop: Create a new shop | POS System </title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Create a new shop"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Shop List',
              href: PATH_DASHBOARD.shop.list,
            },
            { name: 'New shop' },
          ]}
        />
        <ShopNewEditForm />
      </Container>
    </>
  );
}

