import * as Yup from 'yup';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserApi, updateUserApi } from 'src/api/UserApi';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Card, Grid, IconButton, InputAdornment, Stack } from '@mui/material';
import { useAuthContext } from 'src/auth/useAuthContext';
import Iconify from 'src/components/iconify/Iconify';
import { OUTLETS } from 'src/config/outlets';
import { PATH_DASHBOARD } from 'src/routes/paths';
// @types
import { NewUserCreate } from '../../../@types/user';
// assets
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from '../../../components/hook-form';



// ----------------------------------------------------------------------

type FormValuesProps = {
  userName:string;
  email:string;
  role: string;
  password: string;
  pin: string;
  assignedOutletId?: 'AHANGAMA' | 'ARUGAM_BAY' | '';
  phoneNumber: string;
  emergencyPhoneNumber: string;
};
type Props = {
  isEdit?: boolean;
  userData?: NewUserCreate;
};

export default function UserNewEditForm({ isEdit = false, userData }: Props) {

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const { user} = useAuthContext();

  const userRoles = [
    {
      label: 'Admin',
      value: 'admin',
    },
    {
      label: 'Cashier',
      value: 'cashier',
    },
  ]


  const NewUserSchema = Yup.object().shape({
    userName: Yup.string().trim().min(3,'Name must be at least 3 characters')
      .max(15,'Name must be less than 15 characters').required('Name is required'),
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    role: Yup.string().required('Role is required'),
    password: Yup.string().when('role', {
      is: (role: string) => role !== 'cashier' && !isEdit,
      then: (schema) => schema
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .max(15, 'Password must be less than 15 characters'),
      otherwise: (schema) => schema
        .notRequired()
        .test(
          'password-length',
          'Password must be at least 8 characters',
          (value) => !value || (value.length >= 8 && value.length <= 15)
        ),
    }),
    pin: Yup.string().when('role', {
      is: (role: string) => role === 'cashier' && !isEdit,
      then: (schema) => schema
        .required('PIN is required for cashier accounts')
        .matches(/^\d{6}$/, 'PIN must be exactly 6 digits'),
      otherwise: (schema) => schema
        .notRequired()
        .test(
          'pin-format',
          'PIN must be exactly 6 digits',
          (value) => !value || /^\d{6}$/.test(value)
        ),
    }),
    assignedOutletId: Yup.string().when('role', {
      is: 'cashier',
      then: (schema) =>
        schema
          .required('Outlet is required for cashier')
          .oneOf(OUTLETS as any, 'Please select a valid outlet'),
      otherwise: (schema) => schema.notRequired(),
    }),
    phoneNumber: Yup.string().required("Phone number is required.")
    .matches(/^07\d{8}$/,"Please enter a valid mobile number"),
    emergencyPhoneNumber: Yup.string()
      .required("Emergency phone number is required")
      .matches(/^07\d{8}$/, "Please enter a valid mobile number"),
  });

  const defaultValues = useMemo(
    () => ({
    userName: userData?.userName ? userData?.userName : "",
    email: userData?.email ? userData?.email : "",
    phoneNumber: userData?.phoneNumber ? userData?.phoneNumber : "",
    emergencyPhoneNumber: userData?.emergencyPhoneNumber ? userData?.emergencyPhoneNumber : "",
    password: '',
    pin: '',
    role: userData?.role || 'admin',
    assignedOutletId: (userData as any)?.assignedOutletId || '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userData]
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = methods;

  const selectedRole = watch('role') || 'admin';

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
        const payload: any = {
          itemSelect: user?.itemSelect,
          userName: data?.userName,
          email: data?.email,
          phoneNumber: data?.phoneNumber,
          emergencyPhoneNumber: data?.emergencyPhoneNumber,
          role: data?.role,
        };

        if (data?.role === 'cashier') {
          if (data?.pin) {
            payload.pin = data.pin;
          }
          payload.assignedOutletId = data?.assignedOutletId;
        } else {
          if (data?.password) {
            payload.password = data.password;
          }
          payload.assignedOutletId = null;
        }

        if (isEdit && userData?._id) {
          await updateUserApi(userData._id, payload);
          enqueueSnackbar('User updated successfully!');
          navigate(PATH_DASHBOARD.user.list);
          return;
        }

        if (data?.role === 'cashier') {
          payload.pin = data?.pin;
        } else {
          payload.password = data?.password;
        }

        await createUserApi(payload, true);
        reset(defaultValues);
        enqueueSnackbar('Create successfully!');

    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || (isEdit ? 'Error updating user!' : 'Error creating account!');
      enqueueSnackbar(message, {
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
              <RHFTextField required name="userName" label="Name" />

              <RHFTextField required name="email" label="Email address" />
              <RHFTextField required name="phoneNumber" label="Phone number" />
              <RHFTextField required name="emergencyPhoneNumber" label="Emergency phone number" />
              <RHFSelect required native name="role" label="User Role" placeholder="Role">
                {userRoles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </RHFSelect>
              {selectedRole === 'cashier' && (
                <RHFSelect required native name="assignedOutletId" label="Assigned Outlet">
                  <option value="">Select outlet</option>
                  {OUTLETS.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </RHFSelect>
              )}
              {selectedRole === 'cashier' ? (
                <RHFTextField 
                  name="pin" 
                  label={isEdit ? 'New PIN (leave blank to keep)' : 'PIN (6 digits)'}
                  required={!isEdit}
                  type={showPin ? 'text' : 'password'}
                  inputProps={{ maxLength: 6, pattern: '[0-9]*' }}
                  helperText={isEdit ? 'Enter a new 6-digit PIN only if you want to change it' : 'Enter a 6-digit PIN for cashier login'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPin(!showPin)} edge="end">
                          <Iconify icon={showPin ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              ) : (
                <RHFTextField 
                  name="password" 
                  label={isEdit ? 'New password (leave blank to keep)' : 'Password'}
                  required={!isEdit}
                  type={showPassword ? 'text' : 'password'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}
                sx={{
                  backgroundColor: "#6B8E5A",
                  fontWeight: 500,
                  letterSpacing: 0,
                  opacity: 1,
                  ":hover": {
                    backgroundColor: "#4A5D3F",
                  },
                }}>
                {!isEdit ? 'Create User' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
