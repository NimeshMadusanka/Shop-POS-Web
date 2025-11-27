// import { Stack, Typography } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
// import Button from '@mui/material/Button';
// import { LoginText } from '../../components/logo';
// import Image from '../../components/image';
// import PRSLogo from '../../assets/logo.png';
// import LoginLayout from '../../layouts/login';
// import AuthSignUpForm from './AuthSignUpForm ';
// import { PATH_AUTH } from '../../routes/paths';

// export default function Signup() {
//   const navigate = useNavigate();

//   return (
//     <LoginLayout>
//       <Stack spacing={2} sx={{ mb: 3,position: 'relative' }}>
//         <Image
//           disabledEffect
//           visibleByDefault
//           alt="auth"
//           src={PRSLogo}
//           sx={{
//             width: { lg: 180, md: 150, sm: 130, xs: 120 },
//             mb: { lg: 1, md: 8, sm: 5, xs: 4 },
//             height: 'auto',
//             alignSelf: 'center',
//           }}
//         />
//         <Typography variant="h4" >
//           Signup into PRS Client Portal
//         </Typography>
//       </Stack>
//       <AuthSignUpForm />
//       <Typography sx={{ mt: 1 }}>
//         Sign up Click here to{' '}
//         <Button
//           onClick={() => navigate(PATH_AUTH.login)}
//           sx={{ background: 'none', color: '#22345B' }}
//         >
//           <span style={{ fontWeight: 'bold' }}>Login</span>
//         </Button>
//       </Typography>
//       <LoginText
//         sx={{
//           zIndex: 9,
//           position: 'absolute',
//           bottom: 0,
//           color: '#22345B',
//           mb: { xs: 1.5, md: 3 },
//           mr: { xs: 2, md: 5 },
//         }}
//       />
//     </LoginLayout>
//   );
// }
// import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Stack, Typography } from '@mui/material';
import Image from '../../components/image';
import EssentialsLogo from '../../assets/ESSENTIALS.png';

// layouts
import SignupLayout from '../../layouts/signup';
//
import AuthSignupForm from './AuthSignUpForm ';

// ----------------------------------------------------------------------

export default function Signup() {
  // const { method } = useAuthContext();

  return (
    <SignupLayout>
      <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
        <Image
          disabledEffect
          visibleByDefault
          alt="auth"
          src={EssentialsLogo}
          sx={{
            width: { lg: 200, md: 180, sm: 160, xs: 140 },
            mb: { lg: 4, md: 3, sm: 2, xs: 2 },
            height: 'auto',
            alignSelf: 'center',
          }}
        />
        <Typography variant="h4" sx={{ color: '#333333' }}>
          Sign Up to The POS System
        </Typography>
      </Stack>
      <AuthSignupForm />
    </SignupLayout>
  );
}
