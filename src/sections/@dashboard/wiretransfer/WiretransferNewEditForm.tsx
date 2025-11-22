import * as Yup from 'yup';
import { useEffect, useMemo, useCallback, useState } from 'react';
import { createPaymentApi, updatePaymentApi } from 'src/api/PaymentApi';
import AddIcon from '@mui/icons-material/Add';

import { getCustomernewData } from 'src/api/CustomerApi';

import { getCusloyaltyData } from 'src/api/CusloyaltyApi';
import { getItemData } from 'src/api/ItemApi';
import { getEmployeeData } from 'src/api/EmployeeApi';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton } from '@mui/material';
//getCusloyaltyData
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useFieldArray } from 'react-hook-form';
// @mui
import { useNavigate } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';

import {
  Box,
  Card,
  Grid,
  Stack,
  Autocomplete,
  TextField,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
// @types
import { NewPaymentCreate } from '../../../@types/user';
// assets
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider from '../../../components/hook-form';
import { RHFTextField } from '../../../components/hook-form';
import { useAuthContext } from 'src/auth/useAuthContext';
import { PATH_DASHBOARD } from '../../../routes/paths';
// ----------------------------------------------------------------------

type FormValuesProps = {
  firstName: string;
  lastName: string;
  nicNumber: string;
  customerName: string;
  services: {
    service: Item;
    quantity: number;
  }[];

  email: string;
  phoneNumber: string;
  date: Date | null;
  addLoyalty?: boolean;
  commission?: boolean;
  loyalty?: string;
  discountName:string;

  newoffPercentage?: number;
  billDiscountPercentage?: number;
  commissionAmount: string;
  empName: string;
  empId?: string;
  id: string;
};
interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
}
interface Item {
  _id: string;
  itemName: string;
  itemPrice: string;
}
interface Employee {
  _id: string;
  firstName: string;
}
interface Discount {
  _id: string;
  discountName: string;
   offPercentage: string;
}
type Props = {
  isEdit?: boolean;
  userData?: NewPaymentCreate;
};

export default function UserNewEditForm({ isEdit = false, userData }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [customerData, setCustomerData] = useState<Customer[]>([]);
   const [discountData, setDiscountData] = useState<Discount[]>([]);
  const [itemData, setItemData] = useState<Item[]>([]);
  const [employeeData, setEmployeeData] = useState<Employee[]>([]);

  // const [companyID, setCompanyID] = useState<string | null>(null);

  const { user } = useAuthContext();
  const companyID = user?.companyID;

  const NewUserSchema = Yup.object().shape({
    customerName: Yup.string()
      .trim()
      .required('First Name is required')
      .min(3, 'First Name must be at least 3 characters')
      .max(30, 'First Name must be less than 30 characters'),
  });

  const defaultValues = useMemo(
    () => ({
      customerName: userData?.customerName ? userData?.customerName : '',
      date: userData?.date ? new Date(userData.date) : null,
      commission: userData?.commission ?? false, // ✅ default to false
      addLoyalty: userData?.addLoyalty ?? false, // also default false
      billDiscountPercentage: userData?.billDiscountPercentage || 0,
      id: userData?._id || '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userData]
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewUserSchema),
  });

  const {
    control,
    reset,
    setValue,
    watch,
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'services',
  });

  const {
    fields: loyaltyFields,
    append: appendLoyalty,
    remove: removeLoyalty,
  } = useFieldArray({
    control,
    name: 'services',
  });

  const services = watch('services');
  const addloyalty = watch('addLoyalty');
  const commissionChecked = watch('commission');

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
    const data = await getCustomernewData(companyID);
    const datanew = await getItemData(companyID);
    const dataemployee = await getEmployeeData(companyID);
     const datapackage = await getCusloyaltyData(companyID);
    setCustomerData(data);
    setItemData(datanew);
    setEmployeeData(dataemployee);
     setDiscountData(datapackage);
    
  }, [companyID]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onSubmit = async (data: FormValuesProps) => {
    try {
      // Destructure the properties from the data object
      const {
        customerName,
        date,
        newoffPercentage,
        addLoyalty,
        billDiscountPercentage,
        commission,
        commissionAmount,
        empId,
        empName,
        id,
      } = data;

      const formattedServices = services.map((s) => ({
        itemId: s.service._id,
        quantity: s.quantity,
        itemPrice: s.service.itemPrice,
        itemName: s.service.itemName,
      }));

      const payload = {
        customerName,
        items: formattedServices,
        addLoyalty,
        commission,
        commissionAmount,
        empId,
        empName,
        newoffPercentage: addLoyalty ? newoffPercentage || 0 : 0,
        billDiscountPercentage: billDiscountPercentage || 0,
        date,

        companyID,
      };

      if (isEdit) {
        await updatePaymentApi(payload, id, true);
      } else {
        await createPaymentApi(payload, true);
        reset(defaultValues);
      }
      navigate(PATH_DASHBOARD.payment.list);
      enqueueSnackbar('Create successfully!');
    } catch (error) {
      enqueueSnackbar(error.message ?? 'Error creating account!', {
        variant: 'warning',
      });
    }
  };

  return (
    // <LocalizationProvider dateAdapter={AdapterDateFns}>
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
              <Autocomplete
                fullWidth
                autoHighlight
                options={customerData}
                // getOptionLabel={(option) => option?.firstName || ''}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName}` || ''}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Customer"
                    inputProps={{
                      ...params.inputProps,
                      autoComplete: 'new-password',
                    }}
                  />
                )}
                onChange={(event, newValue) => {
                  const fullName =
                    newValue?.firstName && newValue?.lastName
                      ? `${newValue.firstName} ${newValue.lastName}`
                      : '';
                  setValue('customerName', fullName);
                }}
              />

              <RHFTextField
                required
                name="date"
                label="Appointment Date"
                type="date"
                InputLabelProps={{
                  shrink: true,
                }}
              />

            

              <Box display="flex" flexDirection="column" width="100%" gap={2}>
                  
           {/* Service list */}
<Box display="flex" flexDirection="column" width="100%" gap={2}>
  {fields.length === 0 ? (
   <Box display="flex" alignItems="center" gap={2}>
    <Controller
      control={control}
      name={`services.0.service`} // use 0 for first item
      render={({ field }) => (
        <Autocomplete
          fullWidth
          autoHighlight
          options={itemData}
          getOptionLabel={(option) => option?.itemName || ''}
          isOptionEqualToValue={(option, value) => option._id === value._id}
          onChange={(e, newValue) => field.onChange(newValue || null)}
          renderInput={(params) => <TextField {...params} label="Select Product" />}
        />
      )}
    />
    <TextField
      {...register(`services.0.quantity`)} // use 0
      type="number"
      label="Qty"
      inputProps={{ min: 1 }}
      sx={{ width: 100 }}
    />

    <IconButton
      onClick={() =>
        append({ service: { _id: '', itemName: '', itemPrice: '' }, quantity: 1 })
      }
      sx={{
        backgroundColor: '#FF9800',
        color: '#ffffff',
        '&:hover': { backgroundColor: '#F57C00' },
        width: 36,
        height: 36,
      }}
    >
      <AddIcon />
    </IconButton>
  </Box>
  ) : (
    fields.map((item, index) => (
      <Box key={item.id} display="flex" alignItems="center" gap={2}>
        <Controller
          control={control}
          name={`services.${index}.service`}
          render={({ field }) => (
            <Autocomplete
              fullWidth
              autoHighlight
              options={itemData}
              getOptionLabel={(option) => option?.itemName || ''}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              onChange={(e, newValue) => field.onChange(newValue || null)}
              renderInput={(params) => <TextField {...params} label="Select Product" />}
            />
          )}
        />
        <TextField
          {...register(`services.${index}.quantity`)}
          type="number"
          label="Qty"
          inputProps={{ min: 1 }}
          sx={{ width: 100 }}
        />

        {fields.length > 1 && (
          <IconButton color="error" onClick={() => remove(index)}>
            <DeleteIcon />
          </IconButton>
        )}

        {index === fields.length - 1 && (
          <IconButton
            onClick={() =>
              append({ service: { _id: '', itemName: '', itemPrice: '' }, quantity: 1 })
            }
            sx={{
              backgroundColor: '#FF9800',
              color: '#ffffff',
              '&:hover': { backgroundColor: '#F57C00' },
              width: 36,
              height: 36,
            }}
          >
            <AddIcon />
          </IconButton>
        )}
      </Box>
    ))
  )}

  {/* Loyalty Off % input */}
 
</Box>
{/* Loyalty & Commission checkboxes aligned with columns */}
{/* Loyalty & Commission checkboxes aligned with columns */}
<Grid container spacing={3} alignItems="center" mt={2}>
  {/* First column: Add Loyalty */}
  <Grid item xs={6}>
    <Controller
      name="addLoyalty"
      control={control}
      render={({ field }) => (
        <FormControlLabel
          control={<Checkbox {...field} checked={field.value} />}
          label="Add new Loyalty"
          sx={{ p: 1 }} // add padding around the whole checkbox + label
        />
      )}
    />
  </Grid>

    <Grid item xs={6} spacing={3} alignItems="center" mt={2}>
    <Controller
      name="commission"
      control={control}
      render={({ field }) => (
        <FormControlLabel
          control={<Checkbox {...field} checked={field.value} />}
          label="Commission"
          sx={{ p: 1 ,marginLeft:"250px"}} // add padding here as well
        />
      )}
    />
  </Grid>
    {commissionChecked && (
                  <>
                   
 <Box display="flex" flexDirection="column" gap={2}>
                    <TextField // same width as date input
 required name="commissionAmount" label="commission Amount" />

                    {/* Employee Dropdown */}
                    <Autocomplete
                      fullWidth
                      autoHighlight
                      options={employeeData}
                      getOptionLabel={(option) => option?.firstName || ''}
                      isOptionEqualToValue={(option, value) => option._id === value._id}
                      renderInput={(params) => (
                        <TextField  // same width as date input

                          {...params}
                          label="Select Employee"
                          inputProps={{
                            ...params.inputProps,
                            autoComplete: 'new-password',
                          }}
                        />
                      )}
                      onChange={(event, newValue) => {
                        setValue('empName', newValue?.firstName || '');
                        setValue('empId', newValue?._id || '');
                      }}
                    />
                    </Box>
                  </>
                )}
</Grid>


 {addloyalty && (
     <Autocomplete<Discount>
                fullWidth
                autoHighlight
                options={discountData}
                getOptionLabel={(option) => `${option.discountName}` || ''}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Discount"
                    inputProps={{
                      ...params.inputProps,
                      autoComplete: 'new-password',
                    }}
                  />
                )}
                onChange={(event, newValue) => {
                  const selectedDiscountName = newValue?.discountName || '';
                  const selectedOffPercentage = newValue?.offPercentage || 0;
                setValue('discountName', selectedDiscountName);
  setValue('newoffPercentage', Number(selectedOffPercentage));
                }}
              />
  )}

{/* Bill Discount Section */}
<Grid container spacing={3} sx={{ mt: 2 }}>
  <Grid item xs={12} md={6}>
    <RHFTextField
      name="billDiscountPercentage"
      label="Bill Discount (%)"
      type="number"
      inputProps={{ min: 0, max: 100, step: 0.01 }}
      helperText="Apply discount to entire bill after item discounts"
    />
  </Grid>
</Grid>
              
              
            

             
            
              </Box>
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
                {!isEdit ? 'Create Payment' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
    // </LocalizationProvider>
  );
}
