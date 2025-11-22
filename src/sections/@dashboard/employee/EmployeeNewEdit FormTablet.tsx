import * as Yup from 'yup';
import { useEffect, useMemo, useCallback, useState } from 'react';
import { createEmployeeApi, updateEmployeeApi } from 'src/api/EmployeeApi';
import { getRoleData } from 'src/api/RoleApi';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { useNavigate } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { Box, Card, Grid, Autocomplete, TextField, MenuItem } from '@mui/material';
// @types
import { NewEmployeeCreate } from '../../../@types/user';
// assets
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFTextField, RHFSelect } from '../../../components/hook-form';
import { PATH_DASHBOARD } from '../../../routes/paths';
import { useAuthContext } from 'src/auth/useAuthContext';
// ----------------------------------------------------------------------
const gender = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
];

type FormValuesProps = {
  firstName: string;
  lastName: string;
  nicNumber: string;
  monthlySalary: string;
  role: string;
  allowances: string;
  deductions: string;
  gender: string;
  email: string;
  phoneNumber: string;
  id: string;
};

interface Category {
  _id: string;
  roleName: string;
  monthlySalary: string;
  allowances: string;
  deductions: string;
}
type Props = {
  isEdit?: boolean;
  userData?: NewEmployeeCreate;
};

export default function UserNewEditForm({ isEdit = false, userData }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [roleData, setRoleData] = useState<Category[]>([]);
  const { user } = useAuthContext();
  const companyID = user?.companyID;

  const NewUserSchema = Yup.object().shape({
    firstName: Yup.string()
      .trim()
      .required('First Name is required')
      .min(3, 'First Name must be at least 3 characters')
      .max(30, 'First Name must be less than 30 characters'),

    lastName: Yup.string()
      .trim()
      .required('Last Name is required')
      .min(3, 'Last Name must be at least 3 characters')
      .max(30, 'Last Name must be less than 30 characters'),

    nicNumber: Yup.string()
      .trim()
      .required('NIC Number is required')
      .min(10, 'NIC must be at least 10 characters')
      .max(12, 'NIC must be less than or equal to 12 characters'),

    gender: Yup.string().trim().required('Gender is required'),

    role: Yup.string().trim().required('Role is required'),

    email: Yup.string()
      .trim()
      .email('Invalid email format')
      .required('Email is required')
      .test(
        'is-valid-email',
        'Email must be 3-30 characters if provided',
        (value) => !value || (value.length >= 3 && value.length <= 30)
      ),

    phoneNumber: Yup.string()
      .trim()
      .required('Phonenumber is required')
      .test(
        'is-valid-phone',
        'Phone Number must be 3-30 characters if provided',
        (value) => !value || (value.length >= 3 && value.length <= 30)
      ),
  });

  const defaultValues = useMemo(
    () => ({
      firstName: userData?.firstName || '',
      lastName: userData?.lastName || '',
      nicNumber: userData?.nicNumber || '',
      gender: userData?.gender || '',
      role: userData?.role || '',
      email: userData?.email || '',
      phoneNumber: userData?.phoneNumber || '',
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
    const data = await getRoleData(companyID);

    setRoleData(data);
  }, [companyID]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onSubmit = async (data: FormValuesProps) => {
    try {
      // Destructure the properties from the data object
      const {
        firstName,
        lastName,
        nicNumber,
        role,
        gender,
        email,
        phoneNumber,
        monthlySalary,
        allowances,
        deductions,
        id,
      } = data;

      const payload = {
        firstName,
        lastName,
        nicNumber,
        role,
        monthlySalary,
        allowances,
        deductions,
        gender,
        email,
        phoneNumber,
        companyID,
      };

      if (isEdit) {
        await updateEmployeeApi(payload, id, true);
      } else {
        await createEmployeeApi(payload, true);
        reset(defaultValues);
      }
      navigate(PATH_DASHBOARD.employee.list);
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
      <Grid container spacing={4}>

        {/* First Name */}
        <Grid item xs={12} md={6}>
          <RHFTextField
            name="firstName"
            label="First Name"
            sx={{
              '& .MuiInputBase-root': {
                height: 80,
                fontSize: '25px',
                borderRadius: '12px',
              },
              '& .MuiInputLabel-root': {
                fontSize: '25px',
              },
            }}
            required
          />
        </Grid>

        {/* Last Name */}
        <Grid item xs={12} md={6}>
          <RHFTextField
            name="lastName"
            label="Last Name"
            sx={{
              '& .MuiInputBase-root': {
                height: 80,
                fontSize: '25px',
                borderRadius: '12px',
              },
              '& .MuiInputLabel-root': {
                fontSize: '25px',
              },
            }}
            required
          />
        </Grid>

        {/* NIC */}
        <Grid item xs={12} md={6}>
          <RHFTextField
            name="nicNumber"
            label="NIC Number"
            sx={{
              '& .MuiInputBase-root': {
                height: 80,
                fontSize: '25px',
                borderRadius: '12px',
              },
              '& .MuiInputLabel-root': {
                fontSize: '25px',
              },
            }}
          />
        </Grid>

        {/* Gender */}
        <Grid item xs={12} md={6}>
          <RHFSelect
            name="gender"
            label="Gender"
            sx={{
              '& .MuiInputBase-root': {
                height: 80,
                fontSize: '25px',
                borderRadius: '12px',
              },
              '& .MuiInputLabel-root': {
                fontSize: '25px',
              },
            }}
            required
          >
            {gender?.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </RHFSelect>
        </Grid>

        {/* Role Autocomplete */}
        <Grid item xs={12} md={6}>
          <Autocomplete
            fullWidth
            autoHighlight
            options={roleData}
            getOptionLabel={(option) => option?.roleName || ''}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Role"
                sx={{
                  '& .MuiInputBase-root': {
                    height: 80,
                    fontSize: '25px',
                    borderRadius: '12px',
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '25px',
                  },
                }}
              />
            )}
            onChange={(event, newValue) => {
              setValue('role', newValue?.roleName || '');
              setValue('monthlySalary', newValue?.monthlySalary || '');
              setValue('allowances', newValue?.allowances || '');
              setValue('deductions', newValue?.deductions || '');
            }}
          />
        </Grid>

        {/* Email */}
        <Grid item xs={12} md={6}>
          <RHFTextField
            name="email"
            label="Email Address"
            sx={{
              '& .MuiInputBase-root': {
                height: 80,
                fontSize: '25px',
                borderRadius: '12px',
              },
              '& .MuiInputLabel-root': {
                fontSize: '25px',
              },
            }}
          />
        </Grid>

        {/* Phone Number */}
        <Grid item xs={12} md={6}>
          <RHFTextField
            name="phoneNumber"
            label="Phone Number"
            sx={{
              '& .MuiInputBase-root': {
                height: 80,
                fontSize: '25px',
                borderRadius: '12px',
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
            backgroundColor: '#0066CC',
            ':hover': {
              backgroundColor: '#6E9FC1',
              color: '#ffffff',
            },
          }}
        >
          {isEdit ? 'Save Changes' : 'Create Employee'}
        </LoadingButton>
      </Box>
    </Card>
  </FormProvider>
);




}
