import * as Yup from 'yup';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { createItemApi, updateItemApi } from 'src/api/ItemApi';
import { getCategoryData } from 'src/api/CategoryApi';
import { getBrandData } from 'src/api/BrandApi';
import { getShopData } from 'src/api/ShopApi';
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
  brandId: string;
  shopId: string;
  id: string;
};

interface Category {
  _id: string;
  catgName: string;
}

interface Brand {
  _id: string;
  brandName: string;
  description?: string;
  providerId?: string;
  providerName?: string;
}

interface Shop {
  _id: string;
  shopName: string;
  ownerEmail: string;
  contactPhone?: string;
  address?: string;
  companyID: string;
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
  const [brandData, setBrandData] = useState<Brand[]>([]);
  const [shopData, setShopData] = useState<Shop[]>([]);
  const { user } = useAuthContext();
  const companyID = user?.companyID;

  const NewUserSchema = Yup.object().shape({
    itemName: Yup.string().required('Product Name is required'),
    itemCategory: Yup.string().required('Product Category is required'),
    brandId: Yup.string().required('Brand is required'),
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
      brandId: (userData as any)?.brandId || '',
      shopId: (userData as any)?.shopId || '',
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
    if (!companyID) return;
    try {
      const [categories, brands, shops] = await Promise.all([
        getCategoryData(),
        getBrandData(companyID),
        getShopData(companyID),
      ]);
      setCategoryData(categories);
      setBrandData(brands);
      setShopData(shops);
    } catch (error) {
      enqueueSnackbar('Error loading data', { variant: 'error' });
    }
  }, [companyID, enqueueSnackbar]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onSubmit = async (data: FormValuesProps) => {
    if (!companyID) {
      enqueueSnackbar('Company ID is required', { variant: 'error' });
      return;
    }
    try {
      // Destructure the properties from the data object
      const { itemName, itemCategory, itemPrice, itemDuration, stockQuantity, brandId, shopId, id } = data;

      const payload: any = {
        itemName,
        itemCategory,
        itemPrice,
        itemDuration,
        itemType: 'service',
        stockQuantity: stockQuantity ? Number(stockQuantity) : 0,
        companyID,
        brandId: brandId || null,
        shopId: shopId || null,
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
                options={brandData}
                getOptionLabel={(option) => option?.brandName || ''}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                value={brandData.find((b) => b._id === methods.watch('brandId')) || null}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Brand *"
                    inputProps={{
                      ...params.inputProps,
                      autoComplete: 'new-password',
                    }}
                  />
                )}
                onChange={(event, newValue) => {
                  setValue('brandId', newValue?._id || '');
                }}
              />
              {(() => {
                const selectedBrand = brandData.find((b) => b._id === methods.watch('brandId'));
                if (selectedBrand?.providerName) {
                  return (
                    <TextField
                      fullWidth
                      label="Provider"
                      value={selectedBrand.providerName}
                      disabled
                      helperText="Provider for selected brand"
                      sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}
                    />
                  );
                }
                return null;
              })()}

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
              <Autocomplete
                fullWidth
                autoHighlight
                options={shopData}
                getOptionLabel={(option) => option?.shopName || ''}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                value={shopData.find((s) => s._id === methods.watch('shopId')) || null}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Shop (Optional)"
                    helperText="Leave empty for company-wide products"
                    inputProps={{
                      ...params.inputProps,
                      autoComplete: 'new-password',
                    }}
                  />
                )}
                onChange={(event, newValue) => {
                  setValue('shopId', newValue?._id || '');
                }}
              />
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
                color="primary"
                sx={{
                  fontWeight: 500,
                  letterSpacing: 0,
                  opacity: 1,
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
