import { useState } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';
import { Stack, Alert, IconButton, InputAdornment, Link, Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useAuthContext } from '../../auth/useAuthContext';
import Iconify from '../../components/iconify';
import FormProvider, { RHFTextField } from '../../components/hook-form';
import { useNavigate } from 'react-router-dom';
import { PATH_AUTH } from '../../routes/paths';

type FormValuesProps = {
  email: string;
  password: string;

  afterSubmit?: string;
};

export default function AuthLoginForm() {
  const { login } = useAuthContext();

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const LoginSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .max(15, 'Password must be less than 15 characters')
      .required('Password is required'),
  });

  const defaultValues = {
    email: '',
    password: '',
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const forgotpassword = () => {
    navigate(PATH_AUTH.forgotpassword);
  };

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    try {
      await login(data.email, data.password);
    } catch (error) {
      reset();
      setError('afterSubmit', {
        ...error,
        message: error.message || error,
      });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}

        <RHFTextField required name="email" label="Email address" />

        <RHFTextField
          name="password"
          label="Password"
          required
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
      </Stack>
      {/* <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitSuccessful || isSubmitting}
        sx={{
          marginTop: '2rem',
          bgcolor: '#FF9800',
          color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
          '&:hover': {
            bgcolor: '#FFB74D',
            color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
          },
        }}
      >
        Login
      </LoadingButton> */}
      <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
        <LoadingButton
          fullWidth
          color="inherit"
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitSuccessful || isSubmitting}
          sx={{
            bgcolor: '#FF9800',
            color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
            '&:hover': {
              backgroundColor: '#FFB74D',
              color: '#ffffff',
            },
          }}
        >
          Login
        </LoadingButton>

        <LoadingButton
          fullWidth
          color="inherit"
          size="large"
          variant="contained"
          onClick={() => navigate(PATH_AUTH.signUp)} // 🔁 Update to your actual signup path
          sx={{
            bgcolor: '#FF9800',
            color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
            '&:hover': {
              backgroundColor: '#FFB74D',
              color: '#ffffff',
            },
          }}
        >
          Signup
        </LoadingButton>
      </Stack>

      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
        <Link
          component="button"
          variant="body2"
          underline="hover"
          sx={{
            color: '#FF9800',
            mr: 36,
            '&:hover': {
              color: '#F57C00',
            },
          }}
          onClick={forgotpassword}
        >
          Forget Password
        </Link>
      </Box>
    </FormProvider>
  );
}
