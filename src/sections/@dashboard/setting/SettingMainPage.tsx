// @mui
import {Grid, CardHeader } from '@mui/material';

import PrimaryEditForm from "./List/PrimaryEditForm";
import FooterEditForm from "./List/FooterEditForm";
import OfferEditForm from "./List/OfferEditForm";
import ButtonEditForm from "./List/ButtonEditForm";
import SearchEditForm from "./List/SearchEditForm";

// ----------------------------------------------------------------------

export default function SettingMainPage() {

  return (
      <Grid container spacing={3}>
          <Grid item xs={12} md={12} mb={3}>
             <CardHeader title="Primary styles" sx={{paddingLeft:"0", marginBottom:"3rem"}} />
            <PrimaryEditForm />
            <hr/>
          </Grid>
          <Grid item xs={12} md={12} mb={3}>
           <CardHeader title="Footer styles" sx={{paddingLeft:"0", marginBottom:"3rem"}}/>
            <FooterEditForm />
            <hr/>
          </Grid>
          <Grid item xs={12} md={12} mb={3}>
           <CardHeader title="Offer styles" sx={{paddingLeft:"0", marginBottom:"3rem"}}/>
            <OfferEditForm />
            <hr/>
          </Grid>
          <Grid item xs={12} md={12} mb={3}>
           <CardHeader title="Button styles" sx={{paddingLeft:"0", marginBottom:"3rem"}}/>
            <ButtonEditForm />
            <hr/>
          </Grid>
          <Grid item xs={12} md={12} mb={3}>
           <CardHeader title="Search bar styles" sx={{paddingLeft:"0", marginBottom:"3rem"}}/>
            <SearchEditForm />
          </Grid>
      </Grid>
  );
}
