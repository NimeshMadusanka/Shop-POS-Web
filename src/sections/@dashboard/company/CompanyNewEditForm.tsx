import * as Yup from 'yup';
import { useEffect, useMemo } from 'react';
// import { createCompanyApi, updateCompanyApi } from 'src/api/CompanyApi';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Card, Grid, Stack } from '@mui/material';
// @types
import { NewCompanyCreate } from '../../../@types/user';
// assets
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFTextField } from '../../../components/hook-form';

// ----------------------------------------------------------------------

type FormValuesProps = {
  companyName: string;
  companyType: string;
  companyEmail: string;
  phoneNumber: string;
  country: string;
  id: string;
};
type Props = {
  isEdit?: boolean;
  userData?: NewCompanyCreate;
};

export default function UserNewEditForm({ isEdit = false, userData }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    companyName: Yup.string()
      .trim()
      .min(3, 'Name must be at least 3 characters')
      .max(15, 'Name must be less than 15 characters')
      .required('Name is required'),
    companyEmail: Yup.string()
      .email('Email must be a valid email address')
      .required('Email is required'),
    phoneNumber: Yup.string()
      .required('Phone number is required.')
      .matches(/^07\d{8}$/, 'Please enter a valid mobile number'),
    companyType: Yup.string().required('Phone number is required.'),
    country: Yup.string().required('Phone number is required.'),
  });

  const defaultValues = useMemo(
    () => ({
      companyName: userData?.companyName ? userData?.companyName : '',
      companyEmail: userData?.companyEmail ? userData?.companyEmail : '',
      companyType: userData?.companyType ? userData?.companyType : '',
      phoneNumber: userData?.phoneNumber ? userData?.phoneNumber : '',
      country: userData?.country ? userData?.country : '',
      id: userData?._id ? userData?._id : '',
    }),

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
  }, [isEdit, userData, reset, defaultValues]);

  const onSubmit = async (data: FormValuesProps) => {
    try {
      const payload = {
        companyName: data?.companyName,
        companyEmail: data?.companyEmail,
        companyType: data?.companyType,
        phoneNumber: data?.phoneNumber,
        country: data?.country,
      };
      const id = data.id;

      if (isEdit) {
        // await updateCompanyApi(payload, id, true);
        reset(defaultValues);
      } else {
        // await createCompanyApi(payload, true);
        reset(defaultValues);
      }

      enqueueSnackbar('Create successfully!');
    } catch (error) {
      enqueueSnackbar(error.message ?? 'Error creating account!', {
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
              <RHFTextField required name="companyName" label="Company Name" />
              <RHFTextField required name="companyEmail" label="Company Email" />
              <RHFTextField required name="companyType" label="Company Type" />
              <RHFTextField required name="country" label="Country" />
              <RHFTextField required name="phoneNumber" label="PhoneNumber" />
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
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
                    backgroundColor: '#E3DDD9',
                  },
                }}
              >
                {!isEdit ? 'Create User' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
