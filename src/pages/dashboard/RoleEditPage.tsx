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
import RoleNewEditForm from '../../sections/@dashboard/role/RoleNewEditForm';

// ----------------------------------------------------------------------

export default function ItemEditPage() {
  const { themeStretch } = useSettingsContext();
  const location = useLocation();

  const { _id, roleName, description } = location.state;

  const userData = { _id, roleName, description } as any;

  return (
    <>
      <Helmet>
        <title> Role: Edit role | HR System</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Edit Role"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Role',
              href: PATH_DASHBOARD.role.list,
            },
            { name: userData?.roleName },
          ]}
        />

        <RoleNewEditForm isEdit userData={userData} />
      </Container>
    </>
  );
}
