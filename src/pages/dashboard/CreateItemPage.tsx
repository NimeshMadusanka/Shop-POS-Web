


import { Helmet } from 'react-helmet-async';
import { Container, useMediaQuery } from '@mui/material';
import { PATH_DASHBOARD } from '../../routes/paths';
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';

// Desktop form
import ItemNewEditForm from '../../sections/@dashboard/item/ItemNewEditForm';
// Tablet form
import ItemNewEditFormTablet from '../../sections/@dashboard/item/ItemNewEditForm';

// ----------------------------------------------------------------------

export default function CreateStockOut() {
  const { themeStretch } = useSettingsContext();


  // Detect tablet or smaller screens
  const isTablet = useMediaQuery('(max-width:1024px)');

  return (
    <>
      <Helmet>
        <title> products: Product | Stock Management System </title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Products"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'View Products', href: PATH_DASHBOARD.item.list },
            { name: 'Product' },
          ]}
          sx={{
            mb: 4,
            '& .MuiTypography-root': {
              fontSize: '28px', // Breadcrumb title size
              fontWeight: 600,
            },
            '& .MuiBreadcrumbs-li a, & .MuiBreadcrumbs-li span': {
              fontSize: '22px', // Breadcrumb items size
              fontWeight: 500,
            },
          }}
        />

        {/* ✅ Render Tablet or Desktop Version */}
        {isTablet ? <ItemNewEditFormTablet /> : <ItemNewEditForm />}
      </Container>
    </>
  );
}
