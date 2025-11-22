import { Helmet } from 'react-helmet-async';

import { Button, Container } from '@mui/material';

import {  PATH_AUTH } from '../../routes/paths'; 

import { useNavigate } from 'react-router-dom';
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';

import CompanyNewEditForm from '../../sections/@dashboard/company/CompanyNewEditForm';

// ----------------------------------------------------------------------

export default function CompanyCreationForm() {
  const { themeStretch } = useSettingsContext();
  const navigate = useNavigate();

  const handleViewCompanies = () => {
    navigate(PATH_AUTH.company.list); 
  };

  return (
    <>
      <Helmet>
        <title> Student: Create a new company | PRS Client Portal </title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Create a new company"
          links={[
            {
              name: 'Dashboard',
              href: PATH_AUTH.root,
            },
            {
              name: 'Company List',
              href: PATH_AUTH.company.list,
            },
            { name: 'New company' },
          ]}
        />

        <Button variant="outlined" onClick={handleViewCompanies} sx={{ mb: 3 }}>
          View Companies
        </Button>

        <CompanyNewEditForm />
      </Container>
    </>
  );
}
