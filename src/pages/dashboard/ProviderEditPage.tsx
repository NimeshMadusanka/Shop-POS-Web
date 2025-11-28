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
import ProviderNewEditForm from '../../sections/@dashboard/provider/ProviderNewEditForm';

// ----------------------------------------------------------------------

export default function ProviderEditPage() {
  const { themeStretch } = useSettingsContext();
  const location = useLocation();

  const { _id, providerName, contactEmail, contactPhone, address } = location.state;

  const userData = { _id, providerName, contactEmail, contactPhone, address } as any;

  return (
    <>
      <Helmet>
        <title> Provider: Edit provider | POS System</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Edit Provider"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Provider',
              href: PATH_DASHBOARD.provider.list,
            },
            { name: userData?.providerName },
          ]}
        />

        <ProviderNewEditForm isEdit userData={userData} />
      </Container>
    </>
  );
}

