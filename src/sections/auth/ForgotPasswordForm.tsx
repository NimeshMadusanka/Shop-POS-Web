import { useState } from 'react';
import * as Yup from 'yup';
import axios from 'src/utils/axios';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {  Stack, Alert, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import FormProvider, { RHFTextField } from '../../components/hook-form';
import Image from '../../components/image';
import Background from '../../assets/slider2.jpg'
import { Logo, Ollcode } from '../../components/logo';
import { StyledRoot, StyledSectionBg, StyledSection, StyledContent } from '../../layouts/login/styles';

const forgotPasswordAPI = async (email: string) => {
  try {
    const response = await axios.post('/user/client-forgot-password', { email });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Something went wrong!');
  }
};

type FormValuesProps = {
  email: string;
  afterSubmit?: string;
};

export default function ForgotPasswordForm() {
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);
  const [success, setsuccess] = useState<string | null>(null);
  const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
  });

  const defaultValues = {
    email: '',
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(ForgotPasswordSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;
  const onSubmit = async (data: FormValuesProps) => {
    try {
      await forgotPasswordAPI(data.email);
      setIsSubmitSuccessful(true);
      setsuccess("success! Please check your email");
      setTimeout(() => {
        reset();
        setIsSubmitSuccessful(false);
        setsuccess(null);
      }, 2000); 
      
    } catch (error) {
      reset();
      setError('afterSubmit', {
        type: 'manual',
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
            Forgot Password
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Please enter your email address. You will receive a link to create a new password via email.
          </Typography>
          <RHFTextField required name="email" label="Email address" />
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
            Forgot Password
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