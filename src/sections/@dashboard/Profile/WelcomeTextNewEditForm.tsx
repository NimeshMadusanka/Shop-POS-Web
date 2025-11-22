import * as Yup from 'yup';
import { useEffect, useMemo, useState } from 'react';
import { getData, updateWelcomText } from 'src/api/UpdateApi';

// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Box, Grid, Card, Stack} from '@mui/material';
import { LoadingButton } from '@mui/lab';

import ImageUpload from "../../../pages/components/imageUpload/ImageUpload";
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, {
  RHFTextField,
} from '../../../components/hook-form';
import Loader from '../../../components/loading-screen';

// ----------------------------------------------------------------------

type FormValuesProps = {
  welcometext:string;
  welcomedescription:string;
  welcomeimage1: string;
  welcomeimage2: string;
  welcomeimage3: string;
  welcomeimage4: string;
  welcomeimage5: string;
};

type Props = {
  isEdit?: boolean;
};

export default function WelcomeNewEdit({isEdit = false}:Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [welcomeData, setWelcomeData] = useState<FormValuesProps>();
  const [image1, setImage1] = useState('');
  const [image2, setImage2] = useState('');
  const [image3, setImage3] = useState('');
  const [image4, setImage4] = useState('');
  const [image5, setImage5] = useState('');
  const [dataLoad, setDataLoad] = useState(false);

  const UpdateUserSchema = Yup.object().shape({
    welcometext: Yup.string().min(3,"Minimum length for welcome text is 3.").max(150,"Maximum length for welcome text is is 150.").required("Welcome text is required"),
    welcomedescription: Yup.string().min(3,"Minimum length for description is 3.").max(1000,"Maximum length for description is 1000.").required("Description is required"),
  });

  const defaultValues = useMemo(
    () => ({
      welcometext: welcomeData?.welcometext ? welcomeData?.welcometext : "",
      welcomedescription:   welcomeData?.welcomedescription ? welcomeData?.welcomedescription : "",
      welcomeimage1:  welcomeData?.welcomeimage1 ? welcomeData?.welcomeimage1 : "",
      welcomeimage2:  welcomeData?.welcomeimage2 ? welcomeData?.welcomeimage2 : "",
      welcomeimage3:  welcomeData?.welcomeimage3 ? welcomeData?.welcomeimage3 : "",
      welcomeimage4:  welcomeData?.welcomeimage4 ? welcomeData?.welcomeimage4 : "",
      welcomeimage5:  welcomeData?.welcomeimage5 ? welcomeData?.welcomeimage5 : "",
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [welcomeData]
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(UpdateUserSchema),
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const getAboutData = async() => {
    setDataLoad(true);
    const data = await getData();
    setImage1(data?.welcomeText?.welcomeimage1);
    setImage2(data?.welcomeText?.welcomeimage2);
    setImage3(data?.welcomeText?.welcomeimage3);
    setImage4(data?.welcomeText?.welcomeimage4);
    setImage5(data?.welcomeText?.welcomeimage5);
    setWelcomeData(data?.welcomeText);
    setDataLoad(false);
   
  } 

  const onSubmit = async (data: FormValuesProps) => {
    try {
        const payload = {
          welcometext: data?.welcometext,
          welcomedescription: data?.welcomedescription,
          welcomeimage1:image1,
          welcomeimage2:image2,
          welcomeimage3:image3,
          welcomeimage4:image4,
          welcomeimage5:image5,
        };
        await updateWelcomText(payload);
        reset(defaultValues);
        enqueueSnackbar('Edit successfully!');
        getAboutData()
    } catch (error) {
      enqueueSnackbar(error.message ?? "Something went wrong. Can't edit about!", {
        variant: 'warning',
      });
    }
  };

  useEffect(() => {
    getAboutData()
  }, []);

  useEffect(() => {
    if (isEdit && welcomeData) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ welcomeData]);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      {dataLoad ? (
        <Loader/>
      ):(
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="welcometext" placeholder="Welcome text" label="Welcome text" />
              <RHFTextField name="welcomedescription" placeholder="Welcome Description"label="Welcome description" multiline rows={3} />
            </Box>

            <Grid container pb={2}>
              <Grid item lg={4} md={4} sm={4} xs={12}>
                <ImageUpload setImage={setImage1} image={image1} name="image1" />
              </Grid>
              <Grid item lg={4} md={4} sm={4} xs={12}>
                <ImageUpload setImage={setImage2} image={image2} name="image2" />
              </Grid>
              <Grid item lg={4} md={4} sm={4} xs={12}>
                <ImageUpload setImage={setImage3} image={image3} name="image3" />
              </Grid>
            </Grid>

            <Grid container pb={2}>
              <Grid item lg={4} md={4} sm={4} xs={12}>
                <ImageUpload setImage={setImage4} image={image4} name="image4" />
              </Grid>
              <Grid item lg={4} md={4} sm={4} xs={12}>
              <ImageUpload setImage={setImage5} image={image5} name="image5" />
            </Grid>
            </Grid>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton 
                disabled={!image1 && !image2 && !image3 && !image4 && !image5}
                sx={{
                  backgroundColor: "#36B37E",
                  fontWeight: 500,
                  letterSpacing: 0,
                  opacity: 1,
                  ":hover": {
                    backgroundColor: "#34E0A1",
                  },
                }}
                type="submit" 
                variant="contained" 
                loading={isSubmitting} >
                Save Changes
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
      )}
    </FormProvider>
  );
}
