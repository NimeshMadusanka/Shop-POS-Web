import * as Yup from 'yup';
import { useEffect, useMemo } from 'react';
import { createCustomerApi, updateCustomerApi } from 'src/api/CustomerApi';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { useNavigate } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { Box, Card, Grid } from '@mui/material';
import { useAuthContext } from 'src/auth/useAuthContext';

// @types
import { NewCustomerCreate } from '../../../@types/user';
// assets
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFTextField } from '../../../components/hook-form';
import { PATH_DASHBOARD } from '../../../routes/paths';
// ----------------------------------------------------------------------

type FormValuesProps = {
  firstName: string;
  lastName: string;
  nicNumber: string;
  email: string;
  phoneNumber: string;
  id: string;
};
type Props = {
  isEdit?: boolean;
  userData?: NewCustomerCreate;
};

export default function UserNewEditForm({ isEdit = false, userData }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { user } = useAuthContext();
 

  const NewUserSchema = Yup.object().shape({
    firstName: Yup.string()
      .trim()
      .required('First Name is required')
      .min(3, 'First Name must be at least 3 characters')
      .max(30, 'First Name must be less than 30 characters'),

   
  lastName: Yup.string()
    .trim()
    .nullable()
    .notRequired()
    .test(
      'len',
      'Last name must be between 3 and 30 characters',
      (val) => !val || (val.length >= 3 && val.length <= 30)
    ),

    email: Yup.string()
      .trim()
      .email('Invalid email format')
      .required('Email is required')
      .test(
        'is-valid-email',
        'Email must be 3-30 characters if provided',
        (value) => !value || (value.length >= 3 && value.length <= 30)
      ),
    
    phoneNumber: Yup.string()
      .trim()
      .required('PhoneNumber is required')
      .test(
        'is-valid-phone',
        'Phone must be 3-30 characters if provided',
        (value) => !value || (value.length >= 3 && value.length <= 30)
      ),
  });

  const defaultValues = useMemo(
    () => ({
      firstName: userData?.firstName ? userData?.firstName : '',
      lastName: userData?.lastName ? userData?.lastName : '',
      nicNumber: userData?.nicNumber ? userData?.nicNumber : '',
      email: userData?.email ? userData?.email : '',
      phoneNumber: userData?.phoneNumber ? userData?.phoneNumber : '',
      id: userData?._id || '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userData]
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewUserSchema),
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (isEdit && userData) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, userData]);

  const onSubmit = async (data: FormValuesProps) => {
    try {
      // Destructure the properties from the data object
      const { firstName, lastName, nicNumber, email, phoneNumber, id } = data;

       const companyID = user?.companyID; // get it from context
    console.log('Company ID:', companyID); // ✅ log it here

      const payload = {
        firstName,
        lastName,
        nicNumber,
        email,
        phoneNumber,
        companyID: user?.companyID,
      };

      if (isEdit) {
        await updateCustomerApi(payload, id, true);
      } else {
        await createCustomerApi(payload, true);
        reset(defaultValues);
      }
      navigate(PATH_DASHBOARD.customer.list);
      enqueueSnackbar('Create successfully!');
    } catch (error) {
      enqueueSnackbar(error.message ?? 'Error creating account!', {
        variant: 'warning',
      });
    }
  };

return (
  <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
    <Card
      sx={{
        p: 4,
        width: '100%',
        maxWidth: '100%',
      }}
    >
      <Grid container spacing={4}>

        <Grid item xs={12} md={6}>
          <RHFTextField
            name="firstName"
            label="First Name"
            sx={{
              '& .MuiInputBase-root': {
                height: 100,
                fontSize: '25px',
                borderRadius: '12px',
              },
              '& .MuiInputLabel-root': {
                fontSize: '25px',
              },
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <RHFTextField
            name="lastName"
            label="Last Name"
            sx={{
              '& .MuiInputBase-root': {
                height: 100,
                fontSize: '25px',
                borderRadius: '12px',
              },
              '& .MuiInputLabel-root': {
                fontSize: '25px',
              },
            }}
          />
        </Grid>

       

        <Grid item xs={12} md={6}>
          <RHFTextField
            name="email"
            label="Email Address"
            sx={{
              '& .MuiInputBase-root': {
                height: 100,
                fontSize: '25px',
                borderRadius: '12px',
              },
              '& .MuiInputLabel-root': {
                fontSize: '25px',
              },
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <RHFTextField
            name="phoneNumber"
            label="Phone Number"
            sx={{
              '& .MuiInputBase-root': {
                height: 100,
                fontSize: '25px',
                borderRadius: '12px',
              },
              '& .MuiInputLabel-root': {
                fontSize: '25px',
              },
            }}
          />
        </Grid>

      </Grid>

      <Box mt={4} display="flex" justifyContent="flex-end">
        <LoadingButton
          type="submit"
          variant="contained"
          loading={isSubmitting}
          sx={{
            px: 4,
            py: 2.5,
            fontSize: '22px',
            borderRadius: '14px',
              backgroundColor: '#0066CC',
               ':hover': {
                    backgroundColor: '#6E9FC1',
                    color: '#ffffff',
                  },
          }}
        >
          {isEdit ? 'Save Changes' : 'Create Customer'}
        </LoadingButton>
      </Box>
    </Card>
  </FormProvider>
);



}
