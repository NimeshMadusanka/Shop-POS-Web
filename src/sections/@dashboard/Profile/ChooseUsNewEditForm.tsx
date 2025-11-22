import * as Yup from 'yup';
import { useEffect, useMemo, useState } from 'react';
import { getData, updateChooseUs } from 'src/api/UpdateApi';

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
  title1: string;
  title2: string;
  title3: string;
  title4: string;
  description1: string;
  description4: string;
  description2: string;
  description3: string;
  image: string;
};

type Props = {
  isEdit?: boolean;
};

export default function ChooseNewEdit({isEdit = false}:Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [chooseUsData, setChooseUsData] = useState<FormValuesProps>();
  const [chooseImage, setImage] = useState('');
  const [dataLoad, setDataLoad] = useState(false);

  const UpdateUserSchema = Yup.object().shape({
    title1: Yup.string().required("Title is required"),
    title2: Yup.string().required("Title is required"),
    title3: Yup.string().required("Title is required"),
    title4: Yup.string().required("Title is required"),
    description1: Yup.string().min(3,"Minimum length for description is 3.").max(300,"Maximum length for description is 300.").required("Description is required"),
    description2: Yup.string().min(3,"Minimum length for description is 3.").max(300,"Maximum length for description is 300.").required("Description is required"),
    description3: Yup.string().min(3,"Minimum length for description is 3.").max(300,"Maximum length for description is 300.").required("Description is required"),
    description4: Yup.string().min(3,"Minimum length for description is 3.").max(300,"Maximum length for description is 300.").required("Description is required"),
  });

  const defaultValues = useMemo(
    () => ({
      title1: chooseUsData?.title1 ? chooseUsData?.title1 : "",
      title2: chooseUsData?.title2 ? chooseUsData?.title2 : "",
      title3: chooseUsData?.title3 ? chooseUsData?.title3 : "",
      title4: chooseUsData?.title4 ? chooseUsData?.title4 : "",
      description1:   chooseUsData?.description1 ? chooseUsData?.description1 : "",
      description2:   chooseUsData?.description2 ? chooseUsData?.description2 : "",
      description3:   chooseUsData?.description3 ? chooseUsData?.description3 : "",
      description4:   chooseUsData?.description4 ? chooseUsData?.description4 : "",
      image:  chooseUsData?.image ? chooseUsData?.image : "",
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chooseUsData]
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(UpdateUserSchema),
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const getChooseData = async() => {
    setDataLoad(true);
    const data = await getData();
    setImage(data?.chooseUs?.image);
    setChooseUsData(data?.chooseUs);
    setDataLoad(false);
   
  } 

  const onSubmit = async (data: FormValuesProps) => {
    try {
        const payload = {
          title1: data?.title1,
          title2: data?.title2,
          title3: data?.title3,
          title4: data?.title4,
          description1: data?.description1,
          description2: data?.description2,
          description3: data?.description3,
          description4: data?.description4,
          image:chooseImage,
        };
        await updateChooseUs( payload);
        reset(defaultValues);
        enqueueSnackbar('Edit successfully!');
        getChooseData()
    } catch (error) {
      enqueueSnackbar(error.message ?? "Something went wrong. Can't edit details!", {
        variant: 'warning',
      });
    }
  };

  useEffect(() => {
    getChooseData()
  }, []);

  useEffect(() => {
    if (isEdit && chooseUsData) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ chooseUsData]);

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
              <RHFTextField name="title1" placeholder="Title 1"  label="Title 1"/>
              <RHFTextField name="description1" placeholder="Description 1" label="Description 1" multiline rows={3} />
              <RHFTextField name="title2" placeholder="Title 2" label="Title 2" />
              <RHFTextField name="description2" placeholder="Description 2" label="Description 2" multiline rows={3} />
              <RHFTextField name="title3" placeholder="Title 3" label="Title 3" />
              <RHFTextField name="description3" placeholder="Description 3" label="Description 3" multiline rows={3} />
              <RHFTextField name="title4" placeholder="Title 4" label="Title 4" />
              <RHFTextField name="description4" placeholder="Description 4" label="Description 4" multiline rows={3} />
            </Box>
            <ImageUpload setImage={setImage} image={chooseImage} />
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
