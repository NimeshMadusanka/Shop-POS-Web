import * as Yup from 'yup';
import { useEffect, useMemo } from 'react';
import { createProviderApi, updateProviderApi } from 'src/api/ProviderApi';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { useNavigate } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { Box, Card, Grid, Stack } from '@mui/material';
// components
import { useSnackbar } from '../../../components/snackbar';
import { useAuthContext } from 'src/auth/useAuthContext';
import FormProvider, { RHFTextField } from '../../../components/hook-form';
import { PATH_DASHBOARD } from '../../../routes/paths';
// ----------------------------------------------------------------------

type FormValuesProps = {
  providerName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  id: string;
};

type Props = {
  isEdit?: boolean;
  userData?: {
    _id: string;
    providerName: string;
    contactEmail: string;
    contactPhone?: string;
    address?: string;
  };
};

export default function ProviderNewEditForm({ isEdit = false, userData }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const companyID = user?.companyID;

  const NewUserSchema = Yup.object().shape({
    providerName: Yup.string()
      .trim()
      .required('Provider Name is required')
      .min(2, 'Must be at least 2 characters')
      .max(100, 'Must be 100 characters or less'),

    contactEmail: Yup.string()
      .trim()
      .required('Contact Email is required')
      .email('Invalid email format'),

    contactPhone: Yup.string()
      .trim()
      .max(20, 'Must be 20 characters or less'),

    address: Yup.string()
      .trim()
      .max(200, 'Must be 200 characters or less'),
  });

  const defaultValues = useMemo(
    () => ({
      providerName: userData?.providerName || '',
      contactEmail: userData?.contactEmail || '',
      contactPhone: userData?.contactPhone || '',
      address: userData?.address || '',
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
      if (!companyID) {
        enqueueSnackbar('Company ID is required', { variant: 'error' });
        return;
      }

      const { providerName, contactEmail, contactPhone, address, id } = data;

      if (isEdit) {
        const payload = {
          providerName,
          contactEmail,
          contactPhone: contactPhone || '',
          address: address || '',
        };
        await updateProviderApi(id, payload);
        enqueueSnackbar('Provider updated successfully!');
      } else {
        const payload = {
          providerName,
          contactEmail,
          contactPhone: contactPhone || '',
          address: address || '',
          companyID,
        };
        await createProviderApi(payload);
        enqueueSnackbar('Provider created successfully!');
        reset(defaultValues);
      }
      navigate(PATH_DASHBOARD.provider.list);
    } catch (error: any) {
      enqueueSnackbar(error.message ?? 'Error saving provider!', {
        variant: 'error',
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
              <RHFTextField required name="providerName" label="Provider Name" />
              <RHFTextField required name="contactEmail" label="Contact Email" type="email" />
              <RHFTextField name="contactPhone" label="Contact Phone" />
              <RHFTextField name="address" label="Address" />
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
                sx={{
                  backgroundColor: '#6B8E5A',
                  fontWeight: 500,
                  letterSpacing: 0,
                  opacity: 1,
                  ':hover': {
                    backgroundColor: '#4A5D3F',
                    color: '#ffffff',
                  },
                }}
              >
                {!isEdit ? 'Create Provider' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

