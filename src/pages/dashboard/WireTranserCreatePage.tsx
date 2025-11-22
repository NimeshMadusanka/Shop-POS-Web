import { Helmet } from 'react-helmet-async';
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

export default function CreateStockOut() {
  const { themeStretch } = useSettingsContext();
  return (
    <>
      <Helmet>
        <title> categories: category | Salon System </title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Categories"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'View Categories ',
              href: PATH_DASHBOARD.category.list,
            },
            { name: 'Category' },
          ]}
        />

        <CategoryNewEditForm />
      </Container>
    </>
  );
}
