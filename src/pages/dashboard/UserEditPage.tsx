import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const state = location.state as any;

  useEffect(() => {
    if (!state?._id) {
      navigate(PATH_DASHBOARD.user.list, { replace: true });
    }
  }, [state, navigate]);

  if (!state?._id) {
    return null;
  }

  const userName =
    state.userName ||
    [state.firstName, state.lastName].filter(Boolean).join(' ').trim() ||
    state.email;

  const userData = {
    _id: state._id,
    userName,
    email: state.email,
    role: state.role,
    phoneNumber: state.phoneNumber,
    emergencyPhoneNumber: state.emergencyPhoneNumber,
    assignedOutletId: state.assignedOutletId,
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
