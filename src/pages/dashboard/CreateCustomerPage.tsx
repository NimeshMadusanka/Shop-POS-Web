import { Helmet } from 'react-helmet-async';
import { Container, useMediaQuery} from '@mui/material';
import { PATH_DASHBOARD } from '../../routes/paths';
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';

// Desktop form
import CustomerNewEditForm from '../../sections/@dashboard/customer/CustomerNewEditForm';
// Tablet form
import CustomerNewEditFormTablet from '../../sections/@dashboard/customer/CustomerNewEditFormTablet';


// ----------------------------------------------------------------------

export default function CreateStockOut() {
  const { themeStretch } = useSettingsContext();


  
  // const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery('(max-width:1024px)');


  return (
    <>
      <Helmet>
        <title> customers: Service | Salon System </title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
  heading="Customers"
  links={[
    { name: 'Dashboard', href: PATH_DASHBOARD.root },
    { name: 'View Customers', href: PATH_DASHBOARD.customer.list },
    { name: 'Customer' },
  ]}
  sx={{
    mb: 4,
    '& .MuiTypography-root': {
      fontSize: '28px',     // Breadcrumb title size
      fontWeight: 600,
    },
    '& .MuiBreadcrumbs-li a, & .MuiBreadcrumbs-li span': {
      fontSize: '22px',     // Breadcrumb items text size
      fontWeight: 500,
    },
  }}
/>


        {/* ✅ Render based on screen size */}
        {isTablet ? <CustomerNewEditFormTablet /> : <CustomerNewEditForm />}
      </Container>
    </>
  );
}
