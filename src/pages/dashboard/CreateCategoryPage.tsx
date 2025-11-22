

import { Helmet } from 'react-helmet-async';
import { Container, useMediaQuery } from '@mui/material';
import { PATH_DASHBOARD } from '../../routes/paths';
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';

// Desktop form
import CategoryNewEditForm from '../../sections/@dashboard/category/CategoryNewEditForm';
// Tablet form
import CategoryNewEditFormTablet from '../../sections/@dashboard/category/CategoryNewEditForm';

// ----------------------------------------------------------------------

export default function CreateStockOut() {
  const { themeStretch } = useSettingsContext();


  // Detect tablet screen width
  const isTablet = useMediaQuery('(max-width:1024px)');

  return (
    <>
      <Helmet>
        <title> categories: category | Salon System </title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Categories"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'View Categories', href: PATH_DASHBOARD.category.list },
            { name: 'Category' },
          ]}
          sx={{
            mb: 4,
            '& .MuiTypography-root': {
              fontSize: '28px', // Title text size
              fontWeight: 600,
            },
            '& .MuiBreadcrumbs-li a, & .MuiBreadcrumbs-li span': {
              fontSize: '22px', // Link & text size
              fontWeight: 500,
            },
          }}
        />

        {/* ✅ Tablet vs Desktop Rendering */}
        {isTablet ? <CategoryNewEditFormTablet /> : <CategoryNewEditForm />}
      </Container>
    </>
  );
}
