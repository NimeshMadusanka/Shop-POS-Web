


import { Helmet } from 'react-helmet-async';
import { Container, useMediaQuery } from '@mui/material';
import { PATH_DASHBOARD } from '../../routes/paths';
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';

// Desktop form
import RoleNewEditForm from '../../sections/@dashboard/role/RoleNewEditForm';
// Tablet form
import RoleNewEditFormTablet from '../../sections/@dashboard/role/RoleNewEditForm';

// ----------------------------------------------------------------------

export default function CreateStockOut() {
  const { themeStretch } = useSettingsContext();
  
  // ✅ Tablet support for screens up to width 1024px (works for 1024×1366 tablets)
  const isTablet = useMediaQuery('(max-width:1024px)');

  return (
    <>
      <Helmet>
        <title> Roles: Role | Salon System </title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Roles"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'View Role', href: PATH_DASHBOARD.role.list },
            { name: 'Role' },
          ]}
          sx={{
            mb: 4,
            '& .MuiTypography-root': {
              fontSize: '28px',
              fontWeight: 600,
            },
            '& .MuiBreadcrumbs-li a, & .MuiBreadcrumbs-li span': {
              fontSize: '22px',
              fontWeight: 500,
            },
          }}
        />

        {/* ✅ Show Tablet Form or Desktop Form */}
        {isTablet ? <RoleNewEditFormTablet /> : <RoleNewEditForm />}
      </Container>
    </>
  );
}
