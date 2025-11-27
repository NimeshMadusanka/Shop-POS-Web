// @mui
import { Stack } from '@mui/material';
// components
import { Logo, Ollcode } from '../../components/logo';

import Image from '../../components/image';
import Background from '../../assets/pexels-asadphoto-2549017.jpg'
//
import { StyledRoot, StyledSectionBg, StyledSection, StyledContent } from './styles';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  illustration?: string;
  children: React.ReactNode;
};

export default function LoginLayout({ children, illustration, title }: Props) {
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
        {/* <Typography variant="h3" sx={{ mb: 10, maxWidth: 480, textAlign: 'center' }}>
          {title || 'Hi, Welcome back'}
        </Typography> */}

        <Image
          disabledEffect
          visibleByDefault
          alt="auth"
          src={Background}
          sx={{ 
            width: '100%', 
            height: '100vh', 
            minHeight: '100vh',
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        />

        <StyledSectionBg />
      </StyledSection>

      <StyledContent>
        <Stack sx={{ width: 1 }}> {children} </Stack>
      </StyledContent>
      <Ollcode
        sx={{
          zIndex: 9,
          position: 'absolute',
          bottom: 0,
          color:'#FFFFFF',
          mb: { xs: 1.5, md: 3 },
          ml: { xs: 2, md: 5 },
        }}
      />
    </StyledRoot>
  );
}
