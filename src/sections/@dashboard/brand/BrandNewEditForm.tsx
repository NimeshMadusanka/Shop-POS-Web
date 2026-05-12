import * as Yup from 'yup';
import { useEffect, useMemo } from 'react';
import { createBrandApi, updateBrandApi } from 'src/api/BrandApi';
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
  brandName: string;
  description: string;
  commissionPercent: number;
  id: string;
};

type Props = {
  isEdit?: boolean;
  userData?: {
    _id: string;
    brandName: string;
    description?: string;
    commissionPercent?: number;
  };
};

export default function BrandNewEditForm({ isEdit = false, userData }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const companyID = user?.companyID;

  const NewUserSchema = Yup.object().shape({
    brandName: Yup.string()
      .trim()
      .required('Brand Name is required')
      .min(2, 'Must be at least 2 characters')
      .max(50, 'Must be 50 characters or less'),

    description: Yup.string()
      .trim()
      .max(200, 'Must be 200 characters or less'),
    commissionPercent: Yup.number()
      .typeError('Commission % must be a number')
      .min(0, 'Cannot be negative')
      .max(100, 'Cannot exceed 100')
      .required('Commission % is required'),
  });

  const defaultValues = useMemo(
    () => ({
      brandName: userData?.brandName || '',
      description: userData?.description || '',
      commissionPercent: Number(userData?.commissionPercent) || 0,
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

      const { brandName, description, commissionPercent, id } = data;

      if (isEdit) {
        const payload = {
          brandName,
          description: description || '',
          commissionPercent: Number(commissionPercent) || 0,
        };
        await updateBrandApi(payload, id);
        enqueueSnackbar('Brand updated successfully!');
      } else {
        const payload = {
          brandName,
          description: description || '',
          commissionPercent: Number(commissionPercent) || 0,
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
              <RHFTextField name="description" label="Description" />
              <RHFTextField name="commissionPercent" label="Commission (%)" type="number" />
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

