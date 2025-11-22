import { useState } from 'react';
import * as Yup from 'yup';
import axios from 'src/utils/axios';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {  Stack, Alert,IconButton, InputAdornment, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useNavigate,useLocation} from 'react-router-dom';
import Image from '../../components/image';
import Background from '../../assets/slider2.jpg'
import { Logo, Ollcode } from '../../components/logo';
import { StyledRoot, StyledSectionBg, StyledSection, StyledContent } from '../../layouts/login/styles';
import Iconify from '../../components/iconify';
import FormProvider, { RHFTextField } from '../../components/hook-form';
import { PATH_AUTH } from '../../routes/paths';

const changePasswordAPI = async (password: string, email:string |null) => {
  try {
    const response = await axios.post('/user/client-changePassword', { password, email });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Something went wrong!');
  }
};
type FormValuesProps = {
  password: string;
  confirmPassword: string;
  afterSubmit?: string;
};
export default function ChangePasswordForm() {
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);
  const navigate = useNavigate();
  const [success, setsuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const ChangePasswordSchema = Yup.object().shape({
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .max(15, 'Password must be less than 15 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Confirm Password is required'),
  });
  const defaultValues = {
    password: '',
    confirmPassword: '',
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(ChangePasswordSchema),
    defaultValues,
  });
  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const loginback = () => {
    navigate(PATH_AUTH.login);
  };
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email');
  const onSubmit = async (data: FormValuesProps) => {
    try {
      await changePasswordAPI(data.password, email);
      setIsSubmitSuccessful(true);
      setsuccess("Password Reset Successfull!");
      setTimeout(() => {
        reset();
        setIsSubmitSuccessful(false);
        setsuccess(null);
        loginback();
      }, 5000); 

    } catch (error) {
      reset();
      setError('afterSubmit', {
        ...error,
        message: error.message || 'Something went wrong!',
      });
    }
  };
  return (
    <StyledRoot>
    <Logo
      sx={{
        zIndex: 9,
        position: 'absolute',
        mt: { xs: 1.5, md: 5 },
        ml: { xs: 2, md: 5 },
      }}
    />
    <StyledSection>
      <Image
        disabledEffect
        visibleByDefault
        alt="auth"
        src={Background}
        sx={{ maxWidth: '100%', height: '100vh' }}
      />
      <StyledSectionBg />
    </StyledSection>
    <StyledContent>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3} sx={{ width: 1, padding: 4 }}>
          {!!success && <Alert severity="success">{success}</Alert>}
          {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}
          <Typography variant="h4" gutterBottom>
          Change Password
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Please enter your new password and confirm it. Your password must be at least 8 characters long.
          </Typography>
          <RHFTextField
              required
              name="password"
              label="New Password"
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
            <RHFTextField
              required
              name="confirmPassword"
              label="Confirm Password"
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
          <LoadingButton
            fullWidth
            color="inherit"
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting || isSubmitSuccessful}
            sx={{
              bgcolor: 'text.primary',
              color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
              '&:hover': {
                bgcolor: 'text.primary',
                color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
              },
            }}
          >
             Change Password
          </LoadingButton>
        </Stack>
      </FormProvider>
    </StyledContent>
    <Ollcode
      sx={{
        zIndex: 9,
        position: 'absolute',
        bottom: 0,
        color: '#FFFFFF',
        mb: { xs: 1.5, md: 3 },
        ml: { xs: 2, md: 5 },
      }}
    />
  </StyledRoot>
  );
}