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
import UserNewEditForm from '../../sections/@dashboard/user/UserNewEditForm';

// ----------------------------------------------------------------------

export default function UserEditPage() {
  const { themeStretch } = useSettingsContext();
  const location = useLocation();

  const { _id, userName, email, role, password, phoneNumber, emergencyPhoneNumber  } = location.state;

    const userData = {  _id, userName, email, role, password, phoneNumber, emergencyPhoneNumber } as any; 

  return (
    <>
      <Helmet>
        <title> User: Edit user | Mr.Traveller UI</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Edit user"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'User',
              href: PATH_DASHBOARD.user.list,
            },
            { name: userData?.userName },
          ]}
        />

        <UserNewEditForm isEdit userData={userData} />
      </Container>
    </>
  );
}
