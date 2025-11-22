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
import { Box, Card, Grid, Stack, Autocomplete, TextField } from '@mui/material';
// @types
import { NewItemCreate } from '../../../@types/user';
// assets
// components
import { useSnackbar } from '../../../components/snackbar';
import { useAuthContext } from 'src/auth/useAuthContext';
import FormProvider, { RHFTextField } from '../../../components/hook-form';
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
      .matches(
        /^((\d+)\s*(h|hrs|hr|hours))?\s*((\d+)\s*(m|mins|min|minutes))?$/i,
        'Please enter a valid duration (e.g., "2 hrs 30 mins")'
      ),
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
  <Card
    sx={{
      p: 4,
      width: '100%',
      maxWidth: '100%',
    }}
  >
    <Grid container direction="column" spacing={4}>
      {/* Product Name */}
      <Grid item xs={12}>
        <RHFTextField
          name="serviceName"
          label="Product Name"
          sx={{
            width: '100%',
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

      {/* Price */}
      <Grid item xs={12}>
        <RHFTextField
          name="price"
          label="Price"
          sx={{
            width: '100%',
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

      {/* Duration */}
      <Grid item xs={12}>
        <RHFTextField
          name="duration"
          label="Duration"
          sx={{
            width: '100%',
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

      {/* Stock Quantity */}
      <Grid item xs={12}>
        <RHFTextField
          name="stockQuantity"
          label="Stock Quantity"
          type="number"
          inputProps={{ min: 0 }}
          sx={{
            width: '100%',
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

      {/* Description */}
      <Grid item xs={12}>
        <RHFTextField
          name="description"
          label="Description"
          multiline
          rows={4}
          sx={{
            width: '100%',
            '& .MuiInputBase-root': {
              fontSize: '25px',
              borderRadius: '12px',
              paddingTop: '20px',
            },
            '& .MuiInputLabel-root': {
              fontSize: '25px',
            },
          }}
        />
      </Grid>
    </Grid>

    {/* Submit Button */}
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
          backgroundColor: '#FF9800',
          ':hover': {
            backgroundColor: '#FFB74D',
            color: '#ffffff',
          },
        }}
      >
        {isEdit ? 'Save Changes' : 'Create Service'}
      </LoadingButton>
    </Box>
  </Card>
</FormProvider>

  );
}
