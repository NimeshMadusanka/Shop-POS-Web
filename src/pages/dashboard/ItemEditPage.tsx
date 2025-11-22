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
import ItemNewEditForm from '../../sections/@dashboard/item/ItemNewEditForm';

// ----------------------------------------------------------------------

export default function ItemEditPage() {
  const { themeStretch } = useSettingsContext();
  const location = useLocation();

  const { _id, itemName, itemCategory, itemPrice, itemDuration } = location.state;

  const userData = { _id, itemName, itemCategory, itemPrice, itemDuration } as any;

  return (
    <>
      <Helmet>
        <title> Product: Edit product | Stock Management System</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Edit Product"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Product',
              href: PATH_DASHBOARD.item.list,
            },
            { name: userData?.itemName },
          ]}
        />

        <ItemNewEditForm isEdit userData={userData} />
      </Container>
    </>
  );
}
