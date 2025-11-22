import { Helmet } from 'react-helmet-async';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// sections
import UploadSettingEditForm from '../../sections/@dashboard/setting/UploadSettingEditForm';


// ----------------------------------------------------------------------

export default function UploadSettingUpdatePage() {
  const { themeStretch } = useSettingsContext();
  
  return (
    <>
      <Helmet>
        <title> Setting: Update | PRS Client Portal </title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Upload setting upload"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            { name: 'Update' },
          ]}
        />
        <UploadSettingEditForm />
      </Container>
    </>
  );
}
