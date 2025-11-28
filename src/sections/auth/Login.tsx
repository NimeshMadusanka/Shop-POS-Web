import { Stack, Typography, Box } from '@mui/material';
import Image from '../../components/image';
import EssentialsLogo from '../../assets/ESSENTIALS.png';
import LoginLayout from '../../layouts/login';
import AuthLoginForm from './AuthLoginForm';

export default function Login() {
  return (
    <LoginLayout>
      <Stack 
        spacing={2} 
        sx={{ 
          mb: 3, 
          position: 'relative',
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden',
        }}
      >
        <Image
          disabledEffect
          visibleByDefault
          alt="auth"
          src={EssentialsLogo}
          sx={{
            width: { lg: 100, md: 90, sm: 80, xs: 70 },
            mb: { lg: 1.5, md: 1.5, sm: 1, xs: 1 },
            height: 'auto',
            alignSelf: 'center',
          }}
        />
        <Typography variant="h4" sx={{ textAlign: 'center' }}>Login</Typography>
      </Stack>
      <Box sx={{ width: '100%', maxWidth: '100%', overflow: 'auto' }}>
        <AuthLoginForm />
      </Box>
    </LoginLayout>
  );
}
