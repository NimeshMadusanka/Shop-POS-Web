import * as Yup from 'yup';
import { useEffect, useMemo, useCallback, useState } from 'react';
import { createCusloyaltyApi, updateCusloyaltyApi } from 'src/api/CusloyaltyApi';
import { getItemData } from 'src/api/ItemApi';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { useNavigate } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { Box, Card, Grid, Stack, Autocomplete, TextField } from '@mui/material';
// @types
import { NewCusloyaltyCreate } from '../../../@types/user';
// assets
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFTextField } from '../../../components/hook-form';
import { PATH_DASHBOARD } from '../../../routes/paths';
import { useAuthContext } from 'src/auth/useAuthContext';
// ----------------------------------------------------------------------

type FormValuesProps = {
  itemName: string;
  offPercentage: string;
  description: string;
  itemID: string;
  discountName:string;
  id: string;
};

interface Item {
  _id: string;
  itemName: string;
}
type Props = {
  isEdit?: boolean;
  userData?: NewCusloyaltyCreate;
};

export default function UserNewEditForm({ isEdit = false, userData }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [itemData, setItemData] = useState<Item[]>([]);
  const { user } = useAuthContext();
  const companyID = user?.companyID;

  const NewUserSchema = Yup.object().shape({
    itemName: Yup.string()
      .trim()
      .required('First Name is required')
      .min(3, 'First Name must be at least 3 characters')
      .max(30, 'First Name must be less than 30 characters'),

       discountName: Yup.string()
      .trim()
      .required('Discount Name is required')
      .min(3, 'Discount Name must be at least 3 characters')
      .max(30, 'Discount Name must be less than 30 characters'),
  });

  const defaultValues = useMemo(
    () => ({
      discountName: userData?.discountName || '',
      itemName: userData?.itemName || '',
      description: userData?.description || '',
      offPercentage: userData?.offPercentage || '',

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
    setValue,
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

  const loadData = useCallback(async () => {
    const data = await getItemData(companyID);

    setItemData(data);
  }, [companyID]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onSubmit = async (data: FormValuesProps) => {
    try {
      // Destructure the properties from the data object
      const { itemName, offPercentage, description, itemID,  discountName, id } = data;

      const payload = {
        itemName,
        offPercentage,
        description,
        companyID,
        discountName,
        itemID,
      };

      if (isEdit) {
        await updateCusloyaltyApi(payload, id, true);
      } else {
        await createCusloyaltyApi(payload, true);
        reset(defaultValues);
      }
      navigate(PATH_DASHBOARD.cusloyalty.list);
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
                <RHFTextField name="discountName" label="Discount Name" />
              <Autocomplete
                fullWidth
                autoHighlight
                options={itemData}
                getOptionLabel={(option) => option?.itemName || ''}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Product"
                    inputProps={{
                      ...params.inputProps,
                      autoComplete: 'new-password',
                    }}
                  />
                )}
                onChange={(event, newValue) => {
                  setValue('itemName', newValue?.itemName || '');
                  setValue('itemID', newValue?._id || '');
                }}
              />
              <RHFTextField name="offPercentage" label="OFF Percentage" />
              <RHFTextField name="description" label="Description" />
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
                {!isEdit ? 'Create Discount' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
