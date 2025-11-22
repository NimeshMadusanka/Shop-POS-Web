import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

import { Container,Button} from '@mui/material';

import {  PATH_AUTH } from '../../routes/paths';

import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';

import CompanyNewEditForm from '../../sections/@dashboard/company/CompanyNewEditForm';
import { useNavigate } from 'react-router-dom';
// ----------------------------------------------------------------------

export default function CompanyEditPage() {
  const { themeStretch } = useSettingsContext();
  const location = useLocation();

  const { _id, companyName, companyEmail,companyType,country, phoneNumber } = location.state;

  const userData = { _id,companyName, companyEmail,companyType,country, phoneNumber  } as any;
  const navigate = useNavigate();

  const handleViewCompanies = () => {
    navigate(PATH_AUTH.company.list); 
  };
  return (
    <>
      <Helmet>
        <title> Student: Edit student | HR System</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Edit company"
          links={[
            {
              name: 'Dashboard',
              href: PATH_AUTH.root,
            },
            {
              name: 'Company',
              href: PATH_AUTH.company.list,
            },
            { name: userData?.name },
          ]}
        />
  <Button
          variant="outlined"
          onClick={handleViewCompanies}
          sx={{ mb: 3 }} 
        >
          View Companies
        </Button> 
        <CompanyNewEditForm isEdit userData={userData} />
      </Container>
    </>
  );
}
