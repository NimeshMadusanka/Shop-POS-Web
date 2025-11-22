import * as Yup from 'yup';
import { useEffect, useMemo, useState } from 'react';
import { getSettingData, updatePrimaryColors } from 'src/api/SettingUpdate';
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
// ----------------------------------------------------------------------

type FormValuesProps = {
  primaryColor:string;
  primaryTextColor:string;
  sectionBackgroundColor: string;
  fontFamily: string;
};

type Props = {
  isEdit?: boolean;
};


export default function PrimaryNewEdit({isEdit = false}:Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [primaryData, setPrimaryData] = useState<FormValuesProps>();

  const [primaryColors, setPrimaryColor] = useState("#fffff");
  const [primaryTextColors, setPrimaryTextColor] = useState("#fffff");
  const [sectionBackgroundColors, setSectionBackgroundColor] = useState("#fffff");

    const UpdateUserSchema = Yup.object().shape({
      primaryColor: Yup.string().required("Primary Color is required"),
      primaryTextColor: Yup.string().required("Primary Text Color is required"),
      sectionBackgroundColor: Yup.string().required("Section Background Color is required"),
      fontFamily: Yup.string().required("Font Family is required"),
    });
  
    const defaultValues = useMemo(
      () => ({
        primaryColor: primaryData?.primaryColor ? primaryData?.primaryColor : "",
        primaryTextColor:   primaryData?.primaryTextColor ? primaryData?.primaryTextColor : "",
        sectionBackgroundColor:  primaryData?.sectionBackgroundColor ? primaryData?.sectionBackgroundColor : "",
        fontFamily: primaryData?.fontFamily ? primaryData?.fontFamily : "",
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [primaryData]
    );
  
    const methods = useForm<FormValuesProps>({
      resolver: yupResolver(UpdateUserSchema),
    });
  
    const {
      reset,
      handleSubmit,
      formState: { isSubmitting },
    } = methods;
  
    const getPrimaryColorData = async() => {
      const data = await getSettingData();
      setPrimaryData(data?.property);
      setPrimaryColor(data?.property?.primaryColor);
      setPrimaryTextColor(data?.property?.primaryTextColor);
      setSectionBackgroundColor(data?.property?.sectionBackgroundColor);
    } 
  
    const onSubmit = async (data: FormValuesProps) => {
      try {
          const payload = {
            primaryColor: primaryColors,
            primaryTextColor: primaryTextColors,
            sectionBackgroundColor: sectionBackgroundColors,
            fontFamily: data?.fontFamily,
          };
  
          await updatePrimaryColors(payload);
          reset(defaultValues);
          enqueueSnackbar('Edit successfully!');
  
      } catch (error) {
        enqueueSnackbar(error.message ?? "Can't edit colors!", {
          variant: 'warning',
        });
      }
    };
  
    useEffect(() => {
      getPrimaryColorData()
    }, []);
  
    useEffect(() => {
      if (isEdit && primaryData) {
        reset(defaultValues);
      }
      if (!isEdit) {
        reset(defaultValues);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ primaryData]);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
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
              <Typography>Primary color: </Typography>
              <ColouPicker
                color={primaryColors}
                setColor={setPrimaryColor}
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
              <Typography>Primary text color: </Typography>
              <ColouPicker
                color={primaryTextColors}
                setColor={setPrimaryTextColor}
              />
            </Grid>{" "}
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
              <Typography>Section background color: </Typography>
              <ColouPicker
                color={sectionBackgroundColors}
                setColor={setSectionBackgroundColor}
              />
            </Grid>
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
    </FormProvider>
  );
}
