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
import CategoryNewEditForm from '../../sections/@dashboard/category/CategoryNewEditForm';

// ----------------------------------------------------------------------

export default function CustomerEditPage() {
  const { themeStretch } = useSettingsContext();
  const location = useLocation();

  const { _id, catgName, description } = location.state;

  const userData = { _id, catgName, description } as any;

  return (
    <>
      <Helmet>
        <title> Employees: Edit Employee | HR System</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Edit Category"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Category',
              href: PATH_DASHBOARD.category.list,
            },
            { name: userData?.catgName },
          ]}
        />

        <CategoryNewEditForm isEdit userData={userData} />
      </Container>
    </>
  );
}
