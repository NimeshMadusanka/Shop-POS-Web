import { Helmet } from 'react-helmet-async';
import { Navigate, useLocation } from 'react-router-dom';
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
  const state = (location.state || {}) as Record<string, any>;

  if (!state?._id) {
    return <Navigate to={PATH_DASHBOARD.user.list} replace />;
  }

  const userName =
    state.userName ||
    [state.firstName, state.lastName].filter(Boolean).join(' ').trim();

  const userData = {
    _id: state._id,
    userName,
    email: state.email,
    role: state.role || 'admin',
    phoneNumber: state.phoneNumber,
    emergencyPhoneNumber: state.emergencyPhoneNumber || state.emergencyContactNumber,
    assignedOutletId: state.assignedOutletId,
    status: state.status,
  };

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
