import { useState } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';
import { Stack, Alert, IconButton, InputAdornment, Link, Box, ToggleButtonGroup, ToggleButton, Typography, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useAuthContext } from '../../auth/useAuthContext';
import Iconify from '../../components/iconify';
import FormProvider, { RHFTextField } from '../../components/hook-form';
import { useNavigate } from 'react-router-dom';
import { PATH_AUTH } from '../../routes/paths';
import PinEntryDialog from './PinEntryDialog';

type FormValuesProps = {
  email: string;
  password: string;
  pin?: string;

  afterSubmit?: string;
};

export default function AuthLoginForm() {
  const { login, loginPin } = useAuthContext();

  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState<'password' | 'pin'>('password');
  const [openPinDialog, setOpenPinDialog] = useState(false);
  const navigate = useNavigate();

  const LoginSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().when([], {
      is: () => loginMode === 'password',
      then: (schema) => schema
        .min(8, 'Password must be at least 8 characters')
        .max(15, 'Password must be less than 15 characters')
        .required('Password is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
    pin: Yup.string().when([], {
      is: () => loginMode === 'pin',
      then: (schema) => schema
        .matches(/^\d{6}$/, 'PIN must be exactly 6 digits')
        .required('PIN is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  const defaultValues = {
    email: '',
    password: '',
    pin: '',
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
      if (loginMode === 'pin') {
        // Open PIN dialog instead of submitting directly
        if (!data.email) {
          setError('afterSubmit', {
            message: 'Email is required',
          });
          return;
        }
        setOpenPinDialog(true);
      } else {
        await login(data.email, data.password);
      }
    } catch (error: any) {
      reset();
      setError('afterSubmit', {
        ...error,
        message: error?.response?.data?.message || error?.message || 'Login failed. Please try again.',
      });
    }
  };

  const handlePinComplete = async (pin: string) => {
    try {
      const email = methods.getValues('email');
      if (!loginPin) {
        setError('afterSubmit', {
          message: 'PIN login is not available',
        });
        setOpenPinDialog(false);
        return;
      }
      await loginPin(email, pin);
      setOpenPinDialog(false);
    } catch (error: any) {
      setError('afterSubmit', {
        ...error,
        message: error?.response?.data?.message || error?.message || 'PIN login failed. Please try again.',
      });
      setOpenPinDialog(false);
    }
  };

  const handleModeChange = (event: React.MouseEvent<HTMLElement>, newMode: 'password' | 'pin' | null) => {
    if (newMode !== null) {
      setLoginMode(newMode);
      reset();
      // Clear PIN when switching modes
      if (newMode === 'pin') {
        methods.setValue('pin', '');
      }
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <ToggleButtonGroup
            value={loginMode}
            exclusive
            onChange={handleModeChange}
            aria-label="login mode"
            size="small"
          >
            <ToggleButton value="password" aria-label="password login">
              <Typography variant="body2">Password</Typography>
            </ToggleButton>
            <ToggleButton value="pin" aria-label="pin login">
              <Typography variant="body2">PIN (Cashier)</Typography>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <RHFTextField required name="email" label="Email address" />

        {loginMode === 'password' ? (
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
        ) : (
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => {
              const email = methods.getValues('email');
              if (!email) {
                setError('afterSubmit', {
                  message: 'Please enter your email first',
                });
                return;
              }
              setOpenPinDialog(true);
            }}
            sx={{
              py: 2,
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                borderColor: 'primary.dark',
                bgcolor: 'primary.lighter',
              },
            }}
          >
            Enter PIN
          </Button>
        )}
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
          color="primary"
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitSuccessful || isSubmitting}
        >
          Login
        </LoadingButton>

      </Stack>

      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
        <Link
          component="button"
          variant="body2"
          underline="hover"
          sx={{
            color: 'primary.main',
            mr: 36,
            '&:hover': {
              color: 'primary.dark',
            },
          }}
          onClick={forgotpassword}
        >
          Forget Password
        </Link>
      </Box>

      <PinEntryDialog
        open={openPinDialog}
        onClose={() => setOpenPinDialog(false)}
        onPinComplete={handlePinComplete}
        email={methods.watch('email') || ''}
      />
    </FormProvider>
  );
}
