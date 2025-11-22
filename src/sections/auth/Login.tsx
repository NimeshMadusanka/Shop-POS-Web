import { Stack, Typography } from '@mui/material';
import { LoginText } from '../../components/logo';
import Image from '../../components/image';
import PRSLogo from '../../assets/logo.svg';
import LoginLayout from '../../layouts/login';
import AuthLoginForm from './AuthLoginForm';

export default function Login() {
  return (
    <LoginLayout>
      <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
        <Image
          disabledEffect
          visibleByDefault
          alt="auth"
          src={PRSLogo}
          sx={{
            width: { lg: 120, md: 100, sm: 90, xs: 80 },
            mb: { lg: 6, md: 4, sm: 3, xs: 2 },
            height: 'auto',
            alignSelf: 'center',
          }}
        />
        <Typography variant="h4">Login</Typography>
      </Stack>
      <AuthLoginForm />
      <LoginText
        sx={{
          zIndex: 9,
          position: 'absolute',
          bottom: 0,
          color: '#FF9800',
          mb: { xs: 1.5, md: 3 },
          mr: { xs: 2, md: 5 },
        }}
      />
    </LoginLayout>
  );
}
