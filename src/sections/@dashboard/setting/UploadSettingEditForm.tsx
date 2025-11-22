import * as Yup from 'yup';
import { useEffect, useMemo, useState } from 'react';
import { getData, updateSetting } from 'src/api/UpdateApi';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Box, Grid, Card, Stack} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, {
  RHFTextField,
} from '../../../components/hook-form';
import Loader from '../../../components/loading-screen';
// ----------------------------------------------------------------------

type FormValuesProps = {
  apiKey:string;
  authDomain:string;
  projectId: string;
  storageBucket: string;
  messagingSenderId:string;
  appId:string;
};

type Props = {
  isEdit?: boolean;
};

export default function UploadSettingEdit({isEdit = false}:Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [uploadData, setUploadData] = useState<FormValuesProps>();
  const [dataLoad, setDataLoad] = useState(false);

  const UpdateSettingSchema = Yup.object().shape({
    apiKey: Yup.string().required('Key is required'),
    authDomain: Yup.string().required('Auth domain is required'),
    projectId: Yup.string().required('Project id is required'),
    storageBucket: Yup.string().required('Storage bucket is required'),
    messagingSenderId: Yup.string().required('Messaging sender id is required'),
    appId: Yup.string().required('App id is required'),
  });


  const defaultValues = useMemo(
    () => ({
      apiKey: uploadData?.apiKey ? uploadData?.apiKey : "",
      authDomain:   uploadData?.authDomain ? uploadData?.authDomain : "",
      projectId:  uploadData?.projectId ? uploadData?.projectId : "",
      storageBucket: uploadData?.storageBucket ? uploadData?.storageBucket : "",
      messagingSenderId: uploadData?.messagingSenderId ? uploadData?.messagingSenderId : "",
      appId:   uploadData?.appId ? uploadData?.appId : "",
    }),
    // eslint-disable-next-lineuploadData react-hooks/exhaustive-deps
    [uploadData]
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(UpdateSettingSchema),
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const getSettingData = async() => {
    setDataLoad(true);
    const data = await getData();
    setUploadData(data?.uploadSettings);
    setDataLoad(false);
  } 

  const onSubmit = async (data: FormValuesProps) => {
    try {
        const payload = {
          apiKey: data?.apiKey,
          authDomain: data?.authDomain,
          projectId: data?.projectId,
          storageBucket: data?.storageBucket,
          messagingSenderId: data?.messagingSenderId,
          appId: data?.appId,
        };
        await updateSetting(payload);
        reset(defaultValues);
        enqueueSnackbar('Edit successfully!');
        getSettingData()
    } catch (error) {
      enqueueSnackbar(error.message ?? "Something went wrong. can't edit profile!", {
        variant: 'warning',
      });
    }
  };

  useEffect(() => {
    getSettingData()
  }, []);

  useEffect(() => {
    if (isEdit && uploadData) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ uploadData]);

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
              marginBottom={2.5}
            >
              <RHFTextField name="apiKey" placeholder="Api key" label="Api key" />
              <RHFTextField name="authDomain" placeholder="Auth domain" label="Auth domain"/>
              <RHFTextField name="projectId" placeholder="Project id" label="Project id" />
              <RHFTextField name="storageBucket" placeholder="Storage bucket" label="Storage bucket" />
              <RHFTextField name="messagingSenderId" placeholder="Messaging sender id" label="Messaging sender id"/>
              <RHFTextField name="appId" placeholder="App id" label="App id"/>
            </Box>
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
