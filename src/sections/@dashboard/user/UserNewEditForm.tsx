import * as Yup from 'yup';
import { useEffect, useMemo, useState } from 'react';
import { createUserApi } from 'src/api/UserApi';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Card, Grid, IconButton, InputAdornment, Stack } from '@mui/material';
import { useAuthContext } from 'src/auth/useAuthContext';
import Iconify from 'src/components/iconify/Iconify';
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
  phoneNumber: string;
  district: string;
};
type Props = {
  isEdit?: boolean;
  userData?: NewUserCreate;
};

export default function UserNewEditForm({ isEdit = false, userData }: Props) {

  const { enqueueSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);
  const { user} = useAuthContext();

  const userRoles = [
    {
      label: 'Hotel Admin',
      value: 'hoteladmin',
    },
  ]

  const district = [
    {
      value: 'Select district',
    },
    {
      value: 'Colombo',
      text: 'Colombo',
    },
    {
      value: 'Gampaha',
      text: 'Gampaha',
    },
    {
      value: 'Kalutara',
      text: 'Kalutara',
    },
    {
      value: 'Kandy',
      text: 'Kandy',
    },
    {
      value: 'Matale',
      text: 'Matale',
    },    
    {
      value: 'Nuwara-Eliya',
      text: 'Nuwara-Eliya',
    },    
    {
      value: 'Galle',
      text: 'Galle',
    },    
    {
      value: 'Matara',
      text: 'Matara',
    },    
    {
      value: 'Hambantota',
      text: 'Hambantota',
    },    
    {
      value: 'Kilinochchi',
      text: 'Kilinochchi',
    },    
    {
      value: 'Mannar',
      text: 'Mannar',
    },    
    {
      value: 'Vavuniya',
      text: 'Vavuniya',
    },    
    {
      value: 'Mullaitivu',
      text: 'Mullaitivu',
    },    
    {
      value: 'Batticaloa',
      text: 'Batticaloa',
    },    
    {
      value: 'Ampara',
      text: 'Ampara',
    },    
    {
      value: 'Trincomalee',
      text: 'Trincomalee',
    },   
    {
      value: 'Kurunegala',
      text: 'Kurunegala',
    },   
    {
      value: 'Puttalam',
      text: 'Puttalam',
    },    
    {
      value: 'Anuradhapura',
      text: 'Anuradhapura',
    },    
    {
      value: 'Polonnaruwa',
      text: 'Polonnaruwa',
    },    
    {
      value: 'Badulla',
      text: 'Badulla',
    },    
    {
      value: 'Moneragala',
      text: 'Moneragala',
    },    
    {
      value: 'Ratnapura',
      text: 'Ratnapura',
    },   
    {
      value: 'Kegalle',
      text: 'Kegalle',
    }, 
  ];

  const NewUserSchema = Yup.object().shape({
    userName: Yup.string().trim().min(3,'Name must be at least 3 characters')
      .max(15,'Name must be less than 15 characters').required('Name is required'),
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    role: Yup.string().required('Role is required'),
    password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(15, 'Password must be less than 15 characters'),
    phoneNumber: Yup.string().required("Phone number is required.")
    .matches(/^07\d{8}$/,"Please enter a valid mobile number"),
    district: Yup.string().required("District is required"),
  });

  const defaultValues = useMemo(
    () => ({
    userName: userData?.userName ? userData?.userName : "",
    email: userData?.email ? userData?.email : "",
    phoneNumber: userData?.phoneNumber ? userData?.phoneNumber : "",
    password: userData?.password ? userData?.password : "",
    district: userData?.district ? userData?.district : "",
    role: 'hoteladmin',
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
        const payload = {
          itemSelect: user?.itemSelect,
          userName: data?.userName,
          email: data?.email,
          password: data?.password,
          phoneNumber: data?.phoneNumber,
          role: data?.role,
          district: data?.district,
        }

          await createUserApi(payload, true);
          reset(defaultValues);
          enqueueSnackbar('Create successfully!');

    } catch (error) {
      enqueueSnackbar(error.message ??'Error creating account!', {
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
              <RHFTextField required name="password" label="Password"
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
              <RHFSelect required native name="district" label="District" placeholder="district">
                {district?.map((item) => (
                  <option key={item?.value} value={item?.value}>
                    {item?.value}
                  </option>
                ))}
              </RHFSelect>
              <RHFSelect required native name="role" label="User Role" placeholder="Role">
                {userRoles.map((role) => (
                  <option key={role.value} value={role.label}>
                    {role.label}
                  </option>
                ))}
              </RHFSelect>
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}
                sx={{
                  backgroundColor: "#36B37E",
                  fontWeight: 500,
                  letterSpacing: 0,
                  opacity: 1,
                  ":hover": {
                    backgroundColor: "#34E0A1",
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
