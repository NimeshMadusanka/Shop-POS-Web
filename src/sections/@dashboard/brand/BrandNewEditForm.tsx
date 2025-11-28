import * as Yup from 'yup';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { createBrandApi, updateBrandApi } from 'src/api/BrandApi';
import { getProviderData } from 'src/api/ProviderApi';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { useNavigate } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { Box, Card, Grid, Stack, Autocomplete, TextField } from '@mui/material';
// components
import { useSnackbar } from '../../../components/snackbar';
import { useAuthContext } from 'src/auth/useAuthContext';
import FormProvider, { RHFTextField } from '../../../components/hook-form';
import { PATH_DASHBOARD } from '../../../routes/paths';
// ----------------------------------------------------------------------

type FormValuesProps = {
  brandName: string;
  description: string;
  providerId: string;
  id: string;
};

interface Provider {
  _id: string;
  providerName: string;
  contactEmail: string;
}

type Props = {
  isEdit?: boolean;
  userData?: {
    _id: string;
    brandName: string;
    description?: string;
    providerId?: string;
    providerName?: string;
  };
};

export default function BrandNewEditForm({ isEdit = false, userData }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const companyID = user?.companyID;
  const [providerData, setProviderData] = useState<Provider[]>([]);

  const NewUserSchema = Yup.object().shape({
    brandName: Yup.string()
      .trim()
      .required('Brand Name is required')
      .min(2, 'Must be at least 2 characters')
      .max(50, 'Must be 50 characters or less'),

    description: Yup.string()
      .trim()
      .max(200, 'Must be 200 characters or less'),
  });

  const defaultValues = useMemo(
    () => ({
      brandName: userData?.brandName || '',
      description: userData?.description || '',
      providerId: userData?.providerId || '',
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
    setValue,
    watch,
    formState: { isSubmitting },
  } = methods;

  const loadProviders = useCallback(async () => {
    if (!companyID) return;
    try {
      const providers = await getProviderData(companyID);
      setProviderData(providers || []);
    } catch (error) {
      console.error('Error loading providers:', error);
    }
  }, [companyID]);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

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

      const { brandName, description, providerId, id } = data;

      if (isEdit) {
        const payload = {
          brandName,
          description: description || '',
          providerId: providerId || null,
        };
        await updateBrandApi(payload, id);
        enqueueSnackbar('Brand updated successfully!');
      } else {
        const payload = {
          brandName,
          description: description || '',
          providerId: providerId || undefined,
          companyID,
        };
        await createBrandApi(payload);
        enqueueSnackbar('Brand created successfully!');
        reset(defaultValues);
      }
      navigate(PATH_DASHBOARD.brand.list);
    } catch (error: any) {
      enqueueSnackbar(error.message ?? 'Error saving brand!', {
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
              <RHFTextField required name="brandName" label="Brand Name" />
              <Autocomplete
                fullWidth
                autoHighlight
                options={providerData}
                getOptionLabel={(option) => option?.providerName || ''}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                value={providerData.find((p) => p._id === watch('providerId')) || null}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Provider (Optional)"
                    inputProps={{
                      ...params.inputProps,
                      autoComplete: 'new-password',
                    }}
                  />
                )}
                onChange={(event, newValue) => {
                  setValue('providerId', newValue?._id || '');
                }}
              />
              <RHFTextField name="description" label="Description" />
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
                {!isEdit ? 'Create Brand' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

