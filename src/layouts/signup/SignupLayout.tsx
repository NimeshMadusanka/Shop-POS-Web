// @mui
import { Typography, Stack } from '@mui/material';
// components
import { Logo } from '../../components/logo';
import Image from '../../components/image';
//
import { StyledRoot, StyledSectionBg, StyledSection, StyledContent } from './styles';
import signupBanner from '../../assets/newslider.png';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  illustration?: string;
  children: React.ReactNode;
};

export default function SignupLayout({ children, illustration, title }: Props) {
  return (
    <StyledRoot>
      <Logo
        sx={{
          zIndex: 9,
          position: 'absolute',
          mt: { xs: 1.5, md: -60 },
          ml: { xs: 2, md: 5 },
        }}
      />

      <StyledSection>
        <Typography variant="h3" sx={{ mb: 10, maxWidth: 480, textAlign: 'center' }}>
          {title || 'Hi, Welcome back'}
        </Typography>

        <Image
          disabledEffect
          visibleByDefault
          alt="auth"
          src={illustration || signupBanner}
          sx={{ maxWidth: 520 }}
        />

        <StyledSectionBg />
      </StyledSection>

      <StyledContent>
        <Stack sx={{ width: 1 }} spacing={1}>
          {' '}
          {children}{' '}
        </Stack>
      </StyledContent>
    </StyledRoot>
  );
}
