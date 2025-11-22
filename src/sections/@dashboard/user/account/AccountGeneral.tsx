import * as Yup from 'yup';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Grid, Card, Stack} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import axios from '../../../../utils/axios';
import { useAuthContext } from '../../../../auth/useAuthContext';
import { useLocation } from 'react-router-dom';
import { useSnackbar } from '../../../../components/snackbar';
import FormProvider, {
  RHFTextField,RHFSelect,
} from '../../../../components/hook-form';

type FormValuesProps = {
  role: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  companyID:string;
  phoneNumber: string;
  type:string;
  admin: boolean;
  status: string;
  profileImage?: string;
 
};

export default function AccountGeneral() {
  const { enqueueSnackbar } = useSnackbar();
  const { user, initialize } = useAuthContext();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const companyIDFromUrl = queryParams.get('companyID') || '';
  const typeFromUrl = queryParams.get('type') || '';
  const adminFromUrl = queryParams.get('admin') === 'true';
  const userTitle = [
    {
      label: ' Ms',
      value: 'Ms',
    },
    {
      label: 'Mr',
      value: 'Mr',
    },
    {
      label:'Mrs',
      value:'Mrs',
    }
  ]

  const Status = [
    {
      label:'Active',
      value:'active',
    },
    {
      label:'Pending',
      value:'pending',
    },
    {
      label:'Inactive',
      value:'inactive',
    }
  ]
  const UpdateUserSchema = Yup.object().shape({
    profileImage: Yup.mixed().notRequired(), 
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    companyID:Yup.string().required(' companyID is required'),
    title: Yup.string().required('Title is required'),
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    role: Yup.string().required('Role is required'),
    phoneNumber: Yup.string().required('Phone number is required'),
    status: Yup.string().required('Status is required'),
    type: Yup.string().required('Type is required'),
    admin: Yup.boolean().required('Admin status is required'),
  });

  const defaultValues = {
    firstName: user?.firstName || '',
    title: user?.title || '',
    email: user?.email || '',
    companyID: companyIDFromUrl || user?.companyID || '',
    type: typeFromUrl || user?.type || '',
    admin: adminFromUrl || user?.admin || false,
    role: user?.role || '',
    phoneNumber: user?.phoneNumber || '',
    lastName: user?.lastName || '',
    profileImage: user?.profileImage || '',
    status: user?.status || '',
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues,
  });
  const {
    handleSubmit,
    formState: { isSubmitting},
  } = methods;

  useEffect(() => {
    methods.setValue('admin', adminFromUrl || user?.admin || false); 
  }, [adminFromUrl, user?.admin, methods]);

  const onSubmit = async (data: FormValuesProps) => {
    try {

        await axios.put(`/user/client/${user?.id}`, data);
        await initialize();
        enqueueSnackbar('Update success!');
    } catch (error) {
      enqueueSnackbar(error.message ??'Something went wrong!', {
        variant: 'warning',
      });
    }
  };
  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField required name="profileImage" label="Profile Image" />
              <RHFSelect required native name="title" label=" Title" placeholder="Title">
                {userTitle.map((title) => (
                  <option key={title.value} value={title.value}>
                    {title.label}
                  </option>
                ))}
              </RHFSelect>
              <RHFTextField required name="firstName" label="First Name" />
              <RHFTextField required name="lastName" label="Last Name" />
              <RHFTextField required name="email" label="Email " InputProps={{ readOnly: true }} />
              <RHFTextField required name="phoneNumber" label="Phone Number" />
              <RHFTextField required name="role" label="Role" disabled/>
              
              <RHFSelect required native name="status" label="Status" placeholder="Status"disabled>
                {Status.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </RHFSelect>
            <RHFTextField required name="companyID" label="Company ID" InputProps={{ readOnly: true }} disabled />
            {/* <RHFTextField required name="type" label="Type"   InputProps={{ readOnly: true }} /> */}
            <RHFTextField
                name="admin"
                label="Admin"
                InputProps={{ readOnly: true }}
                value={methods.watch('admin') ? 'true' : 'false'}
                disabled/>
            </Box>
            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
                sx={{
                  backgroundColor: '#1D355E',
                  fontWeight: 500,
                  letterSpacing: 0,
                  opacity: 1,
                  ':hover': {
                    backgroundColor: '#1D355E',
                  },
                }}
              >
                Save Changes
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}