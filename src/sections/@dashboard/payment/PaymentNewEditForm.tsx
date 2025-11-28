import * as Yup from 'yup';
import { useEffect, useMemo, useCallback, useState } from 'react';
import { createPaymentApi, updatePaymentApi } from 'src/api/PaymentApi';
import AddIcon from '@mui/icons-material/Add';

// CUSTOMER SECTION - COMMENTED OUT
// import { getCustomernewData } from 'src/api/CustomerApi';

// REMOVED: getCusloyaltyData - loyalty checkbox removed, item discounts are automatic
import { getItemData } from 'src/api/ItemApi';
// HR-RELATED FEATURE - COMMENTED OUT
// import { getEmployeeData } from 'src/api/EmployeeApi';
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
  customerPhoneNumber?: string; // Optional phone number
  services: {
    service: Item;
    quantity: number;
  }[];

  email: string;
  phoneNumber: string;
  date: Date | null;
  // REMOVED: addLoyalty - item discounts are now automatic
  // HR-RELATED FEATURE - COMMENTED OUT
  // commission?: boolean;
  // loyalty?: string;
  // discountName:string;
  // newoffPercentage?: number;
  billDiscountPercentage?: number;
  // HR-RELATED FEATURE - COMMENTED OUT
  // commissionAmount: string;
  // empName: string;
  // empId?: string;
  id: string;
};
// CUSTOMER SECTION - COMMENTED OUT
// interface Customer {
//   _id: string;
//   firstName: string;
//   lastName: string;
// }
interface Item {
  _id: string;
  itemName: string;
  itemPrice: string;
  stockQuantity?: number;
}
// HR-RELATED FEATURE - COMMENTED OUT
// interface Employee {
//   _id: string;
//   firstName: string;
// }
// REMOVED: Discount interface - loyalty checkbox removed
type Props = {
  isEdit?: boolean;
  userData?: NewPaymentCreate;
};

export default function UserNewEditForm({ isEdit = false, userData }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  // CUSTOMER SECTION - COMMENTED OUT
  // const [customerData, setCustomerData] = useState<Customer[]>([]);
  // REMOVED: discountData - loyalty checkbox removed, item discounts are automatic
  const [itemData, setItemData] = useState<Item[]>([]);
  // HR-RELATED FEATURE - COMMENTED OUT
  // const [employeeData, setEmployeeData] = useState<Employee[]>([]);

  // const [companyID, setCompanyID] = useState<string | null>(null);

  const { user } = useAuthContext();
  const companyID = user?.companyID;

  const NewUserSchema = Yup.object().shape({
    customerName: Yup.string()
      .trim()
      .required('Customer Name is required')
      .min(3, 'Customer Name must be at least 3 characters')
      .max(100, 'Customer Name must be less than 100 characters'),
    customerPhoneNumber: Yup.string()
      .trim()
      .max(20, 'Phone number must be less than 20 characters')
      .optional(),
  });

  const defaultValues = useMemo(
    () => ({
      customerName: userData?.customerName ? userData?.customerName : '',
      customerPhoneNumber: userData?.customerPhoneNumber || '', // Optional phone number
      date: userData?.date ? new Date(userData.date) : null,
      // HR-RELATED FEATURE - COMMENTED OUT
      // commission: userData?.commission ?? false, // ✅ default to false
      // REMOVED: addLoyalty - item discounts are now automatic
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
    watch,
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'services',
  });

  // const {
  //   fields: loyaltyFields,
  //   append: appendLoyalty,
  //   remove: removeLoyalty,
  // } = useFieldArray({
  //   control,
  //   name: 'services',
  // });

  const services = watch('services');
  // REMOVED: addloyalty watch - loyalty checkbox removed
  // HR-RELATED FEATURE - COMMENTED OUT
  // const commissionChecked = watch('commission');

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
    // CUSTOMER SECTION - COMMENTED OUT
    // const data = await getCustomernewData(companyID);
    const datanew = await getItemData(companyID);
    // HR-RELATED FEATURE - COMMENTED OUT
    // const dataemployee = await getEmployeeData(companyID);
    // REMOVED: discount data loading - loyalty checkbox removed
    // setCustomerData(data);
    setItemData(datanew);
    // HR-RELATED FEATURE - COMMENTED OUT
    // setEmployeeData(dataemployee);
    
  }, [companyID]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onSubmit = async (data: FormValuesProps) => {
    try {
      // Validate stock availability before submitting
      const stockErrors: string[] = [];
      services.forEach((s) => {
        const availableStock = s.service?.stockQuantity ?? 0;
        const requestedQuantity = s.quantity || 0;
        if (availableStock < requestedQuantity) {
          stockErrors.push(
            `${s.service?.itemName || 'Item'}: Only ${availableStock} available, but ${requestedQuantity} requested`
          );
        }
      });

      if (stockErrors.length > 0) {
        enqueueSnackbar(`Insufficient stock: ${stockErrors.join('; ')}`, {
          variant: 'error',
        });
        return;
      }

      // Destructure the properties from the data object
      const {
        customerName,
        customerPhoneNumber,
        date,
        billDiscountPercentage,
        // HR-RELATED FEATURE - COMMENTED OUT
        // commission,
        // commissionAmount,
        // empId,
        // empName,
        // REMOVED: addLoyalty, newoffPercentage - item discounts are now automatic
        id,
      } = data;

      const formattedServices = services.map((s) => ({
        itemId: s.service._id,
        quantity: s.quantity,
        itemPrice: s.service.itemPrice,
        itemName: s.service.itemName,
      }));

      // Format date to string
      let formattedDate = '';
      if (date) {
        if (date instanceof Date) {
          formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        } else if (typeof date === 'string') {
          formattedDate = date;
        } else {
          formattedDate = new Date().toISOString().split('T')[0]; // Default to today
        }
      } else {
        formattedDate = new Date().toISOString().split('T')[0]; // Default to today if no date
      }

      // Validate items
      if (!formattedServices || formattedServices.length === 0) {
        enqueueSnackbar('Please add at least one item to the sale', {
          variant: 'error',
        });
        return;
      }

      const payload = {
        customerName,
        customerPhoneNumber: customerPhoneNumber || '', // Optional phone number
        items: formattedServices,
        addLoyalty: false, // Always use automatic per-item discounts
        // HR-RELATED FEATURE - COMMENTED OUT
        // commission,
        // commissionAmount,
        // empId,
        // empName,
        newoffPercentage: 0, // Not used - item discounts are automatic
        billDiscountPercentage: billDiscountPercentage || 0,
        date: formattedDate,
        companyID,
      };

      if (isEdit) {
        await updatePaymentApi(payload, id, true);
      } else {
        const response = await createPaymentApi(payload, true); // ✅ available in this block
      console.log("Created Payment:", response);
     
      navigate(PATH_DASHBOARD.payment.listnew, { 
        state: { grandTotal: response?.grandTotal , paymentId: response._id,}
      });
      }
      
    
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
              <RHFTextField
                required
                name="customerName"
                label="Customer Name"
              />

              <RHFTextField
                name="customerPhoneNumber"
                label="Customer Phone Number (Optional)"
              />

              <RHFTextField
                required
                name="date"
                label="Sale Date"
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
          getOptionLabel={(option) => {
            const stock = option?.stockQuantity ?? 0;
            return `${option?.itemName || ''} (Stock: ${stock})`;
          }}
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
      inputProps={{ min: 1, max: fields.length === 0 ? (itemData.find(i => i._id === watch(`services.0.service`)?._id)?.stockQuantity ?? 999) : undefined }}
      sx={{ width: 100 }}
      helperText={
        fields.length === 0 && watch(`services.0.service`)
          ? `Available: ${itemData.find(i => i._id === watch(`services.0.service`)?._id)?.stockQuantity ?? 0}`
          : undefined
      }
    />

    <IconButton
      onClick={() =>
        append({ service: { _id: '', itemName: '', itemPrice: '' }, quantity: 1 })
      }
      color="primary"
      sx={{
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
              getOptionLabel={(option) => {
                const stock = option?.stockQuantity ?? 0;
                return `${option?.itemName || ''} (Stock: ${stock})`;
              }}
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
          inputProps={{ 
            min: 1, 
            max: itemData.find(i => i._id === watch(`services.${index}.service`)?._id)?.stockQuantity ?? 999 
          }}
          sx={{ width: 100 }}
          helperText={
            watch(`services.${index}.service`)
              ? `Available: ${itemData.find(i => i._id === watch(`services.${index}.service`)?._id)?.stockQuantity ?? 0}`
              : undefined
          }
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
            color="primary"
            sx={{
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
</Box>

{/* Bill Discount Section */}
{/* Note: Item-level discounts are automatically applied from the Discounts section */}
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
                {!isEdit ? 'Create Sale' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
    // </LocalizationProvider>
  );
}
