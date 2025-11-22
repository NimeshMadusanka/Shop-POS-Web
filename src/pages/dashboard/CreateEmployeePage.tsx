


import { Helmet } from 'react-helmet-async';
import { Container, useMediaQuery } from '@mui/material';
import { PATH_DASHBOARD } from '../../routes/paths';
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';

// Desktop Form
import EmployeeNewEditForm from '../../sections/@dashboard/employee/EmployeeNewEditForm';
// Tablet Form
import EmployeeNewEditFormTablet from '../../sections/@dashboard/employee/EmployeeNewEdit FormTablet';

// ----------------------------------------------------------------------

export default function CreateStockOut() {
  const { themeStretch } = useSettingsContext();
 

  // ✅ Tablet view support up to 1024px width (works for 1024×1366 tablets)
  const isTablet = useMediaQuery('(max-width:1024px)');

  return (
    <>
      <Helmet>
        <title> Employees: Employee | Salon System </title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Employees"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'View Employees', href: PATH_DASHBOARD.employee.list },
            { name: 'Employee' },
          ]}
        />

        {/* ✅ Show Tablet Form or Desktop Form */}
        {isTablet ? <EmployeeNewEditFormTablet /> : <EmployeeNewEditForm />}
      </Container>
    </>
  );
}

