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
import BrandNewEditForm from '../../sections/@dashboard/brand/BrandNewEditForm';

// ----------------------------------------------------------------------

export default function BrandEditPage() {
  const { themeStretch } = useSettingsContext();
  const location = useLocation();

  const { _id, brandName, description, providerId, providerName } = location.state;

  const userData = { _id, brandName, description, providerId, providerName } as any;

  return (
    <>
      <Helmet>
        <title> Brand: Edit brand | POS System</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Edit Brand"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Brand',
              href: PATH_DASHBOARD.brand.list,
            },
            { name: userData?.brandName },
          ]}
        />

        <BrandNewEditForm isEdit userData={userData} />
      </Container>
    </>
  );
}

