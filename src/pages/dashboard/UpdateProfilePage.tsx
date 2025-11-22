import { Helmet } from 'react-helmet-async';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// sections
import ProfileNewEditForm from '../../sections/@dashboard/Profile/ProfileNewEditForm';


// ----------------------------------------------------------------------

export default function ProfileUpdatePage() {
  const { themeStretch } = useSettingsContext();
  
  return (
    <>
      <Helmet>
        <title> Profile: Update | PRS Client Portal </title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Update profile"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            { name: 'Update' },
          ]}
        />
        <ProfileNewEditForm />
      </Container>
    </>
  );
}
