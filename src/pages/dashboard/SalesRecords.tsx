import * as React from 'react';
import { Helmet } from 'react-helmet-async';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import SalesReports from '../../sections/@dashboard/sales/details';
// sections

// ----------------------------------------------------------------------

export default function SalesRecords() {
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Helmet>
        <title> Sales: View | Salon System</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Sales Details"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            {
              name: 'sales view',
            },
          ]}
        />

        <SalesReports />
      </Container>
    </>
  );
}
