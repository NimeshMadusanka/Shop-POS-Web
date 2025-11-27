// @mui
import { styled, alpha } from '@mui/material/styles';
// utils
import { bgGradient } from '../../utils/cssStyles';

// ----------------------------------------------------------------------

export const StyledRoot = styled('main')(() => ({
  height: '100vh',
  minHeight: '100vh',
  display: 'flex',
  position: 'relative',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  overflow: 'hidden',
}));

export const StyledSection = styled('div')(({ theme }) => ({
  display: 'none',
  position: 'relative',
  height: '100vh',
  minHeight: '100vh',
  overflow: 'hidden',
  [theme.breakpoints.up('md')]: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
}));

export const StyledSectionBg = styled('div')(({ theme }) => ({
  ...bgGradient({
    color: alpha(theme.palette.background.default, theme.palette.mode === 'light' ? 0.9 : 0.94),
    imgUrl: '/assets/background/overlay_2.jpg',
  }),
  top: 0,
  left: 0,
  zIndex: -1,
  width: '100%',
  height: '100%',
  position: 'absolute',
  transform: 'scaleX(-1)',
}));

export const StyledContent = styled('div')(({ theme }) => ({
  width: 480,
  maxWidth: '100%',
  margin: 'auto',
  display: 'flex',
  minHeight: '100vh',
  justifyContent: 'center',
  alignContent: 'space-between',
  padding: theme.spacing(8, 3),
  overflow: 'auto',
  boxSizing: 'border-box',
  [theme.breakpoints.up('md')]: {
    flexShrink: 0,
    padding: theme.spacing(10, 5),
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    padding: theme.spacing(6, 2),
  },
}));

export const StyledDiv = styled('div')(({ theme }) => ({
  width: '100%',
  justifyContent: 'space-between',
  alignContent:'flex-end'
}));
