import * as Yup from 'yup';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { createItemApi, updateItemApi } from 'src/api/ItemApi';
import { getCategoryData } from 'src/api/CategoryApi';
// form
import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { useNavigate } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { Box, Card, Grid, Stack, Autocomplete, TextField, MenuItem } from '@mui/material';
// @types
import { NewItemCreate } from '../../../@types/user';
// assets
// components
import { useSnackbar } from '../../../components/snackbar';
import { useAuthContext } from 'src/auth/useAuthContext';
import FormProvider, { RHFTextField, RHFSelect } from '../../../components/hook-form';
import { PATH_DASHBOARD } from '../../../routes/paths';
// ----------------------------------------------------------------------

type FormValuesProps = {
  itemName: string;
  itemCategory: string;
  itemType: string;
  itemPrice: string;
  itemDuration: string;
  stockQuantity: string;
  id: string;
};

interface Category {
  _id: string;
  catgName: string;
}
type Props = {
  isEdit?: boolean;
  userData?: NewItemCreate;
};

// Unit options
const unitOptions = ['pcs', 'kgs', 'box', 'pack', 'bottle', 'carton', 'bag', 'unit', 'dozen', 'pair', 'set', 'roll', 'meter', 'liter', 'gram'];

export default function UserNewEditForm({ isEdit = false, userData }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [categoryData, setCategoryData] = useState<Category[]>([]);
  const { user } = useAuthContext();

  const NewUserSchema = Yup.object().shape({
    itemName: Yup.string().required('Product Name is required'),
    itemCategory: Yup.string().required('Product Category is required'),
    itemPrice: Yup.number().required('Price is required').typeError('Price must be a number'),
    itemDuration: Yup.string()
      .required('Unit is required')
      .oneOf(unitOptions, 'Please select a valid unit'),
    stockQuantity: Yup.number()
      .min(0, 'Stock quantity must be 0 or greater')
      .typeError('Stock quantity must be a number'),
  });

  const defaultValues = useMemo(
    () => ({
      itemName: userData?.itemName || '',
      itemCategory: userData?.itemCategory || '',
      itemPrice: userData?.itemPrice || '',
      itemDuration: userData?.itemDuration || '',
      stockQuantity: userData?.stockQuantity?.toString() || '0',
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
    const data = await getCategoryData();

    setCategoryData(data);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onSubmit = async (data: FormValuesProps) => {
    const companyID = user?.companyID;
    try {
      // Destructure the properties from the data object
      const { itemName, itemCategory, itemPrice, itemDuration, stockQuantity, id } = data;

      const payload = {
        itemName,
        itemCategory,
        itemPrice,
        itemDuration,
        itemType: 'service',
        stockQuantity: stockQuantity ? Number(stockQuantity) : 0,
        companyID,
      };

      if (isEdit) {
        await updateItemApi(payload, id, true);
      } else {
        await createItemApi(payload, true);
        reset(defaultValues);
      }
      navigate(PATH_DASHBOARD.item.list);
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
              <RHFTextField required name="itemName" label="Product Name" />

              <Autocomplete
                fullWidth
                autoHighlight
                options={categoryData}
                getOptionLabel={(option) => option?.catgName || ''}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Category"
                    inputProps={{
                      ...params.inputProps,
                      autoComplete: 'new-password',
                    }}
                  />
                )}
                onChange={(event, newValue) => {
                  setValue('itemCategory', newValue?.catgName || '');
                }}
              />

              <RHFTextField required name="itemPrice" label="Product Price" />
              <RHFSelect required name="itemDuration" label="Unit">
                <MenuItem value="">
                  <em>Select Unit</em>
                </MenuItem>
                {unitOptions.map((unit) => (
                  <MenuItem key={unit} value={unit}>
                    {unit}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFTextField 
                name="stockQuantity" 
                label="Stock Quantity" 
                type="number"
                inputProps={{ min: 0 }}
              />
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
                sx={{
                  backgroundColor: '#FF9800',
                  fontWeight: 500,
                  letterSpacing: 0,
                  opacity: 1,
                  ':hover': {
                    backgroundColor: '#FFB74D',
                    color: '#ffffff',
                  },
                }}
              >
                {!isEdit ? 'Create Product' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
