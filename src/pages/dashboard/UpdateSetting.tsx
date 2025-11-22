import { Helmet } from 'react-helmet-async';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// sections
import SettingEditForm from '../../sections/@dashboard/setting/SettingMainPage'


// ----------------------------------------------------------------------

export default function SettingUpdatePage() {
  const { themeStretch } = useSettingsContext();
  
  return (
    <>
      <Helmet>
        <title> Setting: Update | Mr.Traveller </title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Update setting"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            { name: 'Update' },
          ]}
        />
        <SettingEditForm />
      </Container>
    </>
  );
}
