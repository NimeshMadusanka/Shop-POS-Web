import { Helmet } from 'react-helmet-async';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// sections
import BrandNewEditForm from '../../sections/@dashboard/brand/BrandNewEditForm';

// ----------------------------------------------------------------------

export default function BrandCreatePage() {
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Helmet>
        <title> Brand: Create a new brand | POS System </title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Create a new brand"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Brand List',
              href: PATH_DASHBOARD.brand.list,
            },
            { name: 'New brand' },
          ]}
        />
        <BrandNewEditForm />
      </Container>
    </>
  );
}

