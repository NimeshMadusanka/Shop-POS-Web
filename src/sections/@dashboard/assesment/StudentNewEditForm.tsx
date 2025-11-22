import * as Yup from 'yup';
import { useEffect, useMemo } from 'react';
import { createStudentApi, updateStudentApi } from 'src/api/StudentApi';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Card, Grid, Stack } from '@mui/material';
// @types
import { NewStudentCreate } from '../../../@types/user';
// assets
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, {  RHFTextField } from '../../../components/hook-form';

// ----------------------------------------------------------------------

type FormValuesProps = {
  name: string;
  email: string;
  phoneNumber: string;
  id: string;
};
type Props = {
  isEdit?: boolean;
  userData?: NewStudentCreate;
};

export default function UserNewEditForm({ isEdit = false, userData }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    name: Yup.string()
      .trim()
      .min(3, 'Name must be at least 3 characters')
      .max(15, 'Name must be less than 15 characters')
      .required('Name is required'),
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    phoneNumber: Yup.string()
      .required('Phone number is required.')
      .matches(/^07\d{8}$/, 'Please enter a valid mobile number'),
  });

  const defaultValues = useMemo(
    () => ({
      name: userData?.name ? userData?.name : '',
      email: userData?.email ? userData?.email : '',
      phoneNumber: userData?.phoneNumber ? userData?.phoneNumber : '',
      id: userData?._id ? userData?._id : '',
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
   
  }, [isEdit, userData]);

const onSubmit = async (data: FormValuesProps) => {
  try {
  
    const { name, email, phoneNumber, id } = data;

    const payload = {
      name,
      email,
      phoneNumber,
    };

    console.log('userData', data);

    if (isEdit) {
      await updateStudentApi(payload, id, true);
    } else {
      await createStudentApi(payload, true);
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
              <RHFTextField required name="name" label="Name" />

              <RHFTextField required name="email" label="Email address" />
              <RHFTextField required name="phoneNumber" label="Phone number" />
          
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
                sx={{
                  backgroundColor: '#36B37E',
                  fontWeight: 500,
                  letterSpacing: 0,
                  opacity: 1,
                  ':hover': {
                    backgroundColor: '#34E0A1',
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
