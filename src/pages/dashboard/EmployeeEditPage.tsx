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
import EmployeeNewEditForm from '../../sections/@dashboard/employee/EmployeeNewEditForm';

// ----------------------------------------------------------------------

export default function CustomerEditPage() {
  const { themeStretch } = useSettingsContext();
  const location = useLocation();

  const { _id, firstName, lastName, nicNumber, phoneNumber, gender, role, email } = location.state;

  const userData = { _id, firstName, lastName, nicNumber, phoneNumber, gender, role, email } as any;

  return (
    <>
      <Helmet>
        <title> Employees: Edit Employee | HR System</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Edit Employee"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Employee',
              href: PATH_DASHBOARD.employee.list,
            },
            { name: userData?.firstName },
          ]}
        />

        <EmployeeNewEditForm isEdit userData={userData} />
      </Container>
    </>
  );
}
