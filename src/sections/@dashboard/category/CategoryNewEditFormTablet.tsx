import * as Yup from 'yup';
import { useEffect, useMemo } from 'react';
import { createCategoryApi, updateCategoryApi } from 'src/api/CategoryApi';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { useNavigate } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { Box, Card, Grid, Stack } from '@mui/material';
// @types
import { NewCategoryCreate } from '../../../@types/user';
// assets
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFTextField } from '../../../components/hook-form';
import { PATH_DASHBOARD } from '../../../routes/paths';
// ----------------------------------------------------------------------

type FormValuesProps = {
  catgName: string;
  description: string;
  id: string;
};
type Props = {
  isEdit?: boolean;
  userData?: NewCategoryCreate;
};

export default function UserNewEditForm({ isEdit = false, userData }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const NewUserSchema = Yup.object().shape({
    catgName: Yup.string()
      .trim()
      .required('Category Name is required')
      .min(3, 'Must be at least 3 characters')
      .max(50, 'Must be 50 characters or less'),

    description: Yup.string()
      .trim()
      .required('Description is required')
      .min(5, 'Must be at least 5 characters')
      .max(200, 'Must be 200 characters or less'),
  });

  const defaultValues = useMemo(
    () => ({
      catgName: userData?.catgName || '',
      description: userData?.description || '',
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
      const { catgName, description, id } = data;

      const payload = {
        catgName,
        description,
      };

      if (isEdit) {
        await updateCategoryApi(payload, id, true);
      } else {
        await createCategoryApi(payload, true);
        reset(defaultValues);
      }
      navigate(PATH_DASHBOARD.category.list);
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
              <RHFTextField required name="catgName" label="Category Name" />
              <RHFTextField required name="description" label="Description" />

              {/* <RHFTextField required name="customerName" label=" Last Name" /> */}
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
                sx={{
                  backgroundColor: '#0066CC',
                  fontWeight: 500,
                  letterSpacing: 0,
                  opacity: 1,
                  ':hover': {
                    backgroundColor: '#6E9FC1',
                    color: '#ffffff',
                  },
                }}
              >
                {!isEdit ? 'Create Category' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
