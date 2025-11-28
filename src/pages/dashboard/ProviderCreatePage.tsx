import { Helmet } from 'react-helmet-async';
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

export default function ProviderCreatePage() {
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Helmet>
        <title> Provider: Create a new provider | POS System </title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Create a new provider"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Provider List',
              href: PATH_DASHBOARD.provider.list,
            },
            { name: 'New provider' },
          ]}
        />
        <ProviderNewEditForm />
      </Container>
    </>
  );
}

