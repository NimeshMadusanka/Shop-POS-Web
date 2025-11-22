import { Helmet } from 'react-helmet-async';
// @mui
import { Divider } from '@mui/material';
// sections
import { AboutHero, AboutWhat, AboutTeam, AboutVision } from '../sections/about';

// ----------------------------------------------------------------------

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title> About us | PRS Client Portal </title>
      </Helmet>

      <AboutHero />

      <AboutWhat />

      <AboutVision />

      <Divider orientation="vertical" sx={{ my: 10, mx: 'auto', width: 2, height: 40 }} />

      <AboutTeam />
    </>
  );
}
