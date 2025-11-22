import * as Yup from 'yup';
import { useEffect, useMemo, useState } from 'react';
import { getSettingData, updateFooterColors } from 'src/api/SettingUpdate';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Typography, Grid,  Stack} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import ColouPicker from "../../../../pages/components/colorPicker/ColouPicker";
// components
import { useSnackbar } from '../../../../components/snackbar';
import FormProvider from '../../../../components/hook-form';
import Loader from '../../../../components/loading-screen';
// ----------------------------------------------------------------------

type FormValuesProps = {
  footertextColor:string;
  footerbackgroundColor:string;
};

type Props = {
  isEdit?: boolean;
};


export default function FooterNewEdit({isEdit = false}:Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [footerData, setFooterData] = useState<FormValuesProps>();
  const [dataLoad, setDataLoad] = useState(false);
  const [footertextColors, setFootertextColors] = useState("#000000");
  const [footerbackgroundColors, setFooterbackgroundColors] = useState("#000000");

    const UpdateUserSchema = Yup.object().shape({
      // footertextColor: Yup.string().required("Footer text color is required"),
      // footerbackgroundColor: Yup.string().required("Footer background color is required"),
    });
  
    const defaultValues = useMemo(
      () => ({
        footertextColor: footerData?.footertextColor ? footerData?.footertextColor : "",
        footerbackgroundColor:   footerData?.footerbackgroundColor ? footerData?.footerbackgroundColor : "",
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [footerData]
    );
  
    const methods = useForm<FormValuesProps>({
      resolver: yupResolver(UpdateUserSchema),
    });
  
    const {
      reset,
      handleSubmit,
      formState: { isSubmitting },
    } = methods;
  
    const getFooterColorData = async() => {
      setDataLoad(true);
      const data = await getSettingData();
      setFooterData(data?.property);
      setFootertextColors(data?.property?.footertextColor);
      setFooterbackgroundColors(data?.property?.footerbackgroundColor);
      setDataLoad(false);
    } 
  
    const onSubmit = async (data: FormValuesProps) => {
      try {
          const payload = {
            footertextColor: footertextColors,
            footerbackgroundColor: footerbackgroundColors,
          };
  
          await updateFooterColors(payload);
          reset(defaultValues);
          enqueueSnackbar('Edit successfully!');
  
      } catch (error) {
        enqueueSnackbar(error.message ?? "Can't edit colors!", {
          variant: 'warning',
        });
      }
    };
  
    useEffect(() => {
      getFooterColorData()
    }, []);
  
    useEffect(() => {
      if (isEdit && footerData) {
        reset(defaultValues);
      }
      if (!isEdit) {
        reset(defaultValues);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ footerData]);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      {dataLoad ? (
          <Loader />
        ) : (
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <Grid container spacing={2}>
            <Grid
              container
              item
              xs={12}
              sm={12}
              md={6}
              style={{
                display: "flex",
              }}
            >
              <Typography>Text color: </Typography>
              <ColouPicker
                color={footertextColors}
                setColor={setFootertextColors}
              />
            </Grid>
            <Grid
              container
              item
              xs={12}
              sm={12}
              md={6}
              style={{
                display: "flex",
              }}
            >
              <Typography>Background color: </Typography>
              <ColouPicker
                color={footerbackgroundColors}
                setColor={setFooterbackgroundColors}
              />
            </Grid>{" "}
          </Grid>
          <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton 
              type="submit" 
              variant="contained" 
              loading={isSubmitting} 
              sx={{
                backgroundColor: "#36B37E",
                fontWeight: 500,
                letterSpacing: 0,
                opacity: 1,
                ":hover": {
                  backgroundColor: "#34E0A1",
                },
              }}
              >
              Save Changes
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
        )}
    </FormProvider>
  );
}
