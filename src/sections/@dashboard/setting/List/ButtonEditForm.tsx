import * as Yup from 'yup';
import { useEffect, useMemo, useState } from 'react';
import { getSettingData, updateButtonColors } from 'src/api/SettingUpdate';
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
  buttonTextColor:string;
  buttonBackgroundColor:string;
};

type Props = {
  isEdit?: boolean;
};


export default function ButtonNewEdit({isEdit = false}:Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [ButtonColorData, setButtonColorData] = useState<FormValuesProps>();

  const [buttonTextColors, setButtonTextColors] = useState("#000000");
  const [buttonBackgroundColors, setButtonBackgroundColors] = useState("#000000");

    const UpdateUserSchema = Yup.object().shape({
      // buttonTextColor: Yup.string().required("Button text color is required"),
      // buttonBackgroundColor: Yup.string().required("Button background color is required"),
    });
  
    const defaultValues = useMemo(
      () => ({
        buttonTextColor: ButtonColorData?.buttonTextColor ? ButtonColorData?.buttonTextColor : "",
        buttonBackgroundColor:   ButtonColorData?.buttonBackgroundColor ? ButtonColorData?.buttonBackgroundColor : "",
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [ButtonColorData]
    );
  
    const methods = useForm<FormValuesProps>({
      resolver: yupResolver(UpdateUserSchema),
    });
  
    const {
      reset,
      handleSubmit,
      formState: { isSubmitting },
    } = methods;
  
    const getButtonColorData = async() => {
      const data = await getSettingData();
      setButtonColorData(data?.property);
      setButtonTextColors(data?.property?.buttonTextColor);
      setButtonBackgroundColors(data?.property?.buttonBackgroundColor);
    } 
  
    const onSubmit = async (data: FormValuesProps) => {
      try {
          const payload = {
            buttonTextColor: buttonTextColors,
            buttonBackgroundColor: buttonBackgroundColors,
          };
  
          await updateButtonColors(payload);
          reset(defaultValues);
          enqueueSnackbar('Edit successfully!');
  
      } catch (error) {
        enqueueSnackbar(error.message ?? "Can't edit colors!", {
          variant: 'warning',
        });
      }
    };
  
    useEffect(() => {
      getButtonColorData()
    }, []);
  
    useEffect(() => {
      if (isEdit && ButtonColorData) {
        reset(defaultValues);
      }
      if (!isEdit) {
        reset(defaultValues);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ ButtonColorData]);

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
              <Typography>Text color: </Typography>
              <ColouPicker
                color={buttonTextColors}
                setColor={setButtonTextColors}
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
                color={buttonBackgroundColors}
                setColor={setButtonBackgroundColors}
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
    </FormProvider>
  );
}
