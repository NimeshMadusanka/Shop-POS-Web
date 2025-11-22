import * as Yup from 'yup';
import { useEffect, useMemo, useState } from 'react';
import { getData, updateAboutUs } from 'src/api/UpdateApi';
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
  aboutUstitle:string;
  aboutUsdescription:string;
  aboutUsbackgroundImage: string;
};

type Props = {
  isEdit?: boolean;
};

export default function AboutNewEdit({isEdit = false}:Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [aboutUsData, setAboutUsData] = useState<FormValuesProps>();
  const [image, setImage] = useState('');
  const [dataLoad, setDataLoad] = useState(false);

  const UpdateUserSchema = Yup.object().shape({
    aboutUstitle: Yup.string().required("Title is required"),
    aboutUsdescription: Yup.string().min(3,"Minimum length for description is 3.").max(1500,"Maximum length for description is 1500.").required("Description is required"),
  });

  const defaultValues = useMemo(
    () => ({
      aboutUstitle: aboutUsData?.aboutUstitle ? aboutUsData?.aboutUstitle : "",
      aboutUsdescription:   aboutUsData?.aboutUsdescription ? aboutUsData?.aboutUsdescription : "",
      aboutUsbackgroundImage:  aboutUsData?.aboutUsbackgroundImage ? aboutUsData?.aboutUsbackgroundImage : "",
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [aboutUsData]
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
    setImage(data?.aboutUs?.aboutUsbackgroundImage);
    setAboutUsData(data?.aboutUs);
    setDataLoad(false);
   
  } 

  const onSubmit = async (data: FormValuesProps) => {
    try {
        const payload = {
          aboutUstitle: data?.aboutUstitle,
          aboutUsdescription: data?.aboutUsdescription,
          aboutUsbackgroundImage:image,
        };
        await updateAboutUs(payload);
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
    if (isEdit && aboutUsData) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ aboutUsData]);

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
              <RHFTextField name="aboutUstitle" placeholder="About us title" label="About us title" />
              <RHFTextField name="aboutUsdescription" placeholder="About Us Description" label="About us description" multiline rows={3} />
            </Box>
            <ImageUpload setImage={setImage} image={image} />
            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
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
                loading={isSubmitting} 
                >
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
